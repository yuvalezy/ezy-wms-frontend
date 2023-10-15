import React, {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import TextField from "@mui/material/TextField";

export interface ProcessCancelProps {

}

const ProcessCancel: React.FC<ProcessCancelProps> = () => {
    // const [open, setOpen] = useState(false);
    // const [dialogType, setDialogType] = useState<DialogType | null>(null);
    // const [comment, setComment] = useState(alert.comment || '');
    // const [password, setPassword] = useState('');
    // const [reason, setReason] = useState(-1);
    //
    // const handleClickOpen = (type: DialogType) => {
    //     setDialogType(type);
    //     setOpen(true);
    //     setComment(alert.comment || '');
    //     setPassword('');
    //     setReason(-1);
    // };
    //
    // const handleClose = () => setOpen(false);
    //
    // const handleSave = () => {
    //     switch (dialogType) {
    //         case DialogType.Comments:
    //             onEditComment(comment);
    //             break;
    //     }
    //     handleClose();
    // };
    // return (
    //     <Dialog open={open} onClose={handleClose}>
    //         <DialogTitle>{TextValue.Comment}</DialogTitle>
    //         <DialogContent>
    //             <DialogContentText>
    //                 <strong>{TextValue.Barcode}: </strong>{alert.barcode}
    //             </DialogContentText>
    //             {dialogType === DialogType.Cancel && <div>
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     name="username"
    //                     label={TextValue.SupervisorCode}
    //                     type="password"
    //                     id="username"
    //                     autoComplete="current-password"
    //                 />
    //                 {TextValue.Comment}
    //                 <TextareaAutosize style={{minHeight: '50px', width: '100%'}}
    //                                   minRows={3}
    //                                   maxRows={5}
    //                                   value={comment}
    //                                   onChange={(e) => setComment(e.target.value)}
    //                 />
    //             </div>}
    //             {dialogType === DialogType.Comments &&
    //                 <div>
    //                     <TextareaAutosize style={{minHeight: '100px', width: '100%'}}
    //                                       minRows={3}
    //                                       maxRows={5}
    //                                       value={comment}
    //                                       onChange={(e) => setComment(e.target.value)}
    //                     />
    //                 </div>
    //             }
    //         </DialogContent>
    //         <DialogActions>
    //             <Button onClick={handleClose} color="primary">
    //                 Cancel
    //             </Button>
    //             <Button onClick={handleSave} color="primary">
    //                 Save
    //             </Button>
    //         </DialogActions>
    //     </Dialog>
    // )
    return (<div></div>)
}
export default ProcessCancel;