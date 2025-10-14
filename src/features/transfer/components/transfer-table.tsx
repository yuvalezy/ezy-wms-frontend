import React from "react";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {CheckCircle, XCircle} from "lucide-react";
import {ResponsiveTableActions, TableAction} from '@/components/ui/responsive-table-actions';
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";

interface TransferTableProps {
  transfers: TransferDocument[];
  supervisor?: boolean;
  onAction?: (transfer: TransferDocument, action: 'approve' | 'cancel') => void;
}

export default function TransferTable({ transfers, supervisor = false, onAction }: TransferTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dateFormat } = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const settings = user!.settings;

  const handleOpenLink = user?.roles?.includes(RoleType.TRANSFER);

  function handleOpen(transfer: TransferDocument) {
    navigate(`/transfer/${transfer.id}`);
  }

  const getTransferActions = (doc: TransferDocument): TableAction[] => {
    const actions: TableAction[] = [];

    // Finish action (conditional - only when in progress and 100% complete)
    if (doc.status === Status.InProgress && doc.progress === 100) {
      actions.push({
        key: 'finish',
        label: t('finish'),
        icon: CheckCircle,
        onClick: () => onAction?.(doc, 'approve'),
        variant: 'default'
      });
    }

    // Cancel action (always available)
    actions.push({
      key: 'cancel',
      label: t('cancel'),
      icon: XCircle,
      onClick: () => onAction?.(doc, 'cancel'),
      variant: 'destructive',
      separator: doc.status === Status.InProgress && doc.progress === 100
    });

    return actions;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('id')}</TableHead>
          <TableHead>{t('number')}</TableHead>
          <TableHead>{t('docDate')}</TableHead>
          <TableHead>{t('createdBy')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          {settings.enableWarehouseTransfer && <TableHead>{t('targetWarehouse')}</TableHead>}
          <TableHead>{t('progress')}</TableHead>
          <TableHead>{t('comment')}</TableHead>
          {supervisor && <TableHead className="text-right min-w-[100px] w-auto"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((doc) => {
          const progressDisplayValue = doc.progress ?? 0;
          return (
            <TableRow key={doc.id}>
              <TableCell>{doc.name || '-'}</TableCell>
              <TableCell>
                {handleOpenLink ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpen(doc);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {doc.number}
                  </a>
                ) : (
                  doc.number
                )}
              </TableCell>
              <TableCell>{dateFormat(doc.date)}</TableCell>
              <TableCell>{doc.createdByUser?.fullName}</TableCell>
              <TableCell>{documentStatusToString(doc.status)}</TableCell>
              {settings.enableWarehouseTransfer && <TableCell>{doc.targetWhsCode || '-'}</TableCell>}
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={progressDisplayValue} className="w-20" />
                  <span className="text-xs">{formatNumber(progressDisplayValue, 0)}%</span>
                </div>
              </TableCell>
              <TableCell>{doc.comments || '-'}</TableCell>
              {supervisor && (
                <TableCell className="text-right">
                  <ResponsiveTableActions actions={getTransferActions(doc)} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}