import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {IsNumeric, StringFormat} from "@/assets";
import {useAuth} from "@/components";
import {BinLocation, DetailUpdateParameters, SourceTarget} from "@/assets";
import {addItem, fetchTransferContent, TransferContent, TransferContentBin, updateTransferTargetItem} from "./Data/TransferDocument";
import ProcessAlert, {ProcessAlertValue} from "../../components/ProcessAlert";
import { MessageStripDesign } from "@ui5/webcomponents-react";
import {ScrollableContent, ScrollableContentBox} from "@/components";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BinLocationScanner, {BinLocationScannerRef} from "../../components/BinLocationScanner";
import {delay}from "@/assets";
import Processes, {ProcessesRef} from "../../components/Processes";
import {ReasonType} from "@/assets";
import {updateLine} from "./Data/TransferProcess";
import TransferTargetItemsDetailsDialog, {TransferTargetItemsDetailRef} from "@/pages/Transfer/components/TransferTargetItemDetails";
import {Authorization}from "@/assets";
import {useDateTimeFormat} from "@/assets";

export default function TransferProcessTargetItem() {
    const {scanCode, itemCode} = useParams();
    const {t} = useTranslation();
    const { dateTimeFormat } = useDateTimeFormat();
    const [id, setID] = useState<number | null>();
    const [supervisor, setSupervisor] = useState<boolean>(false);
    const {setLoading, setError} = useThemeContext();
    const {user} = useAuth();
    const [content, setContent] = useState<TransferContent | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const navigate = useNavigate();
    const binRef = useRef<BinLocationScannerRef>(null);
    const processesRef = useRef<ProcessesRef>(null);
    const detailDialogRef = useRef<TransferTargetItemsDetailRef>(null);

    const title = `${t("transfer")} #${scanCode} - ${t("selectTransferTargetItems")}`;

    useEffect(() => {
        if (scanCode == null || !IsNumeric(scanCode) || itemCode == null) {
            setID(null);
            return;
        }
        setLoading(true);
        let value = parseInt(scanCode);
        setID(value);
        setSupervisor(user?.authorizations?.filter((v) => v === Authorization.TRANSFER_SUPERVISOR)?.length === 1);
        loadData(value);
        delay(1).then(() => binRef?.current?.focus());
    }, []);

    function loadData(value?: number) {
        fetchTransferContent({id: value ?? id ?? 0, type: SourceTarget.Target, targetBins: true, itemCode})
            .then((results) => {
                if (results.length > 0) {
                    setContent(results[0]);
                } else {
                    setError(StringFormat(t('transferItemNotFound'), itemCode));
                }
            })
            .catch((e) => {
                setError(e);
            })
            .finally(() => setLoading(false));
    }

    function onScan(bin: BinLocation) {
        if (id == null || itemCode == null) {
            return;
        }
        addItem({id, itemCode, type: SourceTarget.Target, binEntry: bin.entry})
            .then((v) => {
                if (v.errorMessage != null) {
                    setError(v.errorMessage);
                    return;
                }
                let date = new Date(Date.now());
                setCurrentAlert({
                    lineID: v.lineID,
                    quantity: 1,
                    itemCode: itemCode,
                    severity: MessageStripDesign.Information, // For ProcessAlert
                    timeStamp: dateTimeFormat(date)
                })
                binRef?.current?.clear();
                loadData()
                binRef?.current?.focus();
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    }

    function handleQuantityChanged(quantity: number) {
        if (currentAlert == null)
            return;
        acceptAlertChanged({
            ...currentAlert,
            quantity: quantity,
        });
    }

    function handleCancel(comment: string, cancel: boolean) {
        if (currentAlert == null)
            return;
        acceptAlertChanged({
            ...currentAlert,
            comment: comment,
            canceled: cancel,
        });
    }

    function acceptAlertChanged(newAlert: ProcessAlertValue): void {
        setCurrentAlert(newAlert);
        loadData();
    }

    function handleClick(bin: TransferContentBin) {
        if (content == null)
            return;
        detailDialogRef?.current?.show(content, bin);
    }

    function navigateBack() {
        navigate(`/transfer/${id}/targetItems`);
    }

    function onUpdate(data: DetailUpdateParameters) {
        if (id == null) {
            return;
        }
        setLoading(true);
        updateTransferTargetItem(data)
            .then(() => {
                detailDialogRef?.current?.hide();
                loadData();
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    return (
        <ContentTheme title={title} onBack={() => navigateBack()}>
            {content &&
                <ScrollableContent>
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>
                                <strong>{t("item")}: </strong>
                                {content.code} - {content.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>{t("quantity")}: </strong>{content.quantity}</p>
                            <p><strong>{t("openQuantity")}: </strong>{content.openQuantity}</p>
                            <Progress value={content.progress ?? 0} className="mt-2 h-3" />
                            <p className="text-xs text-muted-foreground text-center mt-1">{`${content.progress ?? 0}%`}</p>
                        </CardContent>
                    </Card>
                    <ScrollableContentBox>
                        {currentAlert && <ProcessAlert alert={currentAlert} onAction={(type) => processesRef?.current?.open(type)}/>}
                        {content?.bins && content.bins.length > 0 && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead><Label>{t('bin')}</Label></TableHead>
                                            <TableHead className="text-right"><Label>{t('quantity')}</Label></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {content.bins.map((bin) => (
                                            <TableRow key={bin.entry}>
                                                <TableCell><Label>{bin.code}</Label></TableCell>
                                                <TableCell className="text-right">
                                                    {supervisor ? (
                                                        <a href="#" onClick={e => { e.preventDefault(); handleClick(bin); }} className="text-blue-600 hover:underline">
                                                            {bin.quantity}
                                                        </a>
                                                    ) : (
                                                        bin.quantity
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                         {(!content?.bins || content.bins.length === 0) && (
                            <div className="p-4 text-center text-muted-foreground">
                                {t("noBinsForItem")}
                            </div>
                        )}
                    </ScrollableContentBox>
                    {user?.binLocations && (content.progress ?? 0) < 100 && <BinLocationScanner ref={binRef} onScan={onScan}/>}
                </ScrollableContent>
            }
            {currentAlert && id && <Processes
                ref={processesRef}
                id={id}
                alert={currentAlert}
                reasonType={ReasonType.Transfer}
                onCancel={handleCancel}
                onQuantityChanged={handleQuantityChanged}
                onUpdateLine={updateLine}
                onUpdateComplete={loadData}
            />}
            {id && <TransferTargetItemsDetailsDialog ref={detailDialogRef} id={id} onUpdate={onUpdate}/>}
        </ContentTheme>
    );
}
