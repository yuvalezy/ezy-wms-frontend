import React from "react";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {CheckCircle, FileText, XCircle} from "lucide-react";
import {ResponsiveTableActions, TableAction} from '@/components/ui/responsive-table-actions';
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {Counting} from "@/features/counting/data/counting";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

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

  const getCountingActions = (doc: Counting): TableAction[] => {
    const actions: TableAction[] = [];

    // Summary report action
    actions.push({
      key: 'summary-report',
      label: t('countingSummaryReport'),
      icon: FileText,
      onClick: () => navigate(`/countingSummaryReport/${doc.id}`),
      variant: 'outline'
    });

    // Finish action (conditional)
    if (doc.status === Status.InProgress) {
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
      separator: true
    });

    return actions;
  };

  const displayId = countings.find(v => v.name != null && v.name != "") != null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {displayId && <TableHead>{t('id')}</TableHead>}
          <TableHead>{t('number')}</TableHead>
          <TableHead>{t('docDate')}</TableHead>
          <TableHead>{t('createdBy')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          {supervisor && <TableHead className="text-right min-w-[100px] w-auto"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {countings.map((doc) => (
          <TableRow key={doc.id}>
            {displayId && <TableCell>{doc.name || '-'}</TableCell>}
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
                <ResponsiveTableActions actions={getCountingActions(doc)} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}