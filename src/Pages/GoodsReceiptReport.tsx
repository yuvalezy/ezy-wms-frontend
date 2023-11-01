import React, {useState} from "react";
import SummarizeIcon from '@mui/icons-material/Summarize';
import ContentTheme from "../Components/ContentTheme";
import ReportFilterForm from "./GoodsReceiptSupervisor/ReportFilterForm";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import {BusinessPartner, DocumentStatusOption} from "../assets/Data";
import {Document, fetchDocuments} from "./GoodsReceiptSupervisor/Document";
import DocumentReportCard from "./GoodsReceiptSupervisor/DocumentReportCard";
import {useLoading} from "../Components/LoadingContext";
import {useTranslation} from "react-i18next";

export default function GoodsReceiptReport() {
    const {setLoading} = useLoading();
    const {t} = useTranslation();
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

    const onSubmit = () => {
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
        <ContentTheme title={t('GoodsReceiptReport')} icon={<SummarizeIcon/>}>
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
                onSubmit={onSubmit}
                onClear={() => setDocuments([])}
            />
            <div style={{margin: '5px'}}>
                {documents.map(doc => <DocumentReportCard key={doc.id} doc={doc}/>)}
            </div>
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )
}
