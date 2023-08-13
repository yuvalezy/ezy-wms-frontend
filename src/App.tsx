import React from 'react';
import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import LoginPage from "./Login";
import HomePage from "./Home";
import {AuthProvider} from "./AppContext";
import GoodsReceipt from "./GoodsReceipt";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/goodsReceipt" element={<ProtectedRoute element={<GoodsReceipt/>} />} />
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>} />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}