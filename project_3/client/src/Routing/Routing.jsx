import { Routes, Route } from "react-router-dom";
import { useEth } from "../contexts/EthContext";
import { GuardedRoute } from "./GuardedRoute";
import { WalletConnect, AdminHome, VoterHome, DefaultHome } from '../pages';


export function Routing() {
    const { state: { isOwner, isVoter, isUnregistered } } = useEth();

    return (
        <Routes>
            <Route path="/" element={<WalletConnect/>} />
            <Route path="/admin" element={<GuardedRoute canAccess={isOwner} />}>
                <Route path="/admin" element={<AdminHome/>}/>
            </Route>
            <Route path="/voter" element={<GuardedRoute canAccess={isVoter} />}>
                <Route path="/voter" element={<VoterHome/>}/>
            </Route>
            <Route path="/u_shall_not_pass" element={<GuardedRoute canAccess={isUnregistered} />}>
                <Route path="/u_shall_not_pass" element={<DefaultHome/>}/>
            </Route>
        </Routes>
    )
}