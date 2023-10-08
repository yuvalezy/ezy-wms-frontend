import React from 'react';
import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import LoginPage from "./Pages/Login";
import HomePage from "./Pages/Home";
import {AuthProvider} from "./Components/AppContext";
import GoodsReceipt from "./Pages/GoodsReceipt";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";
import GoodsReceiptSupervisor from "./Pages/GoodsReceiptSupervisor";
import NotFound from "./Components/NotFound";
import {Authorization} from "./assets/Authorization";
import GoodsReceiptProcess from "./Pages/GoodsReceiptProcess";
import GoodsReceiptReport from "./Pages/GoodsReceiptReport";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT}
                                                                         element={<GoodsReceipt/>}/>}/>
                    <Route path="/goodsReceipt/:scanCode"
                           element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT}
                                                    element={<GoodsReceiptProcess/>}/>}/>
                    <Route path="/goodsReceiptSupervisor"
                           element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR}
                                                    element={<GoodsReceiptSupervisor/>}/>}/>
                    <Route path="/goodsReceiptReport"
                           element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR}
                                                    element={<GoodsReceiptReport/>}/>}/>
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}