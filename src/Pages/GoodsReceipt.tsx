import React, {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import ContentTheme from "../Components/ContentTheme";
import { IsNumeric, StringFormat } from "../assets/Functions";
import SnackbarAlert, { SnackbarState } from "../Components/SnackbarAlert";
import {
  DocumentStatus,
  fetchDocuments,
} from "./GoodsReceiptSupervisor/Document";
import { useTranslation } from "react-i18next";
import { useDocumentStatusToString } from "./GoodsReceiptSupervisor/DocumentStatusString";
import {Button, Form, FormItem, Icon, Input, InputDomRef} from "@ui5/webcomponents-react";

export default function GoodsReceipt() {
  const [, setLoading] = useState(false);
  const [scanCodeInput, setScanCodeInput] = React.useState("");
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
  });
  const { t } = useTranslation();
  const documentStatusToString = useDocumentStatusToString();
  const scanCodeInputRef = useRef<InputDomRef>(null);

  useEffect(() => {
    setTimeout(() =>scanCodeInputRef?.current?.focus(), 1);
  }, []);

  const navigate = useNavigate();
  const alert = (message: string) => {
    setSnackbar({ open: true, message: message, color: "DarkRed" });
    setTimeout(() => setSnackbar({ open: false }), 5000);
  };

  const errorAlert = (message: string) => {
    setSnackbar({ open: true, message: message, color: "red" });
    setTimeout(() => setSnackbar({ open: false }), 5000);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (scanCodeInput.length === 0) {
      alert(t("scanCodeRequired"));
      return;
    }
    let checkScan = scanCodeInput.split("_");
    if (
      checkScan.length !== 2 ||
      (checkScan[0] !== "GRPO" && checkScan[0] !== "$GRPO") ||
      !IsNumeric(checkScan[1])
    ) {
      alert(t("invalidScanCode"));
      return;
    }
    const id = parseInt(checkScan[1]);
    setLoading(true);
    fetchDocuments(id, [])
      .then((doc) => {
        if (doc.length === 0) {
          alert(StringFormat(t("goodsReceiptNotFound"), id));
          return;
        }
        const status = doc[0].status;

        if (
          status !== DocumentStatus.Open &&
          status !== DocumentStatus.InProgress
        ) {
          alert(
            StringFormat(
              t("goodsReceiptStatusError"),
              id,
              documentStatusToString(status)
            )
          );
          return;
        }
        navigate(`/goodsReceipt/${id}`);
      })
      .catch((error) => errorAlert(`Validate Goods Receipt Error: ${error}`))
      .finally(() => setLoading(false));
  }

  return (
    <ContentTheme title={t("goodsReceipt")} icon="cause">
      {ScanForm()}
      <SnackbarAlert
        state={snackbar}
        onClose={() => setSnackbar({ open: false })}
      />
    </ContentTheme>
  );

  function ScanForm() {
    return (
        <Form onSubmit={handleSubmit}>
          <FormItem label={t("code")}>
              <Input
                  value={scanCodeInput}
                  type="Password"
                  ref={scanCodeInputRef}
                  required
                  onInput={(e) => setScanCodeInput(e.target.value as string)}
              />
          </FormItem>
          <FormItem>
            <Button type="Submit" color="primary">
              <Icon name="accept" />
              {t("accept")}
            </Button>
          </FormItem>
        </Form>
    )
  }
}