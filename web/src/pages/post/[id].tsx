import {
  Box,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { createUrqlClient } from "../../utils/createUrqlClient";
import {
  useAddCommentMutation,
  useMeQuery,
  usePostQuery,
} from "../../generated/graphql";
import { Layout } from "../../components/Layout";
import { useGetIntId } from "../../utils/uesGetIntId";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { useRouter } from "next/router";
import { ChatIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useCommentsQuery } from "./../../generated/graphql";
import { CommentBox } from "../../components/CommentBox";

export const Post: React.FC = () => {
  const router = useRouter();
  const [{ data: userData }] = useMeQuery();

  // -1 ==> not adding comments
  // 0 ==> adding comment on post
  // commentId ==> adding reply on first level comment
  const [isAddComment, setIsAddComment] = useState(-1);

  let intId = useGetIntId();
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      postId: intId,
    },
  });

  const [{ data: commentData, fetching: commentFetching }] = useCommentsQuery({
    pause: intId === -1,
    variables: {
      postId: intId,
    },
  });

  if (fetching) {
    return (
      <Layout>
        <Flex alignItems="center" justifyContent="center" flex={1}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Heading size="lg">{error.message}</Heading>
      </Layout>
    );
  }

  if (!data || !data.post) {
    return (
      <Layout>
        <Heading size="lg">Could not find Post!</Heading>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading size="xl">{data.post.title}</Heading>
      <Box my={4}>
        <Heading color="#00a3f1" size="sm">
          By: {data.post.creator.username}
        </Heading>
      </Box>
      <Box mb={8}>{data.post.text}</Box>
      <Flex direction="row">
        <EditDeletePostButtons
          id={data.post.id}
          creatorId={data.post.creator.id}
          postDelete={() => router.push("/")}
        />
        <IconButton
          ml={4}
          icon={<ChatIcon />}
          aria-label="Add Comment"
          onClick={() => {
            if (!userData?.me?.id) {
              router.push("/login?next=" + router.pathname);
            }
            setIsAddComment(0);
          }}
        ></IconButton>
      </Flex>
      <Flex>
        {commentFetching ? (
          <Flex alignItems="center" justifyContent="center" flex={1}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Flex>
        ) : !commentData?.comments || commentData.comments.length === 0 ? (
          <Box flex={1}>
            <Heading size="lg">Post has no Comments</Heading>
            {isAddComment === 0 ? (
              <Stack spacing={8} p={5}>
                <CommentBox
                  userId={userData!.me!.id}
                  postId={intId}
                  discarded={() => {
                    setIsAddComment(-1);
                  }}
                  donePosting={() => {
                    setIsAddComment(-1);
                  }}
                  isOnComment={false}
                />
              </Stack>
            ) : null}
          </Box>
        ) : (
          <Stack spacing={8} p={5} flex={1}>
            <Heading size="lg"> Comments</Heading>
            {isAddComment === 0 ? (
              <CommentBox
                userId={userData!.me!.id}
                postId={intId}
                discarded={() => {
                  setIsAddComment(-1);
                }}
                donePosting={() => {
                  setIsAddComment(-1);
                }}
                isOnComment={false}
              />
            ) : null}
            {commentData.comments.map((comment) => (
              <Box
                key={comment.id}
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius={20}
              >
                <Heading color="#00a3f1" size="sm">
                  By: {comment.user.username}
                </Heading>
                <Box mb={8}>{comment.text}</Box>
                <Box>
                  <IconButton
                    ml={4}
                    icon={<ChatIcon />}
                    aria-label="Add Reply"
                    onClick={() => {
                      if (!userData?.me?.id) {
                        router.push("/login?next=" + router.pathname);
                      }
                      setIsAddComment(comment.id);
                    }}
                  ></IconButton>
                </Box>
                {isAddComment === comment.id ? (
                  <Box flex={1}>
                    <CommentBox
                      userId={userData!.me!.id}
                      postId={intId}
                      discarded={() => {
                        setIsAddComment(-1);
                      }}
                      donePosting={() => {
                        setIsAddComment(-1);
                      }}
                      isOnComment={true}
                      commentId={comment.id}
                    />
                  </Box>
                ) : null}
                {comment.childComments && comment.childComments.length > 0 ? (
                  <Stack spacing={8} p={5} ml={8}>
                    {comment.childComments.map((childComment) => (
                      <Box key={childComment.id} borderBottomWidth="1px">
                        <Heading color="#00a3f1" size="sm">
                          By: {childComment.user.username}
                        </Heading>
                        <Box mb={8}>{childComment.text}</Box>
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Box>
            ))}
          </Stack>
        )}
      </Flex>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Post);
