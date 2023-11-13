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
import GoodsReceiptProcess from "./Pages/GoodsReceiptProcess";
import GoodsReceiptReport from "./Pages/GoodsReceiptReport";
import GoodsReceiptVSExitReport from "./Pages/GoodsReceiptVSExitReport";
import GoodsReceiptAll from './Pages/GoodsReceiptAll';
import ItemCheck from "./Pages/ItemCheck";
import Delivery from "./Pages/Delivery";
import DeliveryProcess from "./Pages/DeliveryProcess";
import DeliverySupervisor from "./Pages/DeliverySupervisor";
import DeliveryReport from "./Pages/DeliveryReport";
import {Authorization} from "./Assets/Authorization";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.DELIVERY_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Goods Receipt*/}
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceipt/>}/>}/>
                    <Route path="/goodsReceipt/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceiptProcess/>}/>}/>
                    <Route path="/goodsReceiptSupervisor" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptSupervisor/>}/>}/>
                    <Route path="/goodsReceiptReport" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptReport/>}/>}/>
                    <Route path="/goodsReceiptVSExitReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptVSExitReport/>}/>}/>
                    <Route path="/goodsReceiptReportAll/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptAll/>}/>}/>
                    {/*Delivery*/}
                    <Route path="/delivery" element={<ProtectedRoute authorization={Authorization.DELIVERY} element={<Delivery/>}/>}/>
                    <Route path="/delivery/:scanCode" element={<ProtectedRoute authorization={Authorization.DELIVERY} element={<DeliveryProcess/>}/>}/>
                    <Route path="/deliverySupervisor" element={<ProtectedRoute authorization={Authorization.DELIVERY_SUPERVISOR} element={<DeliverySupervisor/>}/>}/>
                    <Route path="/deliveryReport" element={<ProtectedRoute authorization={Authorization.DELIVERY_SUPERVISOR} element={<DeliveryReport/>}/>}/>
                    {/*<Route path="/goodsReceiptVSExitReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptVSExitReport/>}/>}/>*/}
                    {/*<Route path="/goodsReceiptReportAll/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptAll/>}/>}/>*/}
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}