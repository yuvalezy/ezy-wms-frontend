import React from "react";
import {useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from "./AppContext";

export default function Menu() {
    const navigate = useNavigate();
    const location = useLocation();

    const {logout} = useAuth();

    function handleLogout() {
        logout();
    }

    return (
        <div>
            <button onClick={() => navigate("/")} disabled={location.pathname === '/'}>Go to Home</button>
            <button
                onClick={() => navigate("/goodsReceipt")}
                disabled={location.pathname === '/goodsReceipt'}>Go to Goods Receipts
            </button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}