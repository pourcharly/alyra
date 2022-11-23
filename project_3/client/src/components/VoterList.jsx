import ListGroup from 'react-bootstrap/ListGroup';
import { useEth } from '../contexts/EthContext';

export function VoterList() {
    const { state: { voters } } = useEth();

    return (<div style={{ margin: '20px 0', padding: '20px', width: '500px' }}>
        <h2 style={{ textAlign: 'center' }}>Voters List</h2>
        {
        voters?.length ?
            <ListGroup>
                {voters.map((voter, index) => {
                    return (
                        <ListGroup.Item key={index} className="w-100 d-flex justify-content-between align-items-start flex-column">
                            <div>{ voter.address }</div>
                            <div style={{ color: 'grey' }}>{ voter.hasVoted ? `...has voted for proposal (${voter.votedProposalId})` : '' }</div>
                        </ListGroup.Item>
                    )
                })}
            </ListGroup> :
            <p style={{ textAlign: 'center', color: 'grey' }}>- empty -</p>
        }
    </div>);
}