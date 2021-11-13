import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useState } from "react";
import { PostSnippetFragment, useMeQuery } from "../generated/graphql";
import { useDeletePostMutation } from "./../generated/graphql";
import { EditDeletePostButtons } from "./EditDeletePostButtons";
import { VoteSection } from "./VoteSection";

interface SinglePostProps {
  post: PostSnippetFragment;
}

export const SinglePost: React.FC<SinglePostProps> = ({ post }) => {
  return (
    <Flex p={5} shadow="md" borderWidth="1px" borderRadius={20}>
      <VoteSection
        points={post.points}
        postId={post.id}
        voteStatus={post.voteStatus ? post.voteStatus : null}
      />
      <Flex flex={1} justifyContent="space-between">
        <Box>
          <NextLink href="/post/[id]" as={`/post/${post.id}`}>
            <Link>
              <Heading fontSize="xl">{post.title}</Heading>
            </Link>
          </NextLink>
          <Text>by: {post.creator.username}</Text>
          <Text mt={4}>{post.textSnippet}...</Text>
        </Box>
        <EditDeletePostButtons
          id={post.id}
          creatorId={post.creator.id}
          postDelete={() => {}}
        />
      </Flex>
    </Flex>
  );
};
