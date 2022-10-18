// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}

contract WorkflowStatusHandler {
    uint currentStatusId = 0;

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);


    function getStatus() public view returns(WorkflowStatus) {
        return WorkflowStatus(currentStatusId);
    }

    function next() public {
        require(getStatus() != WorkflowStatus.VotesTallied, "Voting already done. Reset it for a new ballot.");
        currentStatusId++;
        emit WorkflowStatusChange(WorkflowStatus(currentStatusId - 1), getStatus());
    }

    function reset() public {
        require(getStatus() == WorkflowStatus.VotesTallied, "Voting is not over. Finalize it before reset.");
        currentStatusId = 0;
        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, getStatus());
    }

    function isAfter(WorkflowStatus status) public view returns(bool) {
        return uint(status) < currentStatusId;
    }
}