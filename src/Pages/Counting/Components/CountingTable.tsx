import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faFileAlt } from '@fortawesome/free-solid-svg-icons';
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
import { Counting } from "@/assets/Counting";
import { Status } from "@/assets/Common";

interface CountingTableProps {
  countings: Counting[];
  supervisor?: boolean;
  onAction?: (doc: Counting, action: 'approve' | 'cancel') => void;
}

export default function CountingTable({ countings, supervisor = false, onAction }: CountingTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dateFormat } = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();

  const handleOpenLink = user?.roles?.includes(RoleType.COUNTING);

  function handleOpen(id: string) {
    navigate(`/counting/${id}`);
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
          {supervisor && <TableHead className="text-right"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {countings.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>{doc.name || '-'}</TableCell>
            <TableCell>
              {handleOpenLink ? (
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handleOpen(doc.id);
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
            {supervisor && (
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/countingSummaryReport/${doc.id}`)}>
                      <FontAwesomeIcon icon={faFileAlt} className="mr-2 h-4 w-4" />
                      {t('countingSummaryReport')}
                    </DropdownMenuItem>
                    {doc.status === Status.InProgress && (
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
        ))}
      </TableBody>
    </Table>
  );
}