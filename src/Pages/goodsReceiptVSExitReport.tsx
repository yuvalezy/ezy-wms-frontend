import React, {useEffect, useState} from "react";
import ContentTheme from "../Components/ContentTheme";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import {TextValue} from "../assets/TextValue";
import {Typography} from "@mui/material";
import {IsNumeric} from "../assets/Functions";
import {useParams} from "react-router-dom";
import {fetchGoodsReceiptVSExitReport, GoodsReceiptVSExitReportData} from "./GoodsReceiptSupervisor/Report";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";

export default function GoodsReceiptVSExitReport() {
    const [id, setID] = useState<number | null>();
    const {scanCode} = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GoodsReceiptVSExitReportData[]>([]);
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});
    const title = `${TextValue.GoodsReceiptVSExit} #${scanCode}`;

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));

        fetchGoodsReceiptVSExitReport(parseInt(scanCode))
            .then(result => setData(result))
            .catch(error => errorAlert(`Loading Error: ${error}`))
            .finally(() => setLoading(false));
    }, []);
    return (
        <ContentTheme loading={loading} title={title} icon={<SupervisedUserCircleIcon/>}>
            <Typography variant="h6">{TextValue.GoodsReceipt} #{id}</Typography>
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )

}
