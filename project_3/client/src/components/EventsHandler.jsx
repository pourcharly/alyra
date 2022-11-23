import { useEffect, useState } from "react";
import { actions, useEth } from "../contexts/EthContext";
import { addEventListener, getOldEvents, getOldEventsValues } from '../helpers';
import { WORKFLOW } from "./WorkFlowStatus";
import Toast from 'react-bootstrap/Toast';


export function EventsHandler() {
    const { state: { contract, accounts, isOwner, isVoter, proposals, voters }, dispatch } = useEth();
    const [eventMessage, setEventMessage] = useState(null);
    const [resetTimestamp, setResetTimestamp] = useState(0);

    const hideNotification = () => {
        setEventMessage(null);
    };

    useEffect(() => {
        if (eventMessage) {
            setTimeout(() => setEventMessage(null), 3000);
        }
    }, [eventMessage]);

    // Reset Events
    useEffect(() => {
        getOldEventsValues(contract, 'WorkflowStatusChange')
            .then(values => values[values.length - 1])
            .then(lastValues => lastValues ? setResetTimestamp(parseInt(lastValues.timestamp)) : 0)
    }, [contract, dispatch]);

    // Workflow Status Change Events
    useEffect(() => {
        return addEventListener(contract, 'WorkflowStatusChange', ({ newStatus }) => {
            dispatch({ type: actions.update, data: { currentStatus: WORKFLOW[newStatus] } });
            if (newStatus === 0) {
                window.location.href = '/';
            }
            setEventMessage({
                'title': 'Workflow Status Changed',
                'content': `${ WORKFLOW[newStatus]?.title }`
            });
        });
    }, [contract, dispatch]);

    // Voter Registered Events
    useEffect(() => {
        getOldEventsValues(contract, 'VoterRegistered', resetTimestamp)
            .then(values => values.map(value => value.voterAddress))
            .then(voterAdresses => Promise.all(voterAdresses.map((address) => {
                return contract.methods.getVoter(address).call({ from: accounts[0] })
                    .then(({ hasVoted, votedProposalId }) => ({ hasVoted, votedProposalId, address }));
            })))
            .then(voters => {
                const voter = voters.find(voter => voter.address === accounts[0]);
                if (voter && voter.hasVoted) {
                    dispatch({ type: actions.hasVoted })
                }
                return voters;
            })
            .then(voters => dispatch({ type: actions.initVoters, data: voters }));
    }, [contract, dispatch, accounts, resetTimestamp]);

    useEffect(() => {
        return addEventListener(contract, 'VoterRegistered', ({ voterAddress }) => {
            dispatch({ type: actions.addVoter, data: { address: voterAddress, hasVoted: false, votedProposalId: null} });
            setEventMessage({
                'title': 'Voter registered',
                'content': `${ voterAddress } is now a voter`
            });
        });
    }, [contract, dispatch]);

    // Proposal Registered Events
    useEffect(() => {
        getOldEventsValues(contract, 'ProposalRegistered', resetTimestamp)
            .then(values => values.map(value => value.proposalId))
            .then(proposalIds => Promise.all(proposalIds.map(id => {
                return contract.methods.getOneProposal(id).call({ from: accounts[0] })
                    .then(({description, voteCount}) => ({ id, description, voteCount }));
            })))
            .then(proposals => dispatch({ type: actions.initProposals, data: proposals }));
    }, [contract, dispatch, accounts, resetTimestamp]);

    useEffect(() => {
        return addEventListener(contract, 'ProposalRegistered', ({ proposalId }) => {
            contract.methods.getOneProposal(proposalId).call({ from: accounts[0] })
                .then(({description, voteCount}) => ({ id: proposalId, description, voteCount }))
                .then(proposal => {
                    dispatch({ type: actions.addProposal, data: proposal });
                    setEventMessage({
                        'title': 'Proposal registered',
                        'content': `New proposal: "${ proposal.description }"`
                    });
                });

        });
    }, [contract, dispatch, accounts]);

    // Voted Events
    useEffect(() => {
        getOldEventsValues(contract, 'Voted', resetTimestamp)
            .then(values => values.map(({ voter, proposalId }) => ({ voter, proposalId })))
            .then(votes => dispatch({ type: actions.initVotes, data: votes }));
        
    }, [contract, dispatch, resetTimestamp, accounts]);

    useEffect(() => {
        return addEventListener(contract, 'Voted', ({ voter, proposalId }) => {
            const proposal = proposals.find(p => p.id === proposalId);
            proposal.voteCount++;

            const foundVoter = voters.find(v => v.address = voter);
            foundVoter.votedProposalId = proposalId;
            foundVoter.hasVoted = true;

            dispatch({ type: actions.addVote, data: { vote : { voter, proposalId } } });
            contract.methods.winningProposalID().call({ from: accounts[0] })
                .then(winningProposalID => dispatch({ type: actions.updateWinner, data: { winningProposalID } }));
            
            setEventMessage({
                'title': 'Voted!',
                'content': `${ voter } has vote for proposal ${proposalId}.`
            });
        });
    }, [contract, dispatch, proposals, voters, accounts]);


    return (
        <Toast show={eventMessage && (isOwner || isVoter)} onClose={hideNotification} style={{ position: 'fixed', top: '55px', right: '10px' }}>
            <Toast.Header>
                <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                <strong className="me-auto">{eventMessage?.title || ''}</strong>
            </Toast.Header>
            <Toast.Body>{eventMessage?.content || ''}</Toast.Body>
        </Toast>
    );
}