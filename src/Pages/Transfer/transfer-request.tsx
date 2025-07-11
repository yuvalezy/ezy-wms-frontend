import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import BarCodeScanner, {AddItemValue, BarCodeScannerRef} from "../../components/BarCodeScanner";
import React, {useEffect, useRef, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus } from 'lucide-react';
import {useThemeContext} from "@/components";
import {StringFormat} from "@/assets";
import {useNavigate} from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription, // Add DialogDescription here
} from "@/components/ui/dialog";
import {TransferContent} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";

export default function TransferRequest() {
    const {t} = useTranslation();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const {setLoading, setError} = useThemeContext();
    const [rows, setRows] = useState<TransferContent[]>([]);
    const quantityRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToRemoveIndex, setItemToRemoveIndex] = useState<number | null>(null);

    function handleAddItem(value: AddItemValue) {
        const item = value.item;
        const unit = value.unit;
        try {
            const duplicateItem = rows.find(row => row.itemCode === item.code);

            if (duplicateItem) {
                setError(t('duplicateItems'));
                return;
            }

            let newRow: TransferContent = {
                itemCode: item.code,
                quantity: 1,
                openQuantity: 0,
                numInBuy: 1,
                purPackMsr: "N/A",
                buyUnitMsr:"N/A",
                purPackUn: 1,
                unit: unit,
                itemName: item.name,
            }
            setRows((prevRows) => [...prevRows, newRow]);
            barcodeRef?.current?.clear();
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (rows.length === 0) {
            return;
        }
        const lastIndex = rows.length - 1;
        const lastRef = quantityRefs.current[lastIndex];
        lastRef?.focus();
    }, [rows]); // Run this effect every time rows change

    function handleQuantityChange(index: number, newQuantity: string) {
        const updatedRows = rows.map((row, i) =>
            i === index ? { ...row, quantity: parseInt(newQuantity, 10) } : row
        );
        setRows(updatedRows);
    }

    function confirmRemoveRow(index: number) {
        setItemToRemoveIndex(index);
        setConfirmDialogOpen(true);
    }

    function executeRemoveRow() {
        if (itemToRemoveIndex === null) return;
        setRows((currentRows) => {
            const rowsCopy = [...currentRows];
            rowsCopy.splice(itemToRemoveIndex, 1);
            return rowsCopy;
        });
        setConfirmDialogOpen(false);
        setItemToRemoveIndex(null);
    }

    function create() {
        try {
            setLoading(true);
            transferService.createRequest(rows)
                .then((v) => {
                    toast.success(StringFormat(t('transferRequestCreated'), v));
                    navigate('/');
                })
                .catch((e) => setError(e))
                .finally(() => setLoading(false));
        } catch (e) {
            setError(e);
        }
    }

    return (
        <ContentTheme title={t("transferRequest")}>
            <div className="space-y-4">
                {rows.length > 0 && (
                    <ScrollArea className="h-64 w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('code')}</TableHead>
                                    <TableHead>{t('description')}</TableHead>
                                    <TableHead className="w-24">{t('quantity')}</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.itemCode}</TableCell>
                                        <TableCell>{row.itemName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={row.quantity.toString()}
                                                ref={el => quantityRefs.current[index] = el}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => confirmRemoveRow(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
                {rows.length > 0 && (
                    <div className="text-center">
                        <Button onClick={() => create()}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('create')}
                        </Button>
                    </div>
                )}
                {rows.length === 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription>
                            {t("scanItemBarCodeStart")}
                        </AlertDescription>
                    </Alert>
                )}
                <BarCodeScanner ref={barcodeRef} onAddItem={handleAddItem} item={true} enabled={true}/>
            </div>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("confirmRemove")}</DialogTitle>
                        <DialogDescription>
                            {StringFormat(t('confirmRemoveItem'), itemToRemoveIndex !== null ? rows[itemToRemoveIndex].itemCode : '')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button variant="destructive" onClick={executeRemoveRow}>
                            {t("remove")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentTheme>
    )
}
