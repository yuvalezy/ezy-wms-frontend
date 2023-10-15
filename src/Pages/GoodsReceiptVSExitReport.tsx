import React, {useEffect, useState} from "react";
import ContentTheme from "../Components/ContentTheme";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import {TextValue} from "../assets/TextValue";
import {Alert, Typography} from "@mui/material";
import {IsNumeric, ObjectName} from "../assets/Functions";
import {useParams} from "react-router-dom";
import {fetchGoodsReceiptVSExitReport, GoodsReceiptVSExitReportData} from "./GoodsReceiptSupervisor/Report";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GoodsReceiptVSExitReportTable from "./GoodsReceiptSupervisor/GoodsReceiptVSExitReportTable";
import {useLoading} from "../Components/LoadingContext";

export default function GoodsReceiptVSExitReport() {
    const [id, setID] = useState<number | null>();
    const {scanCode} = useParams();
    const {loading, setLoading} = useLoading();
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
        <ContentTheme title={title} icon={<SupervisedUserCircleIcon/>}>
            <Typography variant="h4">{TextValue.GoodsReceipt} #{id}</Typography>
            <div>
                {data?.map(value => (
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h5"><strong>{ObjectName(value.objectType)}: </strong> {value.number}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <strong>{TextValue.Customer}: </strong>
                                {value.cardName}
                            </Typography>
                            <Typography>
                                <strong>{TextValue.Address}: </strong>
                                {value.address}
                            </Typography>
                            <GoodsReceiptVSExitReportTable data={value.lines}/>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
            {
                (!loading && (data == null || data.length === 0)) &&
                <Alert severity="warning">{TextValue.NoExitData}</Alert>
            }
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )

}
