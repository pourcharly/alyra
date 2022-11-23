import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { actions, useEth } from '../contexts/EthContext';

export function ProposalList() {
    const { state: { proposals, isVoter, hasVoted, currentStatus, accounts, contract, winningProposalID }, dispatch } = useEth();

    const vote = (proposalId) => {
        contract.methods.setVote(proposalId).send({ from: accounts[0] }).then(() => dispatch({ type: actions.hasVoted }));
    };

    return (<div style={{ margin: '20px 0', padding: '20px', width: '500px' }}>
        <h2 style={{ textAlign: 'center' }}>Proposal List</h2>
        {
        proposals?.length ?
            <ListGroup>
                {proposals.map((proposal, index) => {
                    return <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                        { proposal?.id === winningProposalID && currentStatus === 5 ?
                            <div className="ms-2 me-auto" style={{ color: 'red', fontWeight: 'bold'}}>
                                { `(${proposal?.id}) ` }{ proposal?.description }
                            </div> :
                            <div className="ms-2 me-auto">
                                { `(${proposal?.id}) ` }{ proposal?.description }
                            </div>
                        }
                        { isVoter && !hasVoted && currentStatus?.index === 3 ?
                            <Button variant="success" style={{ margin: '0 20px' }} onClick={() => vote(proposal?.id)}>Vote</Button> :
                            <></>
                        }
                        <Badge bg="primary" pill>
                            { proposal?.voteCount }
                        </Badge>

                    </ListGroup.Item>
                })}
            </ListGroup> :
            <p style={{ textAlign: 'center', color: 'grey' }}>- empty -</p>
        }
    </div>);
}