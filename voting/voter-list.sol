// SPDX-License-Identifier: GPL-3.0
import "./voters.sol";

pragma solidity 0.8.17;

contract VoterList {

    mapping(address => Voters.Voter) voters;

    event VoterRegistered(address voterAddress); 


    function add(address voterAddress) public {
        require(voterAddress != address(0), "invalid address");
        require(!voters[voterAddress].isRegistered, "Voter already added.");
        voters[voterAddress].isRegistered = true;
        emit VoterRegistered(voterAddress);
    }

    function exists(address voterAddress) public view returns(bool) {
        return voters[voterAddress].isRegistered;
    }

    function get(address voterAddress) public view returns(Voters.Voter memory) {
        return voters[voterAddress];
    }
}