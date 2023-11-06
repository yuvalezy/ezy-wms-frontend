import React, { useContext, useEffect, useState } from "react";
import ContentTheme from "../Components/ContentTheme";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import { Alert, Typography } from "@mui/material";
import { IsNumeric } from "../assets/Functions";
import { useParams } from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "./GoodsReceiptSupervisor/Report";
import SnackbarAlert, { SnackbarState } from "../Components/SnackbarAlert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GoodsReceiptVSExitReportTable from "./GoodsReceiptSupervisor/GoodsReceiptVSExitReportTable";
import { useLoading } from "../Components/LoadingContext";
import { useTranslation } from "react-i18next";
import { useObjectName } from "../assets/ObjectName";
import { AuthContext } from "../Components/AppContext";

export default function GoodsReceiptVSExitReport() {
  const { config } = useContext(AuthContext);
  
  const [id, setID] = useState<number | null>();
  const { scanCode } = useParams();
  const { t } = useTranslation();
  const o = useObjectName();
  const { setLoading } = useLoading();
  const [data, setData] = useState<GoodsReceiptVSExitReportData[] | null>(null);
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
  });
  const title = `${t("goodsReceiptVSExit")} #${scanCode}`;

  const errorAlert = (message: string) => {
    setSnackbar({ open: true, message: message, color: "red" });
    setTimeout(() => setSnackbar({ open: false }), 5000);
  };

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));

    setLoading(true);
    fetchGoodsReceiptVSExitReport(parseInt(scanCode))
      .then((result) => setData(result))
      .catch((error) => errorAlert(`Loading Error: ${error}`))
      .finally(() => setLoading(false));
  }, []);
  return (
    <ContentTheme title={title} icon={<SupervisedUserCircleIcon />}>
      <Typography variant="h4">
        {t("goodsReceipt")} #{id}
      </Typography>
      <div>
        {data?.map((value) => (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5">
                <strong>{o(value.objectType)}: </strong> {value.number}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>{t("customer")}: </strong>
                {value.cardName}
              </Typography>
              <Typography>
                <strong>{t("address")}: </strong>
                {value.address}
              </Typography>
              <GoodsReceiptVSExitReportTable data={value.lines} />
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      {data && data.length === 0 && (
        <Alert severity="warning">{t("noExitData")}</Alert>
      )}
      <SnackbarAlert
        state={snackbar}
        onClose={() => setSnackbar({ open: false })}
      />
    </ContentTheme>
  );
}
