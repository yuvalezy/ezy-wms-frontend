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
import {useLoading} from "../Components/LoadingContext";
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';

export default function GoodsReceiptReportAll() {
    const [id, setID] = useState<number | null>();
    const {scanCode} = useParams();
    const {setLoading} = useLoading();
    const [data, setData] = useState<GoodsReceiptAll[] | null>(null);
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

        setLoading(true);
        fetchGoodsReceiptReportAll(parseInt(scanCode))
            .then(result => setData(result))
            .catch(error => errorAlert(`Loading Error: ${error}`))
            .finally(() => setLoading(false));
    }, []);

    const exportToExcel = () => {
        if (data == null) {
            return;
        }

        const wb = XLSX.utils.book_new();
        const headers = [TextValue.Code, TextValue.Description, TextValue.Quantity, TextValue.Delivery, TextValue.Showroom, TextValue.Stock];
        const dataRows = data.map(item => [item.itemCode, item.itemName, item.quantity, item.delivery, item.showroom, item.stock]);

        const wsData = [headers, ...dataRows];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'GoodsReceiptData');

        // Generate a Blob containing the Excel file
        const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
        const excelData = new Blob([excelBuffer], {type: '.xlsx'});
        saveAs(excelData, `goods_receipt_data_${id}.xlsx`);
    };
    return (
        <ContentTheme title={title} icon={<SupervisedUserCircleIcon/>}>
            <div style={{position: 'relative'}}>
                <Typography variant="h4">{TextValue.GoodsReceipt} #{id}</Typography>
                <img src="/images/excel.jpg" alt="" onClick={() => exportToExcel()} style={{height: '32px', position: 'absolute', right: '10px', top: '10px', cursor: 'pointer', zIndex: '1000'}}/>
            </div>
            {data && <GoodsReceiptAllReportTable data={data}></GoodsReceiptAllReportTable>}
            {data && data.length === 0 && <Alert severity="warning">{TextValue.NoExitData}</Alert>}
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )

}
