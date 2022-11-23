// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract Voting is Ownable {

    uint public winningProposalID;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;
    address[] addresses; // Noouveau tableau pour pouvoir reset les voters a la fin

    // Ajout de timestamps dans les events pour pouvoir les filtrer en fonction du dernier reset coté web3
    event VoterRegistered(uint256 timestamp, address voterAddress); 
    event WorkflowStatusChange(uint256 timestamp, WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint256 timestamp, uint proposalId);
    event Voted(uint256 timestamp, address voter, uint proposalId);
    event Reset(uint256 timestamp);
    
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    // Nouveau modifier pour permettre au Owner d'accéder au getOneProposal et au getVoter
    modifier onlyRegistered() {
        require(owner() == msg.sender || voters[msg.sender].isRegistered, "You're not registered");
        _;
    }

    // Modifier pour avoir maximum 100 voters et protéger d'une attaque de Reentrency
    modifier ifNotFull() {
        require(addresses.length < 101, "Max 100 voters");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    function getVoter(address _addr) external onlyRegistered view returns (Voter memory) {
        return voters[_addr];
    }
    
    function getOneProposal(uint _id) external onlyRegistered view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    function addVoter(address _addr) external onlyOwner ifNotFull {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        addresses.push(_addr);
        emit VoterRegistered(block.timestamp, _addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(block.timestamp, proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;
        // Fix security issue (Reentrency Attack)
        if (proposalsArray[_id].voteCount > proposalsArray[winningProposalID].voteCount) {
            winningProposalID = _id;
        }

        emit Voted(block.timestamp, msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //


    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(block.timestamp, WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(block.timestamp, WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(block.timestamp, WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(block.timestamp, WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }


   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");

       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(block.timestamp, WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    // Possibilité de reset le voting a la fin
    function reset() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Current status is not votes tailled");

        workflowStatus = WorkflowStatus.RegisteringVoters;
        delete proposalsArray;
        uint length = addresses.length;
        for (uint i = 0; i < length; ++i) {
            voters[ addresses[i] ].isRegistered = false;
            voters[ addresses[i] ].hasVoted = false;
            voters[ addresses[i] ].votedProposalId = 0;
        }
        delete addresses;
        emit WorkflowStatusChange(block.timestamp, WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
        emit Reset(block.timestamp);
    }
}