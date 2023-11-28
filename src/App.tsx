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
import {Authorization} from "./Assets/Authorization";
import PickingSupervisor from "./Pages/PickingSupervisor";
import Picking from "./Pages/Picking";
import PickingProcess from "./Pages/PickingProcess";
import PickingProcessDetail from "./Pages/PickingProcessDetail";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Goods Receipt*/}
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceipt/>}/>}/>
                    <Route path="/goodsReceipt/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceiptProcess/>}/>}/>
                    <Route path="/goodsReceiptSupervisor" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptSupervisor/>}/>}/>
                    <Route path="/goodsReceiptReport" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptReport/>}/>}/>
                    <Route path="/goodsReceiptVSExitReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptVSExitReport/>}/>}/>
                    <Route path="/goodsReceiptReportAll/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptAll/>}/>}/>
                    {/*Pick*/}
                    <Route path="/pick" element={<ProtectedRoute authorization={Authorization.PICKING} element={<Picking/>}/>}/>
                    <Route path="/pick/:idParam" element={<ProtectedRoute authorization={Authorization.PICKING} element={<PickingProcess/>}/>}/>
                    <Route path="/pick/:idParam/:typeParam/:entryParam" element={<ProtectedRoute authorization={Authorization.PICKING} element={<PickingProcessDetail/>}/>}/>
                    <Route path="/pickSupervisor" element={<ProtectedRoute authorization={Authorization.PICKING_SUPERVISOR} element={<PickingSupervisor/>}/>}/>
                    {/*<Route path="/PickReport" element={<ProtectedRoute authorization={Authorization.Pick_SUPERVISOR} element={<PickReport/>}/>}/>*/}
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}