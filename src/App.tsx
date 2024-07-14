import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
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
import {globalSettings} from "./Assets/GlobalConfig";
import Transfer from "./Pages/Transfer/Transfer";
import TransferSupervisor from "./Pages/Transfer/TransferSupervisor";
import TransferProcess from "./Pages/Transfer/TransferProcess";
import TransferProcessSource from "./Pages/Transfer/TransferProcessSource";
import TransferProcessTargetItems from "./Pages/Transfer/TransferProcessTargetItems";
import TransferProcessTargetItem from "./Pages/Transfer/TransferProcessTargetItem";
import CountingSummaryReport from "./Pages/Counting/CountingSummaryReport";
import BinCheck from "./Pages/BinCheck/BinCheck";
import GoodsReceiptProcessDifferenceReport from "./Pages/GoodsReceipt/GoodsReceiptProcessDifferenceReport";

export default function App() {
    function getGoodsReceiptSupervisorAuthorizations() {
        let authorizations = [Authorization.GOODS_RECEIPT_SUPERVISOR];
        if (globalSettings?.grpoCreateSupervisorRequired) {
            return;
        }
        authorizations.push(Authorization.GOODS_RECEIPT)
        return authorizations;
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/binCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR, Authorization.COUNTING_SUPERVISOR, Authorization.TRANSFER_SUPERVISOR]} element={<BinCheck/>}/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR, Authorization.COUNTING_SUPERVISOR, Authorization.TRANSFER_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Counting*/}
                    <Route path="/counting" element={<ProtectedRoute authorization={Authorization.COUNTING} element={<Counting/>}/>}/>
                    <Route path="/counting/:scanCode" element={<ProtectedRoute authorization={Authorization.COUNTING} element={<CountingProcess/>}/>}/>
                    <Route path="/countingSupervisor" element={<ProtectedRoute authorization={Authorization.COUNTING_SUPERVISOR} element={<CountingSupervisor/>}/>}/>
                    <Route path="/countingSummaryReport/:scanCode" element={<ProtectedRoute authorization={Authorization.COUNTING_SUPERVISOR} element={<CountingSummaryReport/>}/>}/>
                    {/*Goods Receipt*/}
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceipt/>}/>}/>
                    <Route path="/goodsReceipt/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT} element={<GoodsReceiptProcess/>}/>}/>
                    <Route path="/goodsReceiptSupervisor" element={<ProtectedRoute authorizations={getGoodsReceiptSupervisorAuthorizations()} element={<GoodsReceiptSupervisor/>}/>}/>
                    <Route path="/goodsReceiptReport" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptReport/>}/>}/>
                    <Route path="/goodsReceiptVSExitReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptVSExitReport/>}/>}/>
                    <Route path="/goodsReceiptProcessDifferenceReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptProcessDifferenceReport/>}/>}/>
                    <Route path="/goodsReceiptReportAll/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptAll/>}/>}/>
                    {/*Pick*/}
                    <Route path="/pick" element={<ProtectedRoute authorization={Authorization.PICKING} element={<Picking/>}/>}/>
                    <Route path="/pick/:idParam" element={<ProtectedRoute authorization={Authorization.PICKING} element={<PickingProcess/>}/>}/>
                    <Route path="/pick/:idParam/:typeParam/:entryParam" element={<ProtectedRoute authorization={Authorization.PICKING} element={<PickingProcessDetail/>}/>}/>
                    <Route path="/pickSupervisor" element={<ProtectedRoute authorization={Authorization.PICKING_SUPERVISOR} element={<PickingSupervisor/>}/>}/>
                    {/*<Route path="/PickReport" element={<ProtectedRoute authorization={Authorization.Pick_SUPERVISOR} element={<PickReport/>}/>}/>*/}
                    {/*Transfer*/}
                    <Route path="/transfer" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<Transfer/>}/>}/>
                    <Route path="/transfer/:scanCode" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcess/>}/>}/>
                    <Route path="/transfer/:scanCode/source" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessSource/>}/>}/>
                    <Route path="/transfer/:scanCode/targetItems" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItems/>}/>}/>
                    <Route path="/transfer/:scanCode/targetItems/:itemCode" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItem/>}/>}/>
                    <Route path="/transferSupervisor" element={<ProtectedRoute authorization={Authorization.TRANSFER_SUPERVISOR} element={<TransferSupervisor/>}/>}/>
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}