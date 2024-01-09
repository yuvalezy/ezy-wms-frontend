import React from 'react';
import './App.css';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import LoginPage from "./Pages/Login";
import HomePage from "./Pages/Home";
import {AuthProvider} from "./Components/AppContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";
import NotFound from "./Components/NotFound";
import ItemCheck from "./Pages/ItemCheck/ItemCheck";
import {Authorization} from "./Assets/Authorization";
import PickingSupervisor from "./Pages/Picking/PickingSupervisor";
import Picking from "./Pages/Picking/Picking";
import PickingProcess from "./Pages/Picking/PickingProcess";
import PickingProcessDetail from "./Pages/Picking/PickingProcessDetail";
import GoodsReceipt from "./Pages/GoodsReceipt/GoodsReceipt";
import GoodsReceiptProcess from "./Pages/GoodsReceipt/GoodsReceiptProcess";
import GoodsReceiptSupervisor from "./Pages/GoodsReceipt/GoodsReceiptSupervisor";
import GoodsReceiptReport from "./Pages/GoodsReceipt/GoodsReceiptReport";
import GoodsReceiptVSExitReport from "./Pages/GoodsReceipt/GoodsReceiptVSExitReport";
import GoodsReceiptAll from './Pages/GoodsReceipt/GoodsReceiptAll';
import Counting from "./Pages/Counting/Counting";
import CountingProcess from "./Pages/Counting/CountingProcess";
import CountingSupervisor from "./Pages/Counting/CountingSupervisor";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Counting*/}
                    <Route path="/counting" element={<ProtectedRoute authorization={Authorization.COUNTING} element={<Counting/>}/>}/>
                    <Route path="/counting/:scanCode" element={<ProtectedRoute authorization={Authorization.COUNTING} element={<CountingProcess/>}/>}/>
                    <Route path="/countingSupervisor" element={<ProtectedRoute authorization={Authorization.COUNTING_SUPERVISOR} element={<CountingSupervisor/>}/>}/>
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