import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {IsNumeric} from "../../Assets/Functions";
import {useAuth} from "../../components/AppContext";
import {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {fetchTransferContent, TransferContent} from "./Data/TransferDocument";
import {ScrollableContent} from "../../components/ScrollableContent";
import {
    Button,
    Label,
    ProgressIndicator,
    Table,
    TableCell,
    TableColumn,
    TableGroupRow,
    TableRow
} from "@ui5/webcomponents-react";
import {SourceTarget} from "../../Assets/Common";

class TransferProcessTargetItemsValue extends React.Component {
    render() {
        return null;
    }
}

export default function TransferProcessTarget() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(false);
    const {setLoading, setError} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<TransferContent[] | null>(null);
    const navigate = useNavigate();

    const title = `${t("transfer")} #${scanCode} - ${t("selectTransferTargetItems")}`;

    useEffect(() => {
      setEnable(!user?.binLocations);
        if (enable) {
            setTimeout(() => barcodeRef.current?.focus(), 1);
        }
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setLoading(true);
        let value = parseInt(scanCode);
        setID(value);
        loadRows(value);
    }, []);

    function loadRows(value: number) {
        fetchTransferContent({id: value ?? id, type: SourceTarget.Target})
            .then((results) => setRows(results))
            .catch((e) => {
                setError(e);
                setRows([]);
            })
            .finally(() => setLoading(false));
    }

    function navigateBack() {
        navigate(`/transfer/${id}`);
    }

    function handleOpen(code: string) {
        navigate(`/transfer/${id}/targetItems/${code}`);
    }

    return (
        <ContentThemeSapUI5 title={title} icon="functional-location" back={() => navigateBack()}>
            {rows &&
                <ScrollableContent>
                    {/*{rows.map((row) => (<TransferProcessTargetItemsValue/>))}*/}
                    <Table
                        columns={<>
                            <TableColumn></TableColumn>
                            <TableColumn><Label>{t('code')}</Label></TableColumn>
                            <TableColumn><Label>{t('description')}</Label></TableColumn>
                            <TableColumn><Label>{t('openQuantity')}</Label></TableColumn>
                        </>}
                    >
                        {rows.map((row) => (
                            <>
                                <TableRow key={row.code}>
                                    <TableCell>
                                        <Button icon="begin" onClick={() => handleOpen(row.code)}>
                                            {t("select")}
                                        </Button>
                                    </TableCell>
                                    <TableCell><Label>{row.code}</Label></TableCell>
                                    <TableCell><Label>{row.name}</Label></TableCell>
                                    <TableCell><Label>{row.openQuantity}</Label></TableCell>
                                </TableRow>
                                <TableGroupRow>
                                    <ProgressIndicator value={row.progress}/>
                                </TableGroupRow>
                            </>
                        ))}
                    </Table>
                </ScrollableContent>
            }
        </ContentThemeSapUI5>
    );
}
