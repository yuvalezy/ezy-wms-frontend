import ContentTheme from "../../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useAuth} from "../../Components/AppContext";
import {AxiosErrorResponse, BinLocation, SourceTarget} from "../../Assets/Common";
import {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {addItem, fetchTransferContent, TransferContent} from "./Data/Transfer";
import {ProcessAlertValue} from "../../Components/ProcessAlert";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {ScrollableContent, ScrollableContentBox} from "../../Components/ScrollableContent";
import {Button, Label, MessageStrip, Panel, Text, ProgressIndicator, Table, TableCell, TableColumn, TableRow, Title} from "@ui5/webcomponents-react";
import BinLocationScanner, {BinLocationScannerRef} from "../../Components/BinLocationScanner";
import {delay} from "../../Assets/GlobalConfig";
import {AxiosError} from "axios";

export default function TransferProcessTargetItem() {
    const {scanCode, itemCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const {setLoading, setAlert} = useThemeContext();
    const {user} = useAuth();
    const [content, setContent] = useState<TransferContent | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const navigate = useNavigate();
    const binRef = useRef<BinLocationScannerRef>(null);

    const title = `${t("transfer")} #${scanCode} - ${t("selectTransferTarget")}`;

    useEffect(() => {
        if (scanCode == null || !IsNumeric(scanCode) || itemCode == null) {
            setID(null);
            return;
        }
        setLoading(true);
        let value = parseInt(scanCode);
        setID(value);
        loadData(value);
        delay(1).then(() => binRef?.current?.focus());
    }, []);

    function errorMessage(message: string) {
        setAlert({
            message: message,
            type: MessageStripDesign.Negative,
        });
    }

    function loadData(value: number) {
        fetchTransferContent({id: value ?? id, type: SourceTarget.Target, targetBins: true, itemCode})
            .then((results) => {
                if (results.length > 0) {
                    setContent(results[0]);
                } else {
                    errorMessage(StringFormat(t('transferItemNotFound'), itemCode));
                }
            })
            .catch((e) => {
                errorMessage(`Loading Rows Error: ${e}`);
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
                    errorMessage(v.errorMessage);
                    return;
                }
                let date = new Date(Date.now());
                setCurrentAlert({
                    lineID: v.lineID,
                    quantity: 1,
                    itemCode: itemCode,
                    severity: MessageStripDesign.Information,
                    timeStamp: date.toLocaleDateString() + " " + date.toLocaleTimeString()
                })
                binRef?.current?.clear();
                loadData(id)
                binRef?.current?.focus();
            })
            .catch((error) => {
                let message = error.message;
                try {
                    const axiosError = error as AxiosError;
                    const data = axiosError.response?.data as AxiosErrorResponse;
                    message = data?.exceptionMessage;
                } catch(e) {
                }
                errorMessage(`Add Item Error Error: ${message}`);
            })
            .finally(() => setLoading(false));
    }

    function navigateBack() {
        navigate(`/transfer/${id}/target`);
    }

    return (
        <ContentTheme title={title} icon="functional-location" back={() => navigateBack()}>
            {content &&
                <ScrollableContent>
                    <Panel>
                        <Title level="H5">
                            <strong>{t("item")}: </strong>
                            {content.code} - {content.name}
                        </Title>
                        <Text><strong>{t("quantity")}: </strong>{content.quantity}</Text>
                        <ProgressIndicator value={content.progress ?? 0}/>
                    </Panel>
                    <ScrollableContentBox>
                        <Table
                            columns={<>
                                <TableColumn><Label>{t('bin')}</Label></TableColumn>
                                <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                            </>}
                        >
                            {content?.bins?.map((bin) => (
                                <TableRow key={bin.entry}>
                                    <TableCell><Label>{bin.code}</Label></TableCell>
                                    <TableCell><Label>{bin.quantity}</Label></TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </ScrollableContentBox>
                    {user?.binLocations && (content.progress??0) < 100 && <BinLocationScanner ref={binRef} onScan={onScan}/>}
                </ScrollableContent>
            }
        </ContentTheme>
    );
}
