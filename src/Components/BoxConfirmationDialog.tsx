import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import {TextValue} from "../assets/TextValue";
import {List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from "@mui/material";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import {blue} from "@mui/material/colors";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {Item} from "../assets/Common";

interface BoxConfirmationDialogProps {
    open: boolean,
    onClose: () => void,
    onSelected: (itemCode: string) => void,
    itemCode: string;
    items?: Item[]
}

const BoxConfirmationDialog: React.FC<BoxConfirmationDialogProps> = ({open, onClose, onSelected, itemCode, items}) => {
    let boxes = 0;
    items?.forEach(item => {
        let boxNumber = item.boxNumber ?? 0;
        if (boxNumber > boxes) {
            boxes = boxNumber;
        }
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="h5">
                    {TextValue.Item}: {itemCode}
                </Typography>
                <Typography variant="h6">
                    {TextValue.SelectBox}
                </Typography>
            </DialogTitle>
            <List sx={{pt: 0}}>
                {items?.map((item, i) => (
                    <ListItem disableGutters key={i}>
                        <ListItemButton onClick={() => onSelected(item.code)}>
                            <ListItemAvatar>
                                <Avatar sx={{bgcolor: blue[100], color: blue[600]}}>
                                    <ArrowRightIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={`${item.boxNumber} ${TextValue.Of} ${boxes}`}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <DialogActions style={{justifyContent: 'center'}}>
                <Button onClick={onClose} color="error">
                    {TextValue.Cancel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BoxConfirmationDialog;