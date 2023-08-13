import React from 'react';
import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import LoginPage from "./Pages/Login";
import HomePage from "./Pages/Home";
import {Authorization, AuthProvider} from "./Components/AppContext";
import GoodsReceipt from "./Pages/GoodsReceipt";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Unauthorized";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized />}/>
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceipt/>} />} />
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>} />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}