import { useEffect } from "react";
import { actions, useEth } from "../contexts/EthContext";
import Button from 'react-bootstrap/Button';

export const WORKFLOW = [
    {
        index: 0,
        title: 'Registering Voters',
        nextFnName: 'startProposalsRegistering',
        nextBtnLabel: 'Stop registering voters and start Registering Proposal'
    },
    {
        index: 1,
        title: 'Proposals Registration Started',
        nextFnName: 'endProposalsRegistering',
        nextBtnLabel: 'End Proposals Registration'
    },
    {
        index: 2,
        title: 'Proposals Registration Ended',
        nextFnName: 'startVotingSession',
        nextBtnLabel: 'Start Voting Session'
    },
    {
        index: 3,
        title: 'Voting Session Started',
        nextFnName: 'endVotingSession',
        nextBtnLabel: 'End Voting Session'
    },
    {
        index: 4,
        title: 'Voting Session Ended',
        nextFnName: 'tallyVotes',
        nextBtnLabel: 'Tally Votes'
    },
    {
        index: 5,
        title: 'Votes Tallied',
        nextFnName: 'reset',
        nextBtnLabel: 'Reset Voting'
    },
];

export  function WorkflowStatus() {
    const { state: { contract, accounts, currentStatus, isOwner }, dispatch} = useEth();

    useEffect(() => {
        contract.methods.workflowStatus().call({ from: accounts[0] })
            .then(statusIndex => dispatch({ type: actions.update, data: { currentStatus: WORKFLOW[statusIndex] } }));
    }, [accounts, dispatch, contract.methods]);

    const nextStep = () => {
        if (!isOwner) {
            alert('You are not the owner!');
            return;
        }
        if (contract && accounts?.length) {
            contract.methods[currentStatus.nextFnName]().send({ from: accounts[0] });
        }
    };

    return (<>
        <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '1.4rem', color: 'grey' }}>Current Status:</span>&nbsp;
            <span style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'blue' }}>{ currentStatus?.title || 'loading' }</span>
        </div>
        { isOwner ? <Button onClick={ nextStep } variant="primary">{ currentStatus?.nextBtnLabel }</Button> : <></> }
    </>);
}