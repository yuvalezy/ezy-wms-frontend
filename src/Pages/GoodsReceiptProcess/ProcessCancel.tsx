import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextareaAutosize,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { ProcessAlertValue } from "./ProcessAlert";
import { useLoading } from "../../Components/LoadingContext";
import {
  fetchReasons,
  ReasonValue,
  UpdateLineReturnValue,
} from "../GoodsReceiptSupervisor/Document";
import { updateLine } from "./Process";
import { useTranslation } from "react-i18next";
import { ComboBox, ComboBoxItem } from "@ui5/webcomponents-react";

export interface ProcessCancelProps {
  id: number;
  alert: ProcessAlertValue;
  onAccept: (alert: ProcessAlertValue) => void;
  onClose: () => void;
}

const ProcessCancel: React.FC<ProcessCancelProps> = ({
  id,
  alert,
  onAccept,
  onClose,
}) => {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(alert.comment || "");
  const [userName, setUserName] = useState("");
  const [reason, setReason] = useState<ReasonValue | null>(null);
  const [reasons, setReasons] = useState<ReasonValue[]>([]);
  const usernameRef = useRef<HTMLInputElement>();

  useEffect(() => {
    setLoading(true);
    fetchReasons()
      .then((reasons) => {
        setReasons(reasons);
        setOpen(true);
      })
      .catch((error) => {
        console.error(`Error loading reasons: ${error}`);
        let errorMessage = error.response?.data["exceptionMessage"];
        if (errorMessage) window.alert(errorMessage);
        else window.alert(`Error loading reasons: ${error}`);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleClose() {
    setOpen(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    updateLine({
      id: id,
      lineID: alert.lineID ?? -1,
      comment: comment,
      userName: userName,
      reason: reason?.value ?? -1,
    })
      .then((value) => {
        let message: string | null = null;
        switch (value) {
          case UpdateLineReturnValue.Status:
            message = t("updateLineStatusError");
            break;
          case UpdateLineReturnValue.LineStatus:
            message = t("updateLineLineStatusError");
            break;
          case UpdateLineReturnValue.CloseReason:
            message = t("updateLineReason");
            break;
          case UpdateLineReturnValue.SupervisorPassword:
            message = t("updateLineWrongSupervisorPassword");
            break;
          case UpdateLineReturnValue.NotSupervisor:
            message = t("updateLineNotSupervisorError");
            break;
        }
        if (message !== null) {
          window.alert(message);
          setUserName("");
          setLoading(false);
          setTimeout(() => usernameRef.current?.focus(), 100);
          return;
        }

        onAccept({
          ...alert,
          comment: comment,
          canceled: true,
        });
        handleClose();
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Error performing update: ${error}`);
        let errorMessage = error.response?.data["exceptionMessage"];
        if (errorMessage) window.alert(errorMessage);
        else window.alert(`Update Line Error: ${error}`);
        setLoading(false);
      });
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t("cancel")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{t("barcode")}: </strong>
            {alert.barcode}
          </DialogContentText>
          <Box mb={1} style={{ textAlign: "center" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              inputRef={usernameRef}
              label={t("supervisorCode")}
              type="password"
              id="username"
              autoComplete="current-password"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Box>
          <Box mb={1} style={{ textAlign: "center" }}>
            {/*<ComboBox onSelectionChange={(e) => console.log(e)}>*/}
            {/*  {reasons.map((reason) => (*/}
            {/*    <ComboBoxItem key={reason.value} text={reason.description} />*/}
            {/*  ))}*/}
            {/*</ComboBox>*/}
            <ComboBox
                onSelectionChange={(e) =>
                    setReason(
                        reasons[Array.from(e.target.children).indexOf(e.detail.item)]
                    )
                }
            >
              {reasons.map((reason) => (
                  <ComboBoxItem key={reason.value} text={reason.description} />
              ))}
            </ComboBox>
            {/*<Autocomplete*/}
            {/*    value={reason}*/}
            {/*    options={reasons}*/}
            {/*    getOptionLabel={(option) => option.description}*/}
            {/*    onChange={(_, newValue) => setReason(newValue)}*/}
            {/*    renderInput={(params) =>*/}
            {/*        <TextField InputProps={params.InputProps}*/}
            {/*            // InputLabelProps={params.InputLabelProps}*/}
            {/*                   id={params.id} fullWidth={params.fullWidth} size={params.size} disabled={params.disabled}*/}
            {/*                   label={TextValue.Reason} variant="outlined"/>*/}
            {/*    }*/}
            {/*/>*/}
          </Box>
          <Box mb={1} style={{ textAlign: "center" }}>
            {t("comment")}
            <TextareaAutosize
              style={{ minHeight: "50px", width: "100%" }}
              minRows={3}
              maxRows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {t("cancel")}
          </Button>
          <Button type="submit" color="primary">
            {t("accept")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default ProcessCancel;
