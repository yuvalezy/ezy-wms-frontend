import React, {useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import ReportFilterForm from "./Components/ReportFilterForm";
import {fetchDocuments, GoodsReceiptReportFilter} from "./Data/Document";
import DocumentReportCard from "./Components/DocumentReportCard";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Document} from "../../Assets/Document";

export default function GoodsReceiptReport() {
    const {setLoading, setError} = useThemeContext();
    const {t} = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);

    const onSubmit = (filters: GoodsReceiptReportFilter) => {
        setLoading(true);
        fetchDocuments(filters)
            .then((data) => setDocuments(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t("goodsReceiptReport")} icon="manager-insight">
            <ReportFilterForm
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
