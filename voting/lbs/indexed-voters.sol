// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;
import "@openzeppelin/contracts/utils/Counters.sol";
import "./voter.sol";

library IndexedVoterListLib {
    using Counters for Counters.Counter;
    using VoterLib for VoterLib.Voter;

    struct IndexedVoterList {
        mapping(address => VoterLib.Voter) map;
        address[] index;
        Counters.Counter count;
    }

    // Events

    event VoterRegistered(address voterAddress); 
    event VoterUnregistered(address voterAddress);

    // Modifiers

    modifier isValidAdress(address addr) {
        require(addr != address(0), "Error: invalid address");
        _;
    }

    // Functions
    
    function register(IndexedVoterList storage voters, address addr) internal isValidAdress(addr) {
        require(!voters.map[addr].isRegistered, "Error: already registered.");
        voters.map[addr].register();
        voters.index.push(addr);
        voters.count.increment();
        emit VoterRegistered(addr);
    }

    function unregister(IndexedVoterList storage voters, address addr) internal isValidAdress(addr) {
        require(voters.map[addr].isRegistered, "Error: not registered.");
        voters.map[addr].unregister();
        voters.count.decrement();
        emit VoterUnregistered(addr);
    }

    function isRegistered(IndexedVoterList storage voters, address addr) internal view returns(bool) {
        return voters.map[addr].isRegistered;
    }

    function getList(IndexedVoterList storage voters) internal view returns(address[] memory) {
        address[] memory indexList = voters.index;
        address[] memory list = new address[](indexList.length);
        for (uint i = 0; i < indexList.length; ++i) {
            address addr = indexList[i];
            if (voters.map[addr].isRegistered) {
                list[i] = addr;
            }
        }
        return list;
    }

    function atIndex(IndexedVoterList storage voters, uint i) internal view returns(VoterLib.Voter storage) {
        return voters.map[ voters.index[i] ];
    }

    function hasVoted(IndexedVoterList storage voters) internal view returns(bool) {
        bool _hasVoted = true;
        uint l = voters.index.length;
        for (uint i = 0; i < l; ++i) {
            VoterLib.Voter memory voter = atIndex(voters, i);
            if (!voter.isRegistered) {
                continue;
            }
            _hasVoted = _hasVoted && voter.hasVoted;
            if (!_hasVoted) {
                break;
            } 
        }
        return _hasVoted;
    }

    function getVotes(IndexedVoterList storage voters) internal view returns(VoterLib.VoterOverview[] memory) {
        uint l = voters.index.length;
        VoterLib.VoterOverview[] memory votes = new VoterLib.VoterOverview[](l);
        for (uint i = 0; i < l; ++i) {
            address addr = voters.index[i];
            VoterLib.Voter memory voter = voters.map[addr];
            if (voter.isRegistered) {
                votes[i] = VoterLib.VoterOverview(addr, voter.votedProposalId);
            }
        }
        return votes;
    }

    function length(IndexedVoterList storage voters) internal view returns(uint) {
        return voters.count.current();
    }

    function clear(IndexedVoterList storage voters, bool keepVoters) internal {
        uint l = voters.index.length;
        for (uint i = 0; i < l; ++i) {
            address addr = voters.index[i];
            voters.map[addr] = VoterLib.Voter(keepVoters, false, 0);
        }
        delete voters.index;
        voters.count.reset();
    }
}