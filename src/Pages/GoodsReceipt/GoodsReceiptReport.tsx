import React, { useEffect, useRef, useState } from "react";
import ContentTheme from "../../components/ContentTheme";
import ReportFilterForm from "./components/ReportFilterForm";
import { fetchDocuments, GoodsReceiptReportFilter } from "./Data/Document";
import DocumentReportCard from "./components/DocumentReportCard";
import { useThemeContext } from "../../components/ThemeContext";
import { useTranslation } from "react-i18next";
import { Document } from "../../Assets/Document";
import DocumentListDialog, { DocumentListDialogRef } from "./components/DocumentListDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

export default function GoodsReceiptReport() {
    const { loading, setLoading, setError } = useThemeContext();
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [lastID, setLastID] = useState(-1);
    const [filters, setFilters] = useState<GoodsReceiptReportFilter | null>(null);
    const [stop, setStop] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const documentListDialogRef = useRef<DocumentListDialogRef>(null);

    const filtersRef = useRef<GoodsReceiptReportFilter | null>(filters);
    const lastIDRef = useRef<number>(lastID);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    useEffect(() => {
        lastIDRef.current = lastID;
    }, [lastID]);

    const onSubmit = (filters: GoodsReceiptReportFilter) => {
        setFilters(filters);
        loadData(filters);
    }

    function handleDocDetails(doc: Document) {
        setSelectedDocument(doc);
        documentListDialogRef?.current?.show();
    }

    const loadData = (filters: GoodsReceiptReportFilter | null) => {
        if (stop || !filters) {
            return;
        }
        setLoading(true);
        fetchDocuments(filters)
            .then((data) => {
                if ((data?.length ?? 0) === 0) {
                    setStop(true);
                    return;
                }
                setDocuments(prevDocs => [...prevDocs, ...data]);
                setLastID(data[data.length - 1].id)
            })
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, lastID]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop <= document.documentElement.offsetHeight - 50 || loading || !filtersRef.current || stop) {
            return;
        }
        setLoading(true);
        const newFilters = { ...filtersRef.current, lastID: lastIDRef.current };
        setFilters(newFilters);
        loadData(newFilters);
    };

    return (
        <ContentTheme title={t("goodsReceiptReport")}>
            <ReportFilterForm
                onSubmit={onSubmit}
                onClear={() => setDocuments([])}
            />
            <div style={{ margin: "5px" }}>
                {documents.map((doc) => (
                    <DocumentReportCard key={doc.id} doc={doc} docDetails={handleDocDetails} />
                ))}
            </div>
            <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument} />
        </ContentTheme>
    );
}
