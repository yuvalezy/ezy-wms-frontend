import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {DocumentItem} from "./Document";
import {Select, Typography} from '@mui/material';
import MenuItem from "@mui/material/MenuItem";
import {TextValue} from "../../assets/TextValue";
import AddIcon from '@mui/icons-material/Add';
import {ObjectName} from "../../assets/Functions";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export interface DocumentListRef {
    clearItems: () => void;
}

type DocumentListProps = {
    onItemsUpdate: (newItems: DocumentItem[]) => void;
};

// function DocumentList({onItemsUpdate}: DocumentListProps)
const DocumentList = forwardRef((props: DocumentListProps, ref) => {
    const docNumRef = useRef<HTMLInputElement>();
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [objType, setObjType] = useState<string>('18');
    const [docNum, setDocNum] = useState<string>('');

    useImperativeHandle(ref, () => ({
        clearItems() {
            setItems([]);
        }
    }))
    const handleAddClick = () => {
        if (docNum.length === 0) {
            window.alert(TextValue.DocumentRequired);
            return;
        }
        let newDocument: DocumentItem = {
            objectType: parseInt(objType),
            documentNumber: parseInt(docNum)
        };
        if (items.find(i => i.objectType === newDocument.objectType && i.documentNumber === newDocument.documentNumber)) {
            alert(TextValue.DuplicateNotAllowed)
            return;
        }
        const newItems = items.concat(newDocument);
        setItems(newItems);
        setDocNum('');
        docNumRef.current?.focus();
        props.onItemsUpdate(newItems);
    };

    const handleRemoveClick = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        props.onItemsUpdate(newItems);
    };

    return (
        <Box sx={{border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '4px', padding: '10px'}}>
            <Typography variant="body1" component="h2" gutterBottom style={{paddingLeft: '5px', color: 'rgba(0, 0, 0, 0.6)'}}>
                {TextValue.DocumentsList} *
            </Typography>
            <List>
                {items.map((item, index) => (
                    <ListItem key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <ListItemText primary={`${ObjectName(item.objectType)}: ${item.documentNumber}`} />
                        <IconButton onClick={() => handleRemoveClick(index)} color="error">
                            <CloseIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>            <Box style={{paddingBottom: '5px'}}>
                <Select
                    required
                    fullWidth
                    value={objType}
                    onChange={e => setObjType(e.target.value)}
                >
                    <MenuItem value="22">{TextValue.PurchaseOrder}</MenuItem>
                    <MenuItem value="18">{TextValue.ReservedInvoice}</MenuItem>
                </Select>
            </Box>
            <Box>
                <TextField
                    label={TextValue.DocumentNumber}
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={docNum}
                    inputRef={docNumRef}
                    onChange={(e) => setDocNum(e.target.value)}
                    style={{marginRight: '10px'}}
                />
            </Box>
            <Box style={{textAlign: 'right', padding: '5px'}}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAddClick}
                >
                    <AddIcon/>
                    {TextValue.Add}
                </Button>
            </Box>
        </Box>
    );
});

export default DocumentList;
