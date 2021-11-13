import { Box, Button, Flex, Heading, Spinner } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/uesGetIntId";
import { useIsAuth } from "../../../utils/useIsAuth";
import {
  usePostQuery,
  useUpdatePostMutation
} from "./../../../generated/graphql";

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [, updatePost] = useUpdatePostMutation();

  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      postId: intId,
    },
  });

  useIsAuth();

  if (fetching) {
    return (
      <Flex alignItems="center" justifyContent="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Flex>
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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ ...values, id: intId });
          router.back();
        }}
      >
        {({ isSubmitting }) => {
          return (
            <Form>
              <InputField name="title" placeholder="Title" label="Title" />
              <Box mt={4}>
                <InputField
                  textarea
                  numOfRows={10}
                  name="text"
                  placeholder="text..."
                  label="Text"
                />
              </Box>

              <Button
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
                mt={4}
              >
                Update Post
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
