import React, {forwardRef, useImperativeHandle, useState} from "react";
import {useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {DetailUpdateParameters, Status} from "@/assets";
import {fetchTargetItemDetails, fetchTransfers, TargetItemDetail, TransferContent, TransferContentBin} from "@/pages/Transfer/data/transfer-document";
import {useDateTimeFormat} from "@/assets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface TransferTargetItemsDetailRef {
    show: (content: TransferContent, bin: TransferContentBin) => void;
    hide: () => void;
}

export interface TransferTargetItemsDetailProps {
    id: number;
    onUpdate: (data: DetailUpdateParameters) => void;
}

const TransferTargetItemsDetailsDialog = forwardRef((props: TransferTargetItemsDetailProps, ref) => {
    const {t} = useTranslation();
    const { dateFormat, timeFormat } = useDateTimeFormat();
    const {setLoading, setError} = useThemeContext();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<TransferContent | null>(null);
    const [bin, setBin] = useState<TransferContentBin | null>(null);
    const [data, setData] = useState<TargetItemDetail[]>([]);
    const [enableUpdate, setEnableUpdate] = useState(false);
    const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({}); // State to store checked rows
    const [quantityChanges, setQuantityChanges] = useState<{ [key: number]: number }>({}); // State to store quantity changes

    function update() {
        try {
            const removeRows = data?.filter(detail => checkedRows[detail.lineID]).map(detail => detail.lineID) ?? [];
            setIsOpen(false); // Close dialog after update attempt
            props.onUpdate({id: props.id, removeRows: removeRows, quantityChanges: quantityChanges});
        } catch (e) {
            setError(e);
        }
    }

    function loadDetails(contentArg: TransferContent, binArg: TransferContentBin) {
        setLoading(true);
        setEnableUpdate(false);
        setCheckedRows({});
        setQuantityChanges({});
        fetchTransfers({id: props.id})
            .then((transfer) => {
                setEnableUpdate(transfer[0].status === Status.InProgress);
                fetchTargetItemDetails(props.id, contentArg.code, binArg.entry)
                    .then((result) => {
                        setIsOpen(true);
                        setData(result);
                    })
                    .catch((error) => setError(error))
                    .finally(() => setLoading(false));
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    useImperativeHandle(ref, () => ({
        show(contentArg: TransferContent, binArg: TransferContentBin) {
            setContent(contentArg);
            setBin(binArg);
            loadDetails(contentArg, binArg);
        },
        hide() {
            setIsOpen(false);
        }
    }));

    function handleCheckboxChange(lineID: number, checked: boolean) {
        setCheckedRows(prevState => ({
            ...prevState,
            [lineID]: checked
        }));
        // setEnableUpdate(true); // Consider if this is still needed or if update button is always active when dialog is open
    }

    function handleQuantityChange(lineID: number, newValue: string) {
        const numValue = parseInt(newValue, 10);
        setQuantityChanges(prevState => ({
            ...prevState,
            [lineID]: isNaN(numValue) ? 0 : numValue,
        }));
        // setEnableUpdate(true);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg"> {/* Adjusted width */}
                <DialogHeader>
                    <DialogTitle>{t("detail")} - {bin?.code}</DialogTitle>
                    <DialogDescription>
                        {content?.code} - {content?.name}
                    </DialogDescription>
                </DialogHeader>
                
                {content && bin && data.length > 0 && (
                    <div className="max-h-[60vh] overflow-y-auto py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {enableUpdate && <TableHead className="w-[50px]"><Label>{t('delete')}</Label></TableHead>}
                                    <TableHead><Label>{t('employee')}</Label></TableHead>
                                    <TableHead><Label>{t('date')}</Label></TableHead>
                                    <TableHead><Label>{t('time')}</Label></TableHead>
                                    <TableHead className="text-right"><Label>{t('quantity')}</Label></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow key={row.lineID}>
                                        {enableUpdate && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={!!checkedRows[row.lineID]}
                                                    onCheckedChange={(checked) => handleCheckboxChange(row.lineID, !!checked)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{row.employeeName}</TableCell>
                                        <TableCell>{dateFormat(row.timeStamp)}</TableCell>
                                        <TableCell>{timeFormat(row.timeStamp)}</TableCell>
                                        <TableCell className="text-right">
                                            {enableUpdate ? (
                                                <Input
                                                    type="number"
                                                    className="w-20 text-right"
                                                    value={(quantityChanges[row.lineID] ?? row.quantity).toString()}
                                                    onChange={(e) => handleQuantityChange(row.lineID, e.target.value)}
                                                />
                                            ) : (
                                                row.quantity
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {(!data || data.length === 0) && <p className="py-4 text-center text-muted-foreground">{t("noDetailsAvailable")}</p>}

                <DialogFooter>
                    {enableUpdate && (
                        <Button onClick={update}>
                            {t("update")}
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        {t("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
export default TransferTargetItemsDetailsDialog;
