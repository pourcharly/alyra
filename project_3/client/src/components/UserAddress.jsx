import { useState } from "react";
import { useEffect } from "react";
import { useEth } from "../contexts/EthContext";

export function UserAddress() {
    const { state: { accounts, isOwner, isVoter } } = useEth();
    const [role, setRole] = useState('UNREGISTERED');

    useEffect(() => {
        setRole(isOwner ? 'OWNER' : (isVoter ? 'VOTER' : 'UNREGISTERED'));
    }, [isOwner, isVoter])

    return (<div style={{ fontSize: '10px', color: 'grey', padding: '10px', position: 'fixed', top: '10px', right: '10px', outline: '1px solid #eee', backgroundColor: 'white'}}>
        {role}:&nbsp;{ accounts?.length ? accounts[0] : 'Please Connect With Your Wallet...' }
    </div>);
}