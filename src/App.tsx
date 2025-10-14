import React, {useEffect} from 'react';
import './App.css';
import {BrowserRouter, Route, Routes, useNavigate} from "react-router";
import Login from "./Pages/Login";
import HomePage from "./Pages/Home";
import {AuthProvider, useAuth} from "@/components";
import {NotificationProvider} from "@/components/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import NotFound from "./components/NotFound";
import {setNavigateCallback} from "./utils/axios-instance";
import ItemCheck from "@/Pages/items/ItemCheck";
import PickingSupervisor from "./Pages/Picking/picking-supervisor";
import PickingUser from "./Pages/Picking/picking-user";
import PickingProcess from "./Pages/Picking/picking-process";
import PickingProcessDetail from "./Pages/Picking/picking-process-detail";
import PickingCheck from "./Pages/Picking/picking-check";
import GoodsReceipt from "./Pages/GoodsReceipt/GoodsReceipt";
import GoodsReceiptProcess from "./Pages/GoodsReceipt/GoodsReceiptProcess";
import GoodsReceiptSupervisor from "./Pages/GoodsReceipt/GoodsReceiptSupervisor";
import {GoodsReceiptReport} from "./Pages/GoodsReceipt/GoodsReceiptReport";
import GoodsReceiptVSExitReport from "./Pages/GoodsReceipt/GoodsReceiptVSExitReport";
import GoodsReceiptAll from './Pages/GoodsReceipt/GoodsReceiptAll';
import CountingList from "./Pages/Counting/Counting";
import CountingProcess from "./Pages/Counting/CountingProcess";
import CountingSupervisor from "./Pages/Counting/CountingSupervisor";
import TransferUser from "./Pages/Transfer/transfer-user";
import TransferSupervisor from "./Pages/Transfer/transfer-supervisor";
import TransferProcess from "./Pages/Transfer/transfer-process";
import TransferProcessSource from "./Pages/Transfer/transfer-process-source";
import CountingSummaryReport from "./Pages/Counting/CountingSummaryReport";
import {BinCheck} from "./Pages/items/BinCheck";
import {PackageCheck} from "./Pages/items/PackageCheck";
import GoodsReceiptProcessDifferenceReport from "./Pages/GoodsReceipt/GoodsReceiptProcessDifferenceReport";
import TransferProcessTargetBins from "./Pages/Transfer/transfer-process-target-bins";
import TransferRequest from "./Pages/Transfer/transfer-request";
import {Toaster} from 'sonner';
import CancellationReasonsList from "@/Pages/settings/cancellation-reasons-list";
import UsersList from "@/Pages/settings/users-list";
import AuthorizationGroupsList from "@/Pages/settings/authorization-groups-list";
import AuthorizationGroupForm from "@/features/authorization-groups/components/authorization-group-form";
import {OfflineOverlay} from "./components/OfflineOverlay";
import {useOfflineDetection} from "./hooks/useOfflineDetection";
import DevicesList from "@/Pages/settings/devices-list";
import {License} from "@/Pages/settings/license";
import ExternalAlertsList from "@/Pages/settings/external-alerts-list";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ProcessType} from "@/features/shared/data";
import {TransferProcessProvider} from "@/features/transfer/context/TransferProcessContext";

