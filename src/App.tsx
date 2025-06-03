import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/login/login";
import HomePage from "./pages/Home";
import {AuthProvider, useAuth} from "@/components";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import NotFound from "./components/NotFound";
import ItemCheck from "@/pages/item-check/ItemCheck";
import {RoleType} from "@/assets";
import PickingSupervisor from "./pages/picking/picking-supervisor";
import Picking from "./pages/picking/picking";
import PickingProcess from "./pages/picking/picking-process";
import PickingProcessDetail from "./pages/picking/picking-process-detail";
import GoodsReceipt from "./pages/GoodsReceipt/GoodsReceipt";
import GoodsReceiptProcess from "./pages/GoodsReceipt/GoodsReceiptProcess";
import GoodsReceiptSupervisor from "./pages/GoodsReceipt/GoodsReceiptSupervisor";
import GoodsReceiptReport from "./pages/GoodsReceipt/GoodsReceiptReport";
import GoodsReceiptVSExitReport from "./pages/GoodsReceipt/GoodsReceiptVSExitReport";
import GoodsReceiptAll from './pages/GoodsReceipt/GoodsReceiptAll';
import CountingList from "./pages/Counting/Counting";
import CountingProcess from "./pages/Counting/CountingProcess";
import CountingSupervisor from "./pages/Counting/CountingSupervisor";
import Transfer from "./pages/transfer/transfer";
import TransferSupervisor from "./pages/transfer/transfer-supervisor";
import TransferProcess from "./pages/transfer/transfer-process";
import TransferProcessSource from "./pages/transfer/transfer-process-source";
// import TransferProcessTargetItems from "./pages/transfer/transfer-process-target-items";
// import TransferProcessTargetItem from "./pages/transfer/transfer-process-target-item";
import CountingSummaryReport from "./pages/Counting/CountingSummaryReport";
import {BinCheck} from "./pages/BinCheck/BinCheck";
import GoodsReceiptProcessDifferenceReport from "./pages/GoodsReceipt/GoodsReceiptProcessDifferenceReport";
import TransferProcessTargetBins from "./pages/transfer/transfer-process-target-bins";
import TransferRequest from "./pages/transfer/transfer-request";
import { Toaster } from 'sonner';

export default function App() {
    const {user} = useAuth();
    function getGoodsReceiptSupervisorAuthorizations() {
        let authorizations = [RoleType.GOODS_RECEIPT_SUPERVISOR];
        if (user?.settings?.goodsReceiptCreateSupervisorRequired) {
            return;
        }
        authorizations.push(RoleType.GOODS_RECEIPT)
        return authorizations;
    }
    function getGoodsReceiptConfirmationSupervisorAuthorizations() {
        let authorizations = [RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR];
        if (user?.settings?.goodsReceiptCreateSupervisorRequired) {
            return;
        }
        authorizations.push(RoleType.GOODS_RECEIPT_CONFIRMATION)
        return authorizations;
    }

    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster closeButton richColors={true} />
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/binCheck" element={<ProtectedRoute authorizations={[RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR]} element={<BinCheck/>}/>}/>
                    <Route path="/itemCheck" element={<ProtectedRoute authorizations={[RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR]} element={<ItemCheck/>}/>}/>
                    {/*Counting*/}
                    <Route path="/counting" element={<ProtectedRoute authorization={RoleType.COUNTING} element={<CountingList/>}/>}/>
                    <Route path="/counting/:scanCode" element={<ProtectedRoute authorization={RoleType.COUNTING} element={<CountingProcess/>}/>}/>
                    <Route path="/countingSupervisor" element={<ProtectedRoute authorization={RoleType.COUNTING_SUPERVISOR} element={<CountingSupervisor/>}/>}/>
                    <Route path="/countingSummaryReport/:scanCode" element={<ProtectedRoute authorization={RoleType.COUNTING_SUPERVISOR} element={<CountingSummaryReport/>}/>}/>
                    {/*Goods Receipt*/}
                    <Route path="/goodsReceipt" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT} element={<GoodsReceipt/>}/>}/>
                    <Route path="/goodsReceipt/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT} element={<GoodsReceiptProcess/>}/>}/>
                    <Route path="/goodsReceiptSupervisor" element={<ProtectedRoute authorizations={getGoodsReceiptSupervisorAuthorizations()} element={<GoodsReceiptSupervisor/>}/>}/>
                    <Route path="/goodsReceiptReport" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptReport/>}/>}/>
                    <Route path="/goodsReceiptVSExitReport/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptVSExitReport/>}/>}/>
                    <Route path="/goodsReceiptProcessDifferenceReport/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptProcessDifferenceReport/>}/>}/>
                    <Route path="/goodsReceiptReportAll/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR} element={<GoodsReceiptAll/>}/>}/>
                    {/*Goods Receipt Confirmation */}
                    <Route path="/goodsReceiptConfirmation" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION} element={<GoodsReceipt confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmation/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION} element={<GoodsReceiptProcess confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationSupervisor" element={<ProtectedRoute authorizations={getGoodsReceiptConfirmationSupervisorAuthorizations()} element={<GoodsReceiptSupervisor confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationReport" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationVSExitReport/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptVSExitReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationProcessDifferenceReport/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptProcessDifferenceReport confirm/>}/>}/>
                    <Route path="/goodsReceiptConfirmationReportAll/:scanCode" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR} element={<GoodsReceiptAll confirm/>}/>}/>
                    {/*Pick*/}
                    <Route path="/pick" element={<ProtectedRoute authorization={RoleType.PICKING} element={<Picking/>}/>}/>
                    <Route path="/pick/:idParam" element={<ProtectedRoute authorization={RoleType.PICKING} element={<PickingProcess/>}/>}/>
                    <Route path="/pick/:idParam/:typeParam/:entryParam" element={<ProtectedRoute authorization={RoleType.PICKING} element={<PickingProcessDetail/>}/>}/>
                    <Route path="/pickSupervisor" element={<ProtectedRoute authorization={RoleType.PICKING_SUPERVISOR} element={<PickingSupervisor/>}/>}/>
                    {/*<Route path="/PickReport" element={<ProtectedRoute authorization={Authorization.Pick_SUPERVISOR} element={<PickReport/>}/>}/>*/}
                    {/*Transfer*/}
                    <Route path="/transfer" element={<ProtectedRoute authorization={RoleType.TRANSFER} element={<Transfer/>}/>}/>
                    <Route path="/transfer/:scanCode" element={<ProtectedRoute authorization={RoleType.TRANSFER} element={<TransferProcess/>}/>}/>
                    <Route path="/transfer/:scanCode/source" element={<ProtectedRoute authorization={RoleType.TRANSFER} element={<TransferProcessSource/>}/>}/>
                    <Route path="/transfer/:scanCode/targetBins" element={<ProtectedRoute authorization={RoleType.TRANSFER} element={<TransferProcessTargetBins/>}/>}/>
                    {/*<Route path="/transfer/:scanCode/targetItems" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItems/>}/>}/>*/}
                    {/*<Route path="/transfer/:scanCode/targetItems/:itemCode" element={<ProtectedRoute authorization={Authorization.TRANSFER} element={<TransferProcessTargetItem/>}/>}/>*/}
                    <Route path="/transferSupervisor" element={<ProtectedRoute authorization={RoleType.TRANSFER_SUPERVISOR} element={<TransferSupervisor/>}/>}/>
                    <Route path="/transferRequest" element={<ProtectedRoute authorization={RoleType.TRANSFER_REQUEST} element={<TransferRequest/>}/>}/>
                    <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
