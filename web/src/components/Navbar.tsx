import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "./../generated/graphql";
import { isServer } from "./../utils/isServer";
import { useRouter } from "next/router";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), // make sure the query does not run on server when server side rendering, it will still run on client
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Box ml={"auto"}>
        <NextLink href="/login">
          <Link mr={2} fontSize={14} color={"brown"}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link fontSize={14} color={"brown"}>
            Register
          </Link>
        </NextLink>
      </Box>
    );
  } else {
    body = (
      <Box ml={"auto"}>
        <Flex>
          <Box color={"brown"} mr={4}>
            {data.me.username}
          </Box>
          <Button
            variant="link"
            color={"brown"}
            isLoading={logoutFetching}
            onClick={async () => {
              await logout();
              router.reload();
            }}
          >
            Logout
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex
      bg="tan"
      position="sticky"
      top={0}
      zIndex={1}
      p={4}
      alignItems="center"
    >
      <NextLink href="/">
        <Link>
          <Heading>RedditClone</Heading>
        </Link>
      </NextLink>
      {body}
    </Flex>
  );
};
