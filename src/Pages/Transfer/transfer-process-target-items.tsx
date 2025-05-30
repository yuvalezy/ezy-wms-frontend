import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {IsNumeric} from "@/assets";
import {useAuth} from "@/components";
import {BarCodeScannerRef} from "@/components";
import {fetchTransferContent, TransferContent} from "@/pages/transfer/data/transfer-document";
import {ScrollableContent} from "@/components";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {SourceTarget} from "@/assets";
import { ArrowRightCircle } from "lucide-react"; // Icon for select/begin

export default function TransferProcessTargetItems() { // Renamed component
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(false);
    const {setLoading, setError} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<TransferContent[] | null>(null);
    const navigate = useNavigate();

    const title = `${t("transfer")} #${scanCode} - ${t("selectTransferTargetItems")}`;

    useEffect(() => {
      setEnable(!user?.binLocations);
        if (enable) {
            setTimeout(() => barcodeRef.current?.focus(), 1);
        }
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setLoading(true);
        let value = parseInt(scanCode);
        setID(value);
        loadRows(value);
    }, []);

    function loadRows(value: number) {
        fetchTransferContent({id: value ?? id, type: SourceTarget.Target})
            .then((results) => setRows(results))
            .catch((e) => {
                setError(e);
                setRows([]);
            })
            .finally(() => setLoading(false));
    }

    function navigateBack() {
        navigate(`/transfer/${id}`);
    }

    function handleOpen(code: string) {
        navigate(`/transfer/${id}/targetItems/${code}`);
    }

    return (
        <ContentTheme title={title} onBack={() => navigateBack()}>
            {rows &&
                <ScrollableContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]"></TableHead> {/* For Select Button */}
                                    <TableHead><Label>{t('code')}</Label></TableHead>
                                    <TableHead><Label>{t('description')}</Label></TableHead>
                                    <TableHead className="text-right"><Label>{t('openQuantity')}</Label></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <React.Fragment key={row.code}>
                                        <TableRow>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => handleOpen(row.code)}>
                                                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                                                    {t("select")}
                                                </Button>
                                            </TableCell>
                                            <TableCell><Label>{row.code}</Label></TableCell>
                                            <TableCell><Label>{row.name}</Label></TableCell>
                                            <TableCell className="text-right"><Label>{row.openQuantity}</Label></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={4} className="p-1">
                                                <Progress value={row.progress ?? 0} className="w-full h-2" />
                                                <p className="text-xs text-muted-foreground text-center">{`${row.progress ?? 0}%`}</p>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollableContent>
            }
        </ContentTheme>
    );
}
