import React, {useState} from "react";
import ContentTheme from "../Components/ContentTheme";
import ReportFilterForm from "./GoodsReceiptSupervisor/ReportFilterForm";
import {BusinessPartner} from "../Assets/Data";
import { fetchDocuments} from "./GoodsReceiptSupervisor/Document";
import DocumentReportCard from "./GoodsReceiptSupervisor/DocumentReportCard";
import {useThemeContext} from "../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {MessageStripDesign} from "@ui5/webcomponents-react";
import {Document, DocumentStatusOption} from "../Assets/Document";

export default function GoodsReceiptReport() {
    const {setLoading, setAlert} = useThemeContext();
    const {t} = useTranslation();
    const [idInput, setIDInput] = useState<string | "">("");
    const [cardCodeInput, setCardCodeInput] = useState<BusinessPartner | null>(null);
    const [docNameInput, setDocNameInput] = useState<string | "">("");
    const [grpoInput, setGRPOInput] = useState<string | "">("");
    const [statusInput, setStatusInput] = useState<DocumentStatusOption | null>(null);
    const [dateInput, setDateInput] = useState<Date | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);

    const errorAlert = (message: string) => {
        setAlert({message: message, type: MessageStripDesign.Negative})
    };

    const onSubmit = () => {
        setLoading(true);
        let id = idInput.length > 0 ? parseInt(idInput) : undefined;
        let statuses = statusInput != null ? [statusInput.status] : [];
        let grpo = grpoInput.length > 0 ? parseInt(grpoInput) : undefined;
        fetchDocuments(
            id,
            statuses,
            cardCodeInput,
            dateInput,
            docNameInput,
            grpo
        )
            .then((data) => {
                setDocuments(data);
            })
            .catch((error) => {
                console.error(`Error fetching documents: ${error}`);
                errorAlert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t("goodsReceiptReport")} icon="manager-insight">
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
            <div style={{margin: "5px"}}>
                {documents.map((doc) => (
                    <DocumentReportCard key={doc.id} doc={doc}/>
                ))}
            </div>
        </ContentTheme>
    );
}
