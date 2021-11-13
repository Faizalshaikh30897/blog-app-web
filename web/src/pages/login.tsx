import React from "react";
import { Form, Formik } from "formik";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "./../components/InputField";

import { toErrorMap } from "./../utils/toErrorMap";
import { useRouter } from "next/router";
import { useLoginMutation } from "./../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [{}, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Login</h1>

        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login({
              usernameOrEmail: values.usernameOrEmail,
              password: values.password,
            });
            // console.log(response);
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                router.push("/");
              }
            }
          }}
        >
          {({ isSubmitting }) => {
            return (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  placeholder="Username OR Email"
                  label="Username OR Email"
                />
                <Box mt={4}>
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                </Box>

                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                  mt={4}
                >
                  Login
                </Button>
                <Flex mt={2}>
                  <NextLink href="/forgot-password">
                    <Link ml="auto">Forgot Password?</Link>
                  </NextLink>
                </Flex>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
