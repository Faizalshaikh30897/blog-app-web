import { debugExchange, fetchExchange, gql } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  ResetPasswordMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import { isServer } from "./isServer";

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const results: string[] = [];
    const isInCache = cache.resolve(
      cache.resolve(
        entityKey,
        `${fieldName}${JSON.stringify(fieldArgs)}`
      ) as string,
      "posts"
    );
    info.partial = !isInCache;
    let hasMore = true;
    fieldInfos.forEach((fi) => {
      const subEntityKey = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(subEntityKey, fieldName) as string[];
      const _hasMore = cache.resolve(subEntityKey, "hasMore") as boolean;
      if (!_hasMore) {
        hasMore = _hasMore;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      posts: results,
      hasMore,
    };
  };
};

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error) {
        if (error.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      }
    })
  );
};

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const postsFields = allFields.filter((field) => field.fieldName === "posts");
  postsFields.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = null;
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      // debugExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            addComment: (_result, args, cache, info) => {
              const allFields = cache.inspectFields("Query");
              console.log(allFields);
              const commentsFields = allFields.filter(
                (field) => field.fieldName === "comments"
              );
              commentsFields.forEach((fi) => {
                cache.invalidate("Query", "comments", fi.arguments || {});
              });
            },
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, info) => {
              const { postId, vote } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );

              if (data) {
                if (data.voteStatus === vote) {
                  return;
                }
                const newPoints: number =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * vote;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: vote }
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              invalidateAllPosts(cache);
            },
            resetPassword: (_result, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, data => {})
              betterUpdateQuery<ResetPasswordMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.resetPassword.errors) {
                    return query;
                  }
                  return {
                    me: result.resetPassword.user,
                  };
                }
              );
            },
            logout: (_result, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, data => {})
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => {
                  return {
                    me: null,
                  };
                }
              );
            },
            login: (_result, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, data => {})
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPosts(cache);
            },
            register: (_result, args, cache, info) => {
              // cache.updateQuery({query: MeDocument}, data => {})
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
