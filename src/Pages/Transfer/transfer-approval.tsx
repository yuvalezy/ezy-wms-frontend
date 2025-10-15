import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components";
import TransferCard from "@/features/transfer/components/transfer-card";
import TransferTable from "@/features/transfer/components/transfer-table";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {Status} from "@/features/shared/data";
import {useParams} from "react-router";
import {ObjectAction} from "@/features/packages/types";
import {TransferTableSkeleton} from "@/features/transfer/components/transfer-table-skeleton";
import {TransferCardSkeleton} from "@/features/transfer/components/transfer-card-skeleton";
import {TransferApprovalDialog} from "@/features/transfer/components/transfer-approval-dialog";
import {useTransferApproval} from "@/features/transfer/hooks/use-transfer-approval";

export default function TransferApproval() {
    const {t} = useTranslation();
    const {setError} = useThemeContext();
    const {id} = useParams<{id: string}>();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {
        dialogOpen,
        actionType,
        rejectionReason,
        rejectionReasonError,
        dialogError,
        isProcessing,
        selectedTransferNumber,
        handleAction,
        handleRejectionReasonChange,
        handleConfirmAction,
        handleCancelDialog,
        setDialogOpen,
    } = useTransferApproval({
        onSuccess: () => {
            // Remove from list after successful action
            fetchTransfers();
        }
    });

    useEffect(() => {
        fetchTransfers();
    }, [id]);

    const fetchTransfers = () => {
        setIsLoading(true);
        const searchParams = id
            ? {id, statuses: [Status.WaitingForApproval], progress: true}
            : {statuses: [Status.WaitingForApproval], progress: true};

        transferService.search(searchParams)
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setIsLoading(false));
    };

    function handleTransferAction(transfer: TransferDocument, action: ObjectAction) {
        if (transfer.id) {
            handleAction(transfer.id, transfer.number, action);
        }
    }

    return (
        <ContentTheme title={t('transferApprovals')}>
            <div className="my-4">
                {isLoading ? (
                    <>
                        {/* Mobile view - Card skeletons */}
                        <div className="block sm:hidden" aria-label="Loading...">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <TransferCardSkeleton key={index} />
                            ))}
                        </div>

                        {/* Desktop view - Table skeleton */}
                        <div className="hidden sm:block" aria-label="Loading...">
                            <TransferTableSkeleton />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mobile view - Cards */}
                        <div className="block sm:hidden">
                            {transfers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {t('noTransfersAwaitingApproval')}
                                </div>
                            ) : (
                                transfers.map((transfer) => (
                                    <TransferCard
                                        supervisor={true}
                                        approval={true}
                                        key={transfer.id}
                                        doc={transfer}
                                        onAction={handleTransferAction}
                                    />
                                ))
                            )}
                        </div>

                        {/* Desktop view - Table */}
                        <div className="hidden sm:block">
                            <TransferTable
                                transfers={transfers}
                                supervisor={true}
                                approval={true}
                                onAction={handleTransferAction}
                                emptyMessage={t('noTransfersAwaitingApproval')}
                            />
                        </div>
                    </>
                )}
            </div>

            <TransferApprovalDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                actionType={actionType}
                transferNumber={selectedTransferNumber}
                rejectionReason={rejectionReason}
                onReasonChange={handleRejectionReasonChange}
                rejectionReasonError={rejectionReasonError}
                dialogError={dialogError}
                isProcessing={isProcessing}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelDialog}
            />
        </ContentTheme>
    );
}
