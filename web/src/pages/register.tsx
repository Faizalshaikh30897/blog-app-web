import React from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "./../components/InputField";
import { useRegisterMutation } from "./../generated/graphql";
import { toErrorMap } from "./../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [{}, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Register</h1>

        <Formik
          initialValues={{ username: "", password: "", email: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await register({ userData: values });
            // console.log(response);
            if (response.data?.register.errors) {
              setErrors(toErrorMap(response.data.register.errors));
            } else if (response.data?.register.user) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => {
            return (
              <Form>
                <InputField
                  name="username"
                  placeholder="username"
                  label="Username"
                />
                <InputField name="email" placeholder="Email" label="Email" />
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
                  Register
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Register);
