import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { accounts, contract, voters } = state;

  const init = useCallback(
    async artifact => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/Voting.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);


  useEffect(() => {
    let connectedAccount = accounts?.[0];

    const compareAdresses = async () => {
      const owner = await contract.methods.owner().call({ from: connectedAccount });
      const isOwner = (owner === connectedAccount);
      const isVoter = (voters?.findIndex(v => v.address === connectedAccount) !== -1);
      const isUnregistered = !isOwner && !isVoter;
      dispatch({ type: actions.update, data: { isConnected: true, isVoter, isOwner, isUnregistered }});
    };
    
    contract?.methods.winningProposalID().call({ from: accounts[0] })
      .then(winningProposalID => dispatch({ type: actions.updateWinner, data: { winningProposalID } }));

    if (connectedAccount) {
      compareAdresses();
    }
  }, [accounts, contract, voters]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
