import React, {useEffect, useState} from "react";
import {TextValue} from "../assets/TextValue";
import SummarizeIcon from '@mui/icons-material/Summarize';
import ContentTheme from "../Components/ContentTheme";
import ReportFilterForm from "./GoodsReceiptSupervisor/ReportFilterForm";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import {BusinessPartner, DocumentStatusOption} from "../assets/Data";

export default function GoodsReceiptReport() {
    const [loading, setLoading] = useState(false);
    const [idInput, setIDInput] = useState<string | ''>('');
    const [cardCodeInput, setCardCodeInput] = useState<BusinessPartner | null>(null);
    const [docNameInput, setDocNameInput] = useState<string | ''>('');
    const [grpoInput, setGRPOInput] = useState<string | ''>('');
    const [statusInput, setStatusInput] = useState<DocumentStatusOption | null>(null);
    const [dateInput, setDateInput] = useState<Date | null>(null);
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    useEffect(() => {
        // setLoading(true);
        // fetchDocuments()
        //     .then(data => {
        //         setDocuments(data);
        //     })
        //     .catch(error => {
        //         console.error(`Error fetching documents: ${error}`);
        //         errorAlert(`Error fetching documents: ${error}`);
        //     })
        //     .finally(() => setLoading(false));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        // e.preventDefault();
        // if (docNameInput === null || docNameInput === '') {
        //     alert(TextValue.IDRequired);
        //     return;
        // }
        // setLoading(true);
        // createDocument(cardCodeInput, docNameInput, user!)
        //     .then(newDocument => {
        //         setDocuments(prevDocs => [newDocument, ...prevDocs]);
        //         setDocNameInput('');  // Reset the input
        //     })
        //     .catch(error => {
        //         console.error(`Error creating document: ${error}`);
        //         errorAlert(`Error creating document: ${error.message}`);
        //     })
        //     .finally(() => setLoading(false));
    };

    return (
        <ContentTheme loading={loading} title={TextValue.GoodsReceiptSupervisor} icon={<SummarizeIcon/>}>
            <ReportFilterForm
                idInput={idInput}
                setIDInput={setIDInput}
                cardCodeInput={cardCodeInput}
                setCardCodeInput={setCardCodeInput}
                docNameInput={docNameInput}
                setDocNameInput={setDocNameInput}
                grpoInput={grpoInput}
                setGRPOInput={setGRPOInput}
                statusInput={statusInput}
                setStatusInput={setStatusInput}
                dateInput={dateInput}
                setDateInput={setDateInput}
                handleSubmit={handleSubmit}/>
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )
}
