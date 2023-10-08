import React, {useEffect, useState} from "react";
import {TextValue} from "../assets/TextValue";
import SummarizeIcon from '@mui/icons-material/Summarize';
import ContentTheme from "../Components/ContentTheme";
import ReportFilterForm from "./GoodsReceiptSupervisor/ReportFilterForm";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import {BusinessPartner, DocumentStatusOption} from "../assets/Data";
import {Document, fetchDocuments} from "./GoodsReceiptSupervisor/Document";

export default function GoodsReceiptReport() {
    const [loading, setLoading] = useState(false);
    const [idInput, setIDInput] = useState<string | ''>('');
    const [cardCodeInput, setCardCodeInput] = useState<BusinessPartner | null>(null);
    const [docNameInput, setDocNameInput] = useState<string | ''>('');
    const [grpoInput, setGRPOInput] = useState<string | ''>('');
    const [statusInput, setStatusInput] = useState<DocumentStatusOption | null>(null);
    const [dateInput, setDateInput] = useState<Date | null>(null);
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});
    const [documents, setDocuments] = useState<Document[]>([]);

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let id = idInput.length > 0 ? parseInt(idInput) : undefined;
        let statuses = statusInput != null ? [statusInput.status] : [];
        let grpo = grpoInput.length > 0 ? parseInt(grpoInput) : undefined;
        fetchDocuments(id, statuses, cardCodeInput, dateInput, docNameInput, grpo)
            .then(data => {
                setDocuments(data);
            })
            .catch(error => {
                console.error(`Error fetching documents: ${error}`);
                errorAlert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
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
            {documents.map(doc => <span>{doc.id}</span>)}
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )
}
