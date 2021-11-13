import { Box, Button, Text, Link, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";

import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useResetPasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";

import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";

interface ChangePasswordProps {
  token: string;
}

const ChangePassword: NextPage<ChangePasswordProps> = ({ token }) => {
  const router = useRouter();
  const [{}, resetPassword] = useResetPasswordMutation();
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Set new password</h1>

        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await resetPassword({
              token,
              newPassword: values.newPassword,
            });
            // console.log(response);
            if (response.data?.resetPassword.errors) {
              const errorMap = toErrorMap(response.data.resetPassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              } else {
                setTokenError("");
              }

              setErrors(errorMap);
            } else if (response.data?.resetPassword.user) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => {
            return (
              <Form>
                <InputField
                  name="newPassword"
                  placeholder="New Password"
                  label="New Password"
                  type="password"
                />
                {tokenError ? (
                  <Flex direction="column">
                    <Box style={{color:"red"}}>{tokenError}</Box>
                    <Text>
                      <NextLink href="/forgot-password">
                        <Link style={{color:"blue"}}>Reset password </Link>
                      </NextLink>
                      Again
                    </Text>
                  </Flex>
                ) : null}
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                  mt={4}
                >
                  Reset password
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient, { ssr: false })(
  ChangePassword as any
);
