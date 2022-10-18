// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;
import "./voter.sol";

library IndexedVoterListLib {
    struct IndexedVoterList {
        mapping(address => VoterLib.Voter) map;
        address[] index;
    }

    event VoterRegistered(address voterAddress); 
    
    function register(IndexedVoterList storage voters, address addr) internal {
        require(addr != address(0), "Error: invalid address");
        require(!voters.map[addr].isRegistered, "Error: already registered.");
        voters.map[addr].isRegistered = true;
        voters.index.push(addr);
        emit VoterRegistered(addr);
    }

    function isRegistered(IndexedVoterList storage voters, address addr) internal view returns(bool) {
        return voters.map[addr].isRegistered;
    }

    function atIndex(IndexedVoterList storage voters, uint i) internal view returns(VoterLib.Voter storage) {
        return voters.map[ voters.index[i] ];
    }

    function hasVoted(IndexedVoterList storage voters) internal view returns(bool) {
        bool _hasVoted = true;
        uint l = length(voters);
        for (uint i = 0; i < l; ++i) {
            _hasVoted = _hasVoted && atIndex(voters, i).hasVoted;
            if (!_hasVoted) {
                break;
            } 
        }
        return _hasVoted;
    }

    function getVotes(IndexedVoterList storage voters) internal view returns(VoterLib.VoterOverview[] memory) {
        uint l = length(voters);
        VoterLib.VoterOverview[] memory votes = new VoterLib.VoterOverview[](l);
        for (uint i = 0; i < l; ++i) {
            address addr = voters.index[i];
            votes[i] = VoterLib.VoterOverview(addr, voters.map[addr].votedProposalId);
        }
        return votes;
    }

    function length(IndexedVoterList storage voters) internal view returns(uint) {
        return voters.index.length;
    }

    function clear(IndexedVoterList storage voters, bool keepVoters) internal {
        uint l = length(voters);
        for (uint i = 0; i < l; ++i) {
            address addr = voters.index[i];
            voters.map[addr] = VoterLib.Voter(keepVoters, false, 0);
        }
        delete voters.index;
    }
}