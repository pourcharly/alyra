import { Navigate, Outlet } from "react-router-dom";

export function GuardedRoute({ canAccess }) {
    
    return canAccess ? <Outlet/> : <Navigate to="/" replace/>;
}