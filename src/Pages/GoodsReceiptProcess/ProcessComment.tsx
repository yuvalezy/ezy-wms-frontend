import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import TextField from "@mui/material/TextField";
import {ProcessAlertValue} from "./ProcessAlert";

export interface ProcessCommentProps {
    alert: ProcessAlertValue;
    onAccept: (comment: string) => void;
}

const ProcessComment: React.FC<ProcessCommentProps> = ({alert, onAccept}) => {
    const [open, setOpen] = useState(true);
    const [comment, setComment] = useState(alert.comment || '');

    const handleClose = () => setOpen(false);

    const handleSave = () => {
        onAccept(comment);
        handleClose();
    };
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{TextValue.Comment}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <strong>{TextValue.Barcode}: </strong>{alert.barcode}
                </DialogContentText>
                <div>
                    <TextareaAutosize style={{minHeight: '100px', width: '100%'}}
                                      minRows={3}
                                      maxRows={5}
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default ProcessComment;