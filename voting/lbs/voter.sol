// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

library VoterLib {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct VoterOverview {
        address voter;
        uint votedProposalId;
    }

    function register(Voter storage voter) internal {
        voter.isRegistered = true;
    }

    function unregister(Voter storage voter) internal {
        clearVote(voter);
        voter.isRegistered = false;
    }

    function vote(Voter storage voter, uint proposalId) internal {
        require(!voter.hasVoted, "Error: voter has alread voted.");
        voter.votedProposalId = proposalId;
        voter.hasVoted = true;
    }

    function clearVote(Voter storage voter) internal {
        voter.hasVoted = false;
        voter.votedProposalId = 0;
    }
}