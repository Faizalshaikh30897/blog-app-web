import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "./../generated/graphql";
import { Layout } from "./../components/Layout";
import NextLink from "next/link";
import {
  Link,
  Heading,
  Stack,
  Box,
  Flex,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { SinglePost } from "../components/SinglePost";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({ variables });

  const headingBox = (
    <Flex alignItems="center" justifyContent="space-between">
      <Heading>Discover the world!</Heading>

      <NextLink href="/create-post">
        <Button as={Link} colorScheme="teal" fontSize={14}>
          Create New Post
        </Button>
      </NextLink>
    </Flex>
  );

  if (!fetching && (!data || data.posts.posts.length === 0)) {
    return (
      <Layout variant="regular">
        {headingBox}
        <Box>
          <Heading size="md">There are no posts to Show!</Heading>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      {headingBox}
      {!data && fetching ? (
        <Flex alignItems="center" justifyContent="center" flex={1}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      ) : (
        // <div>
        //   <hr />
        //   <Heading size="lg">Explore Posts...</Heading>
        //   <hr />
        //   {data.posts.map((post)=> <div key ={post.id}>
        //     <Heading size="md">{post.title}</Heading>
        //     <p>{post.text}</p>
        //   </div>)}
        // </div>
        <Stack spacing={8} p={5}>
          {data!.posts.posts.map((post) =>
            !post ? null : <SinglePost post={post} key={post.id} />
          )}
        </Stack>
      )}
      {data ? (
        !data.posts.hasMore ? null : (
          <Flex>
            <Button
              m="auto"
              type="button"
              colorScheme="teal"
              my={4}
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
            >
              Load More
            </Button>
          </Flex>
        )
      ) : null}
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
