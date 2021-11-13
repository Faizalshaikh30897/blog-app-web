import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { useVoteMutation } from "./../generated/graphql";

interface VoteSectionProps {
  points: number;
  postId: number;
  voteStatus: number | null ;
}

export const VoteSection: React.FC<VoteSectionProps> = ({
  points,
  postId,
  voteStatus,
}) => {
  const [loadingState, setLoadingState] = useState<
    "not-loading" | "updoot-loading" | "downdoot-loading"
  >("not-loading");
  const [{}, vote] = useVoteMutation();

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        size="sm"
        colorScheme={voteStatus === 1 ? "green" : undefined}
        aria-label="Updoot Post"
        isLoading={loadingState === "updoot-loading"}
        
        onClick={() => {
          if (voteStatus === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          vote({
            postId,
            vote: 1,
          });
          setLoadingState("not-loading");
        }}
        icon={<ChevronUpIcon />}
      />
      <Heading size="sm">{points}</Heading>
      <IconButton
        size="sm"
        colorScheme={voteStatus === -1 ? "red" : undefined}
        aria-label="DownDoot Post"
        isLoading={loadingState === "downdoot-loading"}
        
        onClick={() => {
          if (voteStatus === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          vote({
            postId,
            vote: -1,
          });
          setLoadingState("not-loading");
        }}
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};
