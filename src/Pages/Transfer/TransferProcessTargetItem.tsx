import ContentTheme from "../../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useAuth} from "../../Components/AppContext";
import {BinLocation} from "../../Assets/Common";
import {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {fetchTransferContent, TransferBinContent} from "./Data/Transfer";
import {ProcessAlertValue} from "../../Components/ProcessAlert";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {ScrollableContent} from "../../Components/ScrollableContent";
import {Button, Label, ProgressIndicator, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";

export default function TransferProcessTargetItem() {
    const {scanCode, itemCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
    const [enable, setEnable] = useState(false);
    const {setLoading, setAlert} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<TransferBinContent[] | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const navigate = useNavigate();

    const title = `${t("transfer")} #${scanCode} - ${StringFormat(t("selectTransferItemTarget"), itemCode)}`;

    useEffect(() => {
        setEnable(!user?.binLocations ?? false);
        if (enable) {
            setTimeout(() => barcodeRef.current?.focus(), 1);
        }
        if (scanCode == null || !IsNumeric(scanCode) || itemCode == null) {
            setID(null);
            return;
        }
        setLoading(true);
        let value = parseInt(scanCode);
        setID(value);
    }, []);

    function navigateBack() {
        navigate(`/transfer/${id}/transfer`);
    }

    return (
        <ContentTheme title={title} icon="functional-location" back={() => navigateBack()}>
            {rows &&
                <ScrollableContent>
                    <Table
                        columns={<>
                            <TableColumn><Label>{t('code')}</Label></TableColumn>
                            <TableColumn><Label>{t('description')}</Label></TableColumn>
                            <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                            <TableColumn><Label>{t('progress')}</Label></TableColumn>
                        </>}
                    >
                        {rows.map((row) => (
                            <TableRow key={row.code}>
                                <TableCell><Label>{row.code}</Label></TableCell>
                                <TableCell><Label>{row.name}</Label></TableCell>
                                <TableCell><Label>{row.quantity}</Label></TableCell>
                                <TableCell> <ProgressIndicator value={row.progress}/> </TableCell>
                            </TableRow>
                        ))}
                    </Table>
                </ScrollableContent>
            }
        </ContentTheme>
    );
}
