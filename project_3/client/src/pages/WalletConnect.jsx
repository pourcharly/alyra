import { Navigate } from "react-router-dom";
import useEth from "../contexts/EthContext/useEth";

export function WalletConnect() {
    const { state: { isConnected, isOwner, isVoter } } = useEth();


    return (<div>
        {
            isConnected ?
                (
                    isOwner ?
                        <Navigate to="/admin" replace /> :
                        isVoter ?
                            <Navigate to="/voter" replace /> :
                            <Navigate to="/u_shall_not_pass" replace />
                ) :
                <span style={{ fontSize: '1.4rem', color: 'grey', fontStyle: 'italic' }}>Waiting wallet autorisation...</span>
        }
    </div>);
}