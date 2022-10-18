// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProposalHandler {
    using Counters for Counters.Counter;

    struct Proposal {
        string description;
        Counters.Counter voteCount;

        // adding for edit or remove proposal, or get a set of proposals
        address author;
        bool removed;
    }

    // Only used for view. Associate proposal and his id.
    struct FullProposal {
        Proposal proposal;
        uint id;
    }

    Proposal[] list;
    uint public length = 0;
    uint[] winnersIds;

    constructor() {
        /*
         * The first proposal is a nul-like value.
         * So the proposal id 0 and his null proposal is used to means "no winner".
        */
        list.push(Proposal("", Counters.Counter(0), address(0), true));
    }

    // Events

    event ProposalRegistered(uint proposalId);
    event ProposalEdited(uint proposalId);
    event ProposalRemoved(uint proposalId);

    // Modifiers

    modifier onlyAuthor(uint proposalId, address addr) {
        require(addr == list[proposalId].author, "Forbidden: only author of the proposal can modify it.");
        _;
    }

    modifier noEmptyDescription(string memory description) {
        require(bytes(description).length > 0, "Error: description is empty.");
        _;
    }

    modifier proposalExists(uint proposalId) {
        require(exists(proposalId), "Error: unknown proposal");
        _;
    }

    // Functions

    function exists(uint proposalId) public view returns(bool) {
        return proposalId >= 0 && proposalId < list.length && !list[proposalId].removed;
    }

    function add(string memory description, address author) public noEmptyDescription(description) returns(uint) {
        list.push(Proposal(description, Counters.Counter(0), author, false));
        length++;
        emit ProposalRegistered(list.length - 1);
        return list.length - 1;
    }

    function get(uint proposalId) public view proposalExists(proposalId) returns(Proposal memory) {
        return list[proposalId];
    }

    function set(uint proposalId, string memory description, address addr) public proposalExists(proposalId) onlyAuthor(proposalId, addr) noEmptyDescription(description) {
        list[proposalId].description = description;
        emit ProposalEdited(proposalId);
    }

    function remove(uint proposalId, address addr) public proposalExists(proposalId) onlyAuthor(proposalId, addr) {
        list[proposalId].removed = true;
        length--;
        emit ProposalRemoved(proposalId);
    }

    function getListFromAuthor(address addr) public view returns(FullProposal[] memory) {
        FullProposal[] memory selection = new FullProposal[](length);
        uint y = 0;
        for(uint i = 1; i < list.length; ++i) {
            Proposal memory proposal = list[i];
            if (proposal.author == addr && !proposal.removed) {
                selection[y] = FullProposal(proposal, i);
                ++y;
            }
        }
        return selection;
    }

    function getFullList() public view returns(FullProposal[] memory) {
        FullProposal[] memory fullList = new FullProposal[](length);
        uint y = 0;
        for(uint i = 1; i < list.length; ++i) {
            if (!list[i].removed) {
                continue;
            }
            fullList[y] = FullProposal(list[i], i);
            ++y;
        }
        return fullList;
    }

    function getDescription(uint proposalId) public view proposalExists(proposalId) returns(string memory) {
        return list[proposalId].description;
    }

    function vote(uint proposalId) public proposalExists(proposalId) {
        list[proposalId].voteCount.increment();
    }

    function tallieVotes() public {
        delete winnersIds;
        uint higher = 0;
        for (uint id = 1; id < list.length; ++id) {
            if (list[id].removed) {
                continue;
            }
            uint count = list[id].voteCount.current();
            if (count >= higher) {
                if (count > higher) {
                    delete winnersIds;
                    higher = count;
                }
                winnersIds.push(id);
            }
        }
    }

    function getWinners() public view returns(Proposal[] memory) {
        uint winLenght = winnersIds.length;
        Proposal[] memory winners = new Proposal[](winLenght);
        for (uint index = 0; index < winLenght; ++index) {
            uint id = winnersIds[index];
            winners[index++] = list[id];
        }
        return winners;
    }

    function getWinnersIds() public view returns(uint[] memory) {
        return winnersIds;
    }

    function clear() public {
        delete list;
        length = 0;
        delete winnersIds;
    }
}