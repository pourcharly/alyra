import { useEffect, useState } from "react";
import { ProposalList, VoterList, WorkflowStatus, ProposalForm, Winner } from "../components";
import { useEth } from "../contexts/EthContext";

export function VoterHome() {
    const { state: { currentStatus } } = useEth();
    const [status, setStatus] = useState(currentStatus);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    return (<>
        <WorkflowStatus/>
        <Winner/>
        { status?.index === 1 ? <ProposalForm/> : <></> }
        <div style={{ display: 'flex' }}>
            <VoterList/>
            <ProposalList/>
        </div>
    </>);
}