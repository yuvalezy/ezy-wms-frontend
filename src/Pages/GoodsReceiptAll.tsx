import React, {useEffect, useState} from "react";
import ContentTheme from "../Components/ContentTheme";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import {TextValue} from "../assets/TextValue";
import {Alert, Typography} from "@mui/material";
import {IsNumeric} from "../assets/Functions";
import {useParams} from "react-router-dom";
import {fetchGoodsReceiptReportAll, GoodsReceiptAll} from "./GoodsReceiptSupervisor/Report";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import GoodsReceiptAllReportTable from "./GoodsReceiptSupervisor/GoodsReceiptAllTable";

export default function GoodsReceiptReportAll() {
    const [id, setID] = useState<number | null>();
    const {scanCode} = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GoodsReceiptAll[]>([]);
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

        fetchGoodsReceiptReportAll(parseInt(scanCode))
            .then(result => setData(result))
            .catch(error => errorAlert(`Loading Error: ${error}`))
            .finally(() => setLoading(false));
    }, []);
    return (
        <ContentTheme loading={loading} title={title} icon={<SupervisedUserCircleIcon/>}>
            <Typography variant="h4">{TextValue.GoodsReceipt} #{id}</Typography>
            <GoodsReceiptAllReportTable data={data}></GoodsReceiptAllReportTable>
            {
                (!loading && (data == null || data.length === 0)) &&
                <Alert severity="warning">{TextValue.NoExitData}</Alert>
            }
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )

}
