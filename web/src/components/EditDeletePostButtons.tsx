import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
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
  IconButton,
  Link,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useMeQuery, useDeletePostMutation } from "../generated/graphql";
import NextLink from "next/link";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
  postDelete: () => void;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
  postDelete
}) => {
  const [{ data }] = useMeQuery();
  const [{}, deletePost] = useDeletePostMutation();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef() as React.RefObject<any>;
  const toast = useToast();

  return (
    <Box>
      {data?.me?.id !== creatorId ? null : (
        <Box>
          <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
            <IconButton
              as={Link}
              icon={<EditIcon />}
              aria-label="Update Post"
            ></IconButton>
          </NextLink>
          <IconButton
            ml={4}
            icon={<DeleteIcon />}
            aria-label="Delete Post"
            onClick={async () => {
              setIsOpen(true);
            }}
          ></IconButton>
        </Box>
      )}
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Delete this Post?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete the post, This action cannot be
            reverted!.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                const resposne = await deletePost({
                  id,
                });
                if (resposne.error?.message.includes("not authorized")) {
                  toast({
                    title: "Cannot Delete",
                    description:
                      "You can only delete post that you have created!!",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                  });
                }
                else{
                  postDelete();
                }
                setIsOpen(false);
              }}
              ml={3}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};
