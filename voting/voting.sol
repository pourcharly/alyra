// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";
import "./workflow-status.sol";
import "./libs/indexed-voters.sol";
import "./libs/voter.sol";
import "./proposal-handler.sol";

contract Voting is Ownable {
    struct Results {
        VoterLib.VoterOverview[] voters; // voter => votedProposalId
        ProposalHandler.FullProposal[] proposals;
        uint winningProposalId;
    }

    using VoterLib for VoterLib.Voter;
    using IndexedVoterListLib for IndexedVoterListLib.IndexedVoterList;
    IndexedVoterListLib.IndexedVoterList voters;
    WorkflowStatusHandler lifecycle = new WorkflowStatusHandler();
    ProposalHandler proposals = new ProposalHandler();
    ProposalHandler.FullProposal[] winners;
    uint winningProposalId;
    bool isArchived; 

    // Events

    event Voted(address voter, uint proposalId);
    event Archived(Results archive); // Emitted when the voting data are archived
    event Reseted(WorkflowStatus status); // Emitted when the voting is reinitialize

    // Modifiers

    modifier onlyVoter() {
        require(voters.isRegistered(msg.sender), "Forbidden: caller is not a voter.");
        _;
    }

    modifier onlyRegistered() {
        require(owner() == msg.sender || voters.isRegistered(msg.sender), "Forbidden: caller is not allowed.");
        _;
    }

    modifier statusIs(WorkflowStatus requiredStatus) {
        require(requiredStatus == lifecycle.getStatus(), "Not allowed: current workflow status forbide it");
        _;
    }

    modifier fromStatus(WorkflowStatus status) {
        require(status == lifecycle.getStatus() || lifecycle.isAfter(status), "Not allowed: current workflow status forbide it");
        _;
    }

    // Functions

    function nextStatus() public onlyOwner {
        WorkflowStatus status = lifecycle.getStatus();
        if (status == WorkflowStatus.RegisteringVoters) {
            require(voters.length() > 0, "Next status aborted: No voter.");
        } else if (status == WorkflowStatus.ProposalsRegistrationStarted) {
            require(proposals.length() > 0, "Next Status aborted: No proposal.");
        } else if (status == WorkflowStatus.VotingSessionStarted) {
            require(voters.hasVoted(), "Next Status aborted: everyone dit not vote.");
        }

        if (status == WorkflowStatus.VotingSessionEnded) {
            tallieVotes();
        }
        lifecycle.next();
    }

    function getStatus() public view onlyRegistered returns(WorkflowStatus) {
        return lifecycle.getStatus();   
    }

    function addVoter(address voterAddress) public onlyOwner statusIs(WorkflowStatus.RegisteringVoters) {
        voters.register(voterAddress);
    }

    function getVoterList() public view onlyRegistered fromStatus(WorkflowStatus.RegisteringVoters) returns(address[] memory) {
        return voters.getList();
    }

    function removeVoter(address voterAddress) public onlyOwner statusIs(WorkflowStatus.RegisteringVoters) {
        voters.unregister(voterAddress);
    }

    function submitProposal(string memory description) public onlyVoter statusIs(WorkflowStatus.ProposalsRegistrationStarted) returns(uint) {
        return proposals.add(description, msg.sender);
    }
    
    function EditProposal(uint proposalId, string memory description) public onlyVoter statusIs(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.set(proposalId, description, msg.sender);
    }
    
    function removeProposal(uint proposalId) public onlyVoter statusIs(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.remove(proposalId, msg.sender);
    }

    function getMyProposals() public view onlyVoter fromStatus(WorkflowStatus.ProposalsRegistrationStarted) returns(ProposalHandler.FullProposal[] memory) {
        return proposals.getListFromAuthor(msg.sender);
    }

    function getProposalDescription(uint proposalId) public view onlyVoter fromStatus(WorkflowStatus.ProposalsRegistrationStarted) returns(string memory) {
        return proposals.getDescription(proposalId);
    }

    function getAllProposals() public view onlyVoter fromStatus(WorkflowStatus.ProposalsRegistrationStarted) returns(ProposalHandler.FullProposal[] memory) {
        return proposals.getFullList();
    }

    function vote(uint proposalId) public  onlyVoter statusIs(WorkflowStatus.VotingSessionStarted) */ {
        require(proposals.exists(proposalId), "Error: unknown proposal.");
        voters.map[msg.sender].vote(proposalId);
        proposals.vote(proposalId);
        emit Voted(msg.sender, proposalId);
    }

    function tallieVotes() private {
        proposals.tallieVotes();
        uint[] memory winnersIds = proposals.getWinnersIds();
        winningProposalId = winnersIds.length > 1 ? 0 : winnersIds[0]; // id 0 is used to express "No winner"
    }

    function getVotes() public view onlyVoter fromStatus(WorkflowStatus.VotingSessionStarted) returns(VoterLib.VoterOverview[] memory)  {
        return voters.getVotes();
    }

    function getWinner() public view onlyRegistered statusIs(WorkflowStatus.VotesTallied) returns(ProposalHandler.Proposal memory) {
        return proposals.get(winningProposalId);
    }

    function getResultsDetails() public view onlyRegistered statusIs(WorkflowStatus.VotesTallied) returns(Results memory) {
        return Results(voters.getVotes(), proposals.getFullList(), winningProposalId);
    }

    /*
     * Archive the results of the voting as an event
    */
    function archive() public onlyRegistered statusIs(WorkflowStatus.VotesTallied) {
        if (isArchived == false) {
            emit Archived(getResultsDetails());
            isArchived = true;
        }
    }
    
    /*
     * - If the argument 'keepVoters' is true, keep the voters already registered
     * - Reset the status to RegisteringVoters
     * - Clear the proposal list
    */
    function reset(bool keepVoters) public onlyOwner {
        lifecycle.reset();
        voters.clear(keepVoters);
        proposals.clear();
        emit Reseted(lifecycle.getStatus());
    }
}