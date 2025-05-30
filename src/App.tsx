import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import {AuthProvider} from "@/components";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import NotFound from "./components/NotFound";
import ItemCheck from "./pages/ItemCheck/ItemCheck";
import {Authorization} from "@/assets";
import PickingSupervisor from "./pages/Picking/PickingSupervisor";
import Picking from "./pages/Picking/Picking";
import PickingProcess from "./pages/Picking/PickingProcess";
import PickingProcessDetail from "./pages/Picking/PickingProcessDetail";
import GoodsReceipt from "./pages/GoodsReceipt/GoodsReceipt";
import GoodsReceiptProcess from "./pages/GoodsReceipt/GoodsReceiptProcess";
import GoodsReceiptSupervisor from "./pages/GoodsReceipt/GoodsReceiptSupervisor";
import GoodsReceiptReport from "./pages/GoodsReceipt/GoodsReceiptReport";
import GoodsReceiptVSExitReport from "./pages/GoodsReceipt/GoodsReceiptVSExitReport";
import GoodsReceiptAll from './pages/GoodsReceipt/GoodsReceiptAll';
import CountingList from "./pages/Counting/Counting";
import CountingProcess from "./pages/Counting/CountingProcess";
import CountingSupervisor from "./pages/Counting/CountingSupervisor";
import {globalSettings} from "@/assets";
import Transfer from "./pages/Transfer/transfer";
import TransferSupervisor from "./pages/Transfer/transfer-supervisor";
import TransferProcess from "./pages/Transfer/transfer-process";
import TransferProcessSource from "./pages/Transfer/transfer-process-source";
import TransferProcessTargetItems from "./pages/Transfer/transfer-process-target-items";
import TransferProcessTargetItem from "./pages/Transfer/transfer-process-target-item";
import CountingSummaryReport from "./pages/Counting/CountingSummaryReport";
import {BinCheck} from "./pages/BinCheck/BinCheck";
import GoodsReceiptProcessDifferenceReport from "./pages/GoodsReceipt/GoodsReceiptProcessDifferenceReport";
import TransferProcessTargetBins from "./pages/Transfer/transfer-process-target-bins";
import TransferRequest from "./pages/Transfer/transfer-request";
import { Toaster } from 'sonner';

export default function App() {
    function getGoodsReceiptSupervisorAuthorizations() {
        let authorizations = [Authorization.GOODS_RECEIPT_SUPERVISOR];
        if (globalSettings?.grpoCreateSupervisorRequired) {
            return;
        }
        authorizations.push(Authorization.GOODS_RECEIPT)
        return authorizations;
    }
    function getGoodsReceiptConfirmationSupervisorAuthorizations() {
        let authorizations = [Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR];
        if (globalSettings?.grpoCreateSupervisorRequired) {
            return;
        }
        authorizations.push(Authorization.GOODS_RECEIPT_CONFIRMATION)
        return authorizations;
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster closeButton richColors={true} />
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/binCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR, Authorization.COUNTING_SUPERVISOR, Authorization.TRANSFER_SUPERVISOR]} element={<BinCheck/>}/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR, Authorization.COUNTING_SUPERVISOR, Authorization.TRANSFER_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Counting*/}
                    <Route path="/counting" element={<ProtectedRoute authorization={Authorization.COUNTING} element={<CountingList/>}/>}/>
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
                    {/*Goods Receipt Confirmation */}
                    <Route path="/goodsReceiptConfirmation" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION} element={<GoodsReceipt confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmation/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION} element={<GoodsReceiptProcess confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationSupervisor" element={<ProtectedRoute authorizations={getGoodsReceiptConfirmationSupervisorAuthorizations()} element={<GoodsReceiptSupervisor confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationReport" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationVSExitReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptVSExitReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationProcessDifferenceReport/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptProcessDifferenceReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationReportAll/:scanCode" element={<ProtectedRoute authorization={Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptAll confirm/>}/>}/>
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
                    <Route path="/transfer/:scanCode/targetBins" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetBins/>}/>}/>
                    <Route path="/transfer/:scanCode/targetItems" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItems/>}/>}/>
                    <Route path="/transfer/:scanCode/targetItems/:itemCode" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItem/>}/>}/>
                    <Route path="/transferSupervisor" element={<ProtectedRoute authorization={Authorization.TRANSFER_SUPERVISOR} element={<TransferSupervisor/>}/>}/>
                    <Route path="/transferRequest" element={<ProtectedRoute authorization={Authorization.TRANSFER_REQUEST} element={<TransferRequest/>}/>}/>
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
