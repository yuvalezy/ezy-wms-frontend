import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import {ProcessAlertValue} from "./ProcessAlert";
import {useLoading} from "../../Components/LoadingContext";
import {updateLine} from "./Process";

export interface ProcessCommentProps {
    id: number;
    alert: ProcessAlertValue;
    onAccept: (alert: ProcessAlertValue) => void;
    onClose: () => void;
}

const ProcessComment: React.FC<ProcessCommentProps> = ({id, alert, onAccept, onClose}) => {
    const {setLoading} = useLoading();
    const [open, setOpen] = useState(true);
    const [comment, setComment] = useState(alert.comment || '');

    function handleClose() {
        setOpen(false);
        onClose();
    }

    const handleSave = () => {
        setLoading(true);
        updateLine({id: id, lineID: alert.lineID??-1, comment: comment})
            .then((_) => {
                onAccept({
                    ...alert,
                    comment: comment
                })
            })
            .catch(error => {
                console.error(`Error performing update: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    window.alert(errorMessage);
                else
                    window.alert(`Update Line Error: ${error}`);
            })
            .finally(function () {
                setLoading(false);
                handleClose();
            })
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