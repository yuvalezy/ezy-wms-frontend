import React from "react";
import {Dialog,} from "@mui/material";
import QRCode from "qrcode.react";

type DocumentQRCodeDialogProps = {
    open: boolean,
    onClose: () => void,
    selectedDocumentId?: number | null,
};

const DocumentQRCodeDialog: React.FC<DocumentQRCodeDialogProps> = ({open, onClose, selectedDocumentId}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <QRCode
                value={`$GRPO_${selectedDocumentId}`}
                width={200}
                height={200}
                color="black"
                bgColor="white"
            />
        </Dialog>
    );
};

export default DocumentQRCodeDialog;