function AppRoutes() {
  const {user} = useAuth();
  const isOffline = useOfflineDetection();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigateCallback(navigate);
  }, [navigate]);

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

  function getTransferSupervisorAuthorizations() {
    let authorizations = [RoleType.TRANSFER_SUPERVISOR];
    if (user?.settings?.transferCreateSupervisorRequired) {
      return authorizations;
    }
    authorizations.push(RoleType.TRANSFER)
    return authorizations;
  }

  function getAuthenticationRoutes() {
    return (
      <>
        <Route path="/login" element={<Login/>}/>
        <Route path="/unauthorized" element={<Unauthorized/>}/>
      </>
    );
  }

  function getGeneralCheckRoutes() {
    const supervisorAuthorizations = [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR];
    const packageAuthorizations = [...supervisorAuthorizations, RoleType.PACKAGE_MANAGEMENT, RoleType.PACKAGE_MANAGEMENT_SUPERVISOR];

    return (
      <>
        <Route path="/binCheck" element={<ProtectedRoute
          authorizations={supervisorAuthorizations}
          element={<BinCheck/>}/>}/>
        <Route path="/binCheck/:binEntry/:binCode" element={<ProtectedRoute
          authorizations={supervisorAuthorizations}
          element={<BinCheck/>}/>}/>
        <Route path="/itemCheck" element={<ProtectedRoute
          authorizations={supervisorAuthorizations}
          element={<ItemCheck/>}/>}/>
        <Route path="/itemCheck/:code" element={<ProtectedRoute
          authorizations={supervisorAuthorizations}
          element={<ItemCheck/>}/>}/>
        <Route path="/packageCheck" element={<ProtectedRoute
          authorizations={packageAuthorizations}
          element={<PackageCheck/>}/>}/>
        <Route path="/packageCheck/:id/:barcode" element={<ProtectedRoute
          authorizations={packageAuthorizations}
          element={<PackageCheck/>}/>}/>
      </>
    );
  }

  function getCountingRoutes() {
    return (
      <>
        <Route path="/counting"
               element={<ProtectedRoute authorization={RoleType.COUNTING} element={<CountingList/>}/>}/>
        <Route path="/counting/:scanCode"
               element={<ProtectedRoute authorization={RoleType.COUNTING} element={<CountingProcess/>}/>}/>
        <Route path="/countingSupervisor" element={<ProtectedRoute authorization={RoleType.COUNTING_SUPERVISOR}
                                                                   element={<CountingSupervisor/>}/>}/>
        <Route path="/countingSummaryReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.COUNTING_SUPERVISOR}
                                        element={<CountingSummaryReport/>}/>}/>
      </>
    );
  }

  function getGoodsReceiptRoutes() {
    return (
      <>
        <Route path="/goodsReceipt" element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT}
                                                             element={<GoodsReceipt
                                                               processType={ProcessType.Regular}
                                                               key="goodsReceipt"/>}/>}/>
        <Route path="/goodsReceipt/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT}
                                        element={<GoodsReceiptProcess 
                                                  processType={ProcessType.Regular}
                                                  key="goodsReceiptProcess"/>}/>}/>
        <Route path="/goodsReceiptSupervisor"
               element={<ProtectedRoute authorizations={getGoodsReceiptSupervisorAuthorizations()}
                                        element={<GoodsReceiptSupervisor 
                                                  processType={ProcessType.Regular}
                                                  key="goodsReceipt"/>}/>}/>
        <Route path="/goodsReceiptReport"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR}
                                        element={<GoodsReceiptReport 
                                                  processType={ProcessType.Regular}
                                                  key="goodsReceiptReport"/>}/>}/>
        <Route path="/goodsReceiptVSExitReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR}
                                        element={<GoodsReceiptVSExitReport
                                          processType={ProcessType.Regular}
                                          key="goodsReceiptVSExitReport"/>}/>}/>
        <Route path="/goodsReceiptProcessDifferenceReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR}
                                        element={<GoodsReceiptProcessDifferenceReport
                                          processType={ProcessType.Regular}
                                          key="goodsReceiptProcessDifferenceReport"/>}/>}/>
        <Route path="/goodsReceiptReportAll/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_SUPERVISOR}
                                        element={<GoodsReceiptAll 
                                          processType={ProcessType.Regular}
                                          key="goodsReceiptAll"/>}/>}/>
      </>
    );
  }

  function getGoodsReceiptConfirmationRoutes() {
    return (
      <>
        <Route path="/goodsReceiptConfirmation"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION}
                                        element={<GoodsReceipt 
                                                  processType={ProcessType.Confirmation} 
                                                  key="receiptConfirmation"/>}/>}/>
        <Route path="/goodsReceiptConfirmation/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION}
                                        element={<GoodsReceiptProcess 
                                                  processType={ProcessType.Confirmation}
                                                  key="receiptConfirmationProcess"/>}/>}/>
        <Route path="/goodsReceiptConfirmationSupervisor" element={<ProtectedRoute
          authorizations={getGoodsReceiptConfirmationSupervisorAuthorizations()}
          element={<GoodsReceiptSupervisor 
                    processType={ProcessType.Confirmation} 
                    key="receiptConfirmation"/>}/>}/>
        <Route path="/goodsReceiptConfirmationReport"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptReport 
                                                  processType={ProcessType.Confirmation}
                                                  key="receiptConfirmationReport"/>}/>}/>
        <Route path="/goodsReceiptConfirmationVSExitReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptVSExitReport 
                                                  processType={ProcessType.Confirmation}
                                                  key="receiptConfirmationVSExitReport"/>}/>}/>
        <Route path="/goodsReceiptConfirmationProcessDifferenceReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptProcessDifferenceReport 
                                                  processType={ProcessType.Confirmation}
                                                  key="receiptConfirmationProcessDifferenceReport"/>}/>}/>
        <Route path="/goodsReceiptConfirmationReportAll/:scanCode"
               element={<ProtectedRoute authorization={RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptAll 
                                                  processType={ProcessType.Confirmation}
                                                  key="receiptConfirmationAll"/>}/>}/>
      </>
    );
  }

  function getPickingRoutes() {
    return (
      <>
        <Route path="/pick" element={<ProtectedRoute authorization={RoleType.PICKING} element={<PickingUser/>}/>}/>
        <Route path="/pick/:idParam"
               element={<ProtectedRoute authorization={RoleType.PICKING} element={<PickingProcess/>}/>}/>
        <Route path="/pick/:idParam/:typeParam/:entryParam"
               element={<ProtectedRoute authorization={RoleType.PICKING} element={<PickingProcessDetail/>}/>}/>
        <Route path="/pick/:id/check"
               element={<ProtectedRoute authorizations={[RoleType.PICKING, RoleType.PICKING_SUPERVISOR]} element={<PickingCheck/>}/>}/>
        <Route path="/pickSupervisor" element={<ProtectedRoute authorization={RoleType.PICKING_SUPERVISOR}
                                                               element={<PickingSupervisor/>}/>}/>
      </>
    );
  }

  function getTransferRoutes() {
    return (
      <>
        <Route path="/transfer"
               element={<ProtectedRoute authorization={RoleType.TRANSFER} element={<TransferUser/>}/>}/>
        <Route path="/transfer/:scanCode/*"
               element={
                 <ProtectedRoute
                   authorization={RoleType.TRANSFER}
                   element={
                     <TransferProcessProvider>
                       <Routes>
                         <Route path="/" element={<TransferProcess/>}/>
                         <Route path="/source" element={<TransferProcessSource/>}/>
                         <Route path="/targetBins" element={<TransferProcessTargetBins/>}/>
                       </Routes>
                     </TransferProcessProvider>
                   }
                 />
               }/>
        <Route path="/transferSupervisor" element={<ProtectedRoute authorizations={getTransferSupervisorAuthorizations()}
                                                                   element={<TransferSupervisor/>}/>}/>
        <Route path="/transferRequest"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_REQUEST} element={<TransferRequest/>}/>}/>
      </>
    );
  }

  function getTransferConfirmationRoutes() {
    return (
      <>
        <Route path="/transferConfirmation"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_CONFIRMATION}
                                        element={<GoodsReceipt 
                                                  processType={ProcessType.TransferConfirmation} 
                                                  key="transferConfirmation"/>}/>}/>
        <Route path="/transferConfirmation/:scanCode"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_CONFIRMATION}
                                        element={<GoodsReceiptProcess 
                                                  processType={ProcessType.TransferConfirmation}
                                                  key="transferConfirmationProcess"/>}/>}/>
        <Route path="/transferConfirmationSupervisor" element={<ProtectedRoute
          authorizations={getGoodsReceiptConfirmationSupervisorAuthorizations()}
          element={<GoodsReceiptSupervisor 
                    processType={ProcessType.TransferConfirmation} 
                    key="transferConfirmation"/>}/>}/>
        <Route path="/transferConfirmationReport"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptReport 
                                                  processType={ProcessType.TransferConfirmation}
                                                  key="transferConfirmationReport"/>}/>}/>
        <Route path="/transferConfirmationProcessDifferenceReport/:scanCode"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptProcessDifferenceReport 
                                                  processType={ProcessType.TransferConfirmation}
                                                  key="transferConfirmationProcessDifferenceReport"/>}/>}/>
        <Route path="/transferConfirmationReportAll/:scanCode"
               element={<ProtectedRoute authorization={RoleType.TRANSFER_CONFIRMATION_SUPERVISOR}
                                        element={<GoodsReceiptAll 
                                                  processType={ProcessType.TransferConfirmation}
                                                  key="transferConfirmationAll"/>}/>}/>
      </>
    );
  }

  function getSettingsRoutes() {
    return (
      <>
        <Route path="/settings/cancelReasons"
               element={<ProtectedRoute superUser element={<CancellationReasonsList/>}/>}/>
        <Route path="/settings/users" element={<ProtectedRoute superUser element={<UsersList/>}/>}/>
        <Route path="/settings/authorizationGroups"
               element={<ProtectedRoute superUser element={<AuthorizationGroupsList/>}/>}/>
        <Route path="/settings/authorizationGroups/add"
               element={<ProtectedRoute superUser element={<AuthorizationGroupForm/>}/>}/>
        <Route path="/settings/authorizationGroups/:id"
               element={<ProtectedRoute superUser element={<AuthorizationGroupForm/>}/>}/>
        <Route path="/settings/devices" element={<ProtectedRoute superUser element={<DevicesList/>}/>}/>
        <Route path="/settings/license" element={<ProtectedRoute superUser element={<License/>}/>}/>
        <Route path="/settings/externalAlerts" element={<ProtectedRoute superUser element={<ExternalAlertsList/>}/>}/>
      </>
    );
  }

  function getDefaultRoutes() {
    return (
      <>
        <Route path="/" element={<ProtectedRoute element={<HomePage/>}/>}/>
        <Route path="*" element={<NotFound/>}/>
      </>
    );
  }

  return (
    <>
      <Toaster closeButton richColors={true}/>
      {isOffline && <OfflineOverlay/>}
      <Routes>
        {getAuthenticationRoutes()}
        {getGeneralCheckRoutes()}
        {getCountingRoutes()}
        {getGoodsReceiptRoutes()}
        {getGoodsReceiptConfirmationRoutes()}
        {getPickingRoutes()}
        {getTransferRoutes()}
        {getTransferConfirmationRoutes()}
        {getSettingsRoutes()}
        {getDefaultRoutes()}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes/>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
