import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import {TextValue} from "../../assets/TextValue";
import React, {useState} from "react";

export interface ProcessAlertValue {
    lineID?: number,
    barcode?: string | null;
    itemCode?: string | null;
    timeStamp?: string;
    message?: string;
    severity: AlertColor;
    comment?: string;
}

export interface ProcessAlertProps {
    alert: ProcessAlertValue;
    onEditComment: (comment: string) => void;
}

const ProcessAlert: React.FC<ProcessAlertProps> = ({alert, onEditComment}) => {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState(alert.comment || "");

    const handleClickOpen = () => {
        setOpen(true);
        setComment(alert.comment || "");
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSaveComment = () => {
        onEditComment(comment);
        handleClose();
    };

    return (
        <Box mt={1}>
            <Alert variant="filled" style={{position: 'relative'}} severity={alert.severity}>
                {alert.barcode && <AlertTitle><strong>{TextValue.Barcode}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{TextValue.Time}: </strong>{alert.timeStamp} <br/>
                {alert.itemCode && <><span><strong>{TextValue.Item}: </strong>{alert.itemCode}</span><br/></>}
                <strong>{TextValue.Message}: </strong>{alert.message}
                <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                    <InsertCommentIcon onClick={handleClickOpen}/>
                </div>
            </Alert>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{TextValue.Comment}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{TextValue.Barcode}: </strong>{alert.barcode}
                    </DialogContentText>
                    <TextareaAutosize style={{minHeight: '100px', width: '100%'}}
                                      minRows={3}
                                      maxRows={5}
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveComment} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProcessAlert;
