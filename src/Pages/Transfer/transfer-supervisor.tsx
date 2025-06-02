import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components";
import {fetchTransfers, TransferDocument, transferAction} from "@/pages/transfer/data/transfer-document";
import TransferCard from "@/pages/transfer/components/transfer-card";
import {ObjectAction, Status} from "@/assets/Common";
import {StringFormat} from "@/assets/Functions";
import TransferForm from "@/pages/transfer/components/transfer-form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {CheckCircle, XCircle} from "lucide-react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {Authorization} from "@/assets/Authorization";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {formatNumber} from "@/lib/utils";

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const {user} = useAuth();
    const {dateFormat} = useDateTimeFormat();
    const documentStatusToString = useDocumentStatusToString();
    
    function handleOpen(id: number) {
        navigate(`/transfer/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.TRANSFER);

    useEffect(() => {
        setLoading(true);
        fetchTransfers({progress: true})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);
    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        transferAction(selectedTransferId!, actionType!)
            .then(() => {
                setTransfers((prevTransfers) =>
                    prevTransfers.filter((transfer) => transfer.id !== selectedTransferId)
                );
                toast.success(actionType === "approve" ? t("transferApproved") : t("transferCancelled"));
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    };

    function handleAction(id: number, action: 'approve' | 'cancel') {
        setSelectedTransferId(id);
        setActionType(action);
        setDialogOpen(true);
    }

    return (
        <ContentTheme title={t("transferSupervisor")}>
            <TransferForm onNewTransfer={transfer => setTransfers((prevTransfers) => [transfer, ...prevTransfers])}/>
            <div className="my-4">
                {/* Mobile view - Cards */}
                <div className="block sm:hidden">
                    {transfers.map((transfer) => (
                        <TransferCard supervisor={true} key={transfer.id} doc={transfer} onAction={handleAction}/>
                    ))}
                </div>
                
                {/* Desktop view - Table */}
                <div className="hidden sm:block">
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
                                <TableHead className="text-right"></TableHead>
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
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleOpen(doc.id); }} className="text-blue-600 hover:underline">
                                                    {doc.id}
                                                </a>
                                            ) : (
                                                doc.id
                                            )}
                                        </TableCell>
                                        <TableCell>{dateFormat(new Date(doc.date))}</TableCell>
                                        <TableCell>{doc.employee.name}</TableCell>
                                        <TableCell>{documentStatusToString(doc.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Progress value={progressDisplayValue} className="w-20" />
                                                <span className="text-xs">{formatNumber(progressDisplayValue, 0)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{doc.comments || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {doc.status === Status.InProgress && doc.progress === 100 && (
                                                        <DropdownMenuItem onClick={() => handleAction?.(doc.id, 'approve')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            {t('finish')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem 
                                                        onClick={() => handleAction?.(doc.id, 'cancel')}
                                                        className="text-destructive"
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        {t('cancel')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {StringFormat(
                                actionType === "approve"
                                    ? t("confirmFinishTransfer")
                                    : t("confirmCancelTransfer"),
                                selectedTransferId
                            )}
                            <br/> {t('actionCannotReverse')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleConfirmAction}>
                            {t("accept")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContentTheme>
    );
}
