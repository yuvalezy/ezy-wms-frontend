import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AppContext";
import { RoleType } from "@/assets/RoleType";
import { useDateTimeFormat } from "@/assets/DateFormat";
import { useDocumentStatusToString } from "@/assets/DocumentStatusString";
import { formatNumber } from "@/lib/utils";
import { Status } from "@/assets/Common";
import {TransferDocument} from "@/features/transfer/data/transfer";

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

  const handleOpenLink = user?.roles?.includes(RoleType.TRANSFER);

  function handleOpen(transfer: TransferDocument) {
    navigate(`/transfer/${transfer.id}`);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('id')}</TableHead>
          <TableHead>{t('number')}</TableHead>
          <TableHead>{t('docDate')}</TableHead>
          <TableHead>{t('createdBy')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('progress')}</TableHead>
          <TableHead>{t('comment')}</TableHead>
          {supervisor && <TableHead className="text-right"></TableHead>}
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
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={progressDisplayValue} className="w-20" />
                  <span className="text-xs">{formatNumber(progressDisplayValue, 0)}%</span>
                </div>
              </TableCell>
              <TableCell>{doc.comments || '-'}</TableCell>
              {supervisor && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {doc.status === Status.InProgress && doc.progress === 100 && (
                        <DropdownMenuItem onClick={() => onAction?.(doc, 'approve')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('finish')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onAction?.(doc, 'cancel')}
                        className="text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t('cancel')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}