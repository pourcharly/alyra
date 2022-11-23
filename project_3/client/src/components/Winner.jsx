import { useEth } from "../contexts/EthContext";


export function Winner() {
    const { state: { winningProposalID, currentStatus } } = useEth();


    return (
        currentStatus?.index === 5 ?
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'red', textTransform: 'uppercase' }}>
                And the winner is...
                {winningProposalID}
            </div> :
            <></>
    );
}