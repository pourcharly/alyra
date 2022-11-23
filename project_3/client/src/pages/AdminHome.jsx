import { useState } from "react";
import { useEffect } from "react";
import { VoterForm, VoterList, WorkflowStatus, ProposalList, Winner } from "../components";
import { useEth } from "../contexts/EthContext";


export  function AdminHome() {
    const { state: { currentStatus } } = useEth();
    const [status, setStatus] = useState(currentStatus);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    return (<>
        <WorkflowStatus/>
        <Winner/>
        { status?.index === 0 ? <VoterForm/> : <></> }
        <div style={{ display: 'flex' }}>
            <VoterList/>
            <ProposalList/>
        </div>
    </>);
}