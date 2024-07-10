import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import ReportFilterForm from "./Components/ReportFilterForm";
import {fetchDocuments, GoodsReceiptReportFilter} from "./Data/Document";
import DocumentReportCard from "./Components/DocumentReportCard";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Document} from "../../Assets/Document";
import DocumentListDialog, {DocumentListDialogRef} from "./Components/DocumentListDialog";

export default function GoodsReceiptReport() {
    const {loading, setLoading, setError} = useThemeContext();
    const {t} = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [lastID, setLastID] = useState(-1);
    const [filters, setFilters] = useState<GoodsReceiptReportFilter | null>(null);
    const [stop, setStop] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const documentListDialogRef = useRef<DocumentListDialogRef>(null);

    const onSubmit = (filters: GoodsReceiptReportFilter) => {
        setFilters(filters);
    }

    useEffect(() => {
        loadData();
    }, [filters]);

    function handleDocDetails(doc: Document) {
        setSelectedDocument(doc);
        documentListDialogRef?.current?.show();
    }

    const loadData = () => {
        if (filters == null || stop) {
            return;
        }
        setLoading(true);
        fetchDocuments(filters)
            .then((data) => {
                if ((data?.length??0) === 0) {
                    setStop(true);
                    return;
                }
                setDocuments(prevDocs => [...prevDocs, ...data]);
                setLastID(data[data.length-1].id)
            })
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, lastID]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop <= document.documentElement.offsetHeight - 50 || loading || filters == null || stop) {
            return;
        }
        setLoading(true);
        setFilters(prevFilters => ({
            ...prevFilters,
            lastID: lastID
        }));
    };

    return (
        <ContentTheme title={t("goodsReceiptReport")} icon="manager-insight">
            <ReportFilterForm
                onSubmit={onSubmit}
                onClear={() => setDocuments([])}
            />
            <div style={{margin: "5px"}}>
                {documents.map((doc) => (
                    <DocumentReportCard key={doc.id} doc={doc} docDetails={handleDocDetails}/>
                ))}
            </div>
            <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
        </ContentTheme>
    );
}
