import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Flex,
  Box,
  Textarea,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAddCommentMutation } from "../generated/graphql";

interface CommentBoxProps {
  postId: number;
  userId: number;
  isOnComment: boolean;
  commentId?: number;
  donePosting: () => void;
  discarded: () => void;
}

export const CommentBox: React.FC<CommentBoxProps> = ({
  postId,
  userId,
  isOnComment,
  commentId,
  donePosting,
  discarded,
}) => {
  const [{}, addComment] = useAddCommentMutation();
  const [newComment, setNewComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef() as React.RefObject<any>;
  const toast = useToast();

  const saveComment = async () => {
    let result = null;
    if (isOnComment) {
      console.log("here", commentId);
      result = await addComment({
        text: newComment,
        parentId: commentId,
      });
      console.log("result ", result);
    } else {
      result = await addComment({
        text: newComment,
        postId,
      });
    }
    if (result.error) {
      toast({
        title: "Error",
        description: "Something went wrong cant post your comment!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      
      donePosting();
    }
  };

  return (
    <Flex flex={1} direction="row">
      <Box flex={1}>
        <Textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Say something nice....."
          size="sm"
        />
      </Box>
      <Flex direction="column" justify="space-around">
        <IconButton
          ml={4}
          icon={<CheckIcon />}
          aria-label="Post Comment.."
          onClick={saveComment}
        ></IconButton>
        <IconButton
          ml={4}
          icon={<CloseIcon />}
          aria-label="Discard comment"
          onClick={() => setIsOpen(true)}
        ></IconButton>
      </Flex>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Are you sure?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to cancel, All changes will be discarded.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                setIsOpen(false);
                discarded();
              }}
              ml={3}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
};
