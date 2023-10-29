import React, {useEffect, useRef, useState} from 'react';
import {Box, TextField, Button, Autocomplete} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import DescriptionIcon from '@mui/icons-material/Description';
import {BusinessPartner, fetchVendors} from "../../assets/Data";
import {createDocument, Document, DocumentItem, GoodsReceiptType} from "./Document";
import {useLoading} from "../../Components/LoadingContext";
import {useAuth} from "../../Components/AppContext";
import Tabs from "@mui/material/Tabs";
import {a11yProps, CustomTabPanel} from "../../Components/Tabs";
import Tab from "@mui/material/Tab";
import DocumentList, {DocumentListRef} from "./DocumentList";
import {ObjectName, StringFormat} from "../../assets/Functions";

interface DocumentFormProps {
    onNewDocument: (document: Document) => void;
    onError: (errorMessage: string) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({onNewDocument, onError}) => {
    const {user} = useAuth();
    const {setLoading} = useLoading();
    const documentListRef = useRef<DocumentListRef>();
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [cardCodeInput, setCardCodeInput] = useState<string>('');
    const [docNameInput, setDocNameInput] = useState<string>('');
    const [vendors, setVendors] = useState<BusinessPartner[]>([]);

    useEffect(() => {
        fetchVendors()
            .then(data => {
                setVendors(data);
            })
            .catch(error => {
                console.error("Error fetching vendors:", error);
            });
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setSelectedTab(newValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (docNameInput === null || docNameInput === '') {
            alert(TextValue.IDRequired);
            return;
        }
        switch (selectedTab) {
            case 0:
                if (cardCodeInput.length === 0) {
                    alert(TextValue.VendorRequired);
                    return;
                }
                break;
            case 1:
                if (items.length === 0) {
                    alert(TextValue.DocumentRequired);
                    return;
                }
                break;
        }
        setLoading(true);
        try {
            let type: GoodsReceiptType = selectedTab === 0 ? GoodsReceiptType.AutoConfirm : GoodsReceiptType.SpecificOrders;
            createDocument(type, cardCodeInput, docNameInput, items)
                .then(response => {
                    if (!response.error) {
                        onNewDocument(response);
                        setDocNameInput('');
                        documentListRef.current?.clearItems();
                        return;
                    }
                    let errorMessage: string = TextValue.UnknownError;
                    switch (response.errorCode) {
                        case -1:
                            try {
                                let errorParameters = response.errorParameters;
                                if (errorParameters != null && errorParameters.length >= 3) {
                                    let errorObjType: number = errorParameters[0];
                                    let errorDocNum: number = errorParameters[1];
                                    let errorType: string = errorParameters[2] === 'E' ? TextValue.DoesNotExists : TextValue.IsNotOpen;
                                    switch (errorParameters[2]) {
                                        case 'E':
                                            errorType = TextValue.DoesNotExists;
                                            break;
                                        case 'R':
                                            errorType = 'Not Reserved';
                                            break;
                                        case 'W':
                                            errorType = 'No lines for warehouse';
                                            break;
                                        default:
                                            errorType = TextValue.IsNotOpen;
                                            break;
                                    }
                                    errorMessage = StringFormat(TextValue.BadDocumentError, ObjectName(errorObjType), errorDocNum, errorType);
                                }
                            } catch {
                            }
                            break;
                    }
                    window.alert(errorMessage);
                })
                .catch(e => {
                    console.error(`Error creating document: ${e}`);
                    onError(`Error creating document: ${e.message}`);
                })
                .finally(() => setLoading(false));
        } catch (e: any) {
            onError(`Error creating document: ${e.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{width: '100%', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '4px',}}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example" centered>
                        <Tab label={TextValue.Automatic} {...a11yProps(0)} />
                        <Tab label={TextValue.SpecificDocuments} {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={selectedTab} index={0}>
                    <Box mb={1}>
                        <TextField
                            fullWidth
                            required
                            label={TextValue.ID}
                            variant="outlined"
                            value={docNameInput}
                            onChange={e => setDocNameInput(e.target.value)}
                            inputProps={{maxLength: 50}}
                        />
                    </Box>
                    <Box mb={1}>
                        <Autocomplete
                            options={vendors}
                            getOptionLabel={(option) => option.name}
                            onChange={(_, newValue) => setCardCodeInput(newValue?.code ?? "")}
                            renderInput={(params) =>
                                <TextField {...params} label={TextValue.SelectVendor} variant="outlined"/>
                            }
                        />
                    </Box>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <Button variant="contained" color="primary" type="submit">
                            <DescriptionIcon/>
                            {TextValue.Create}
                        </Button>
                    </Box>
                </CustomTabPanel>
                <CustomTabPanel value={selectedTab} index={1}>
                    <Box mb={1}>
                        <TextField
                            fullWidth
                            required
                            label={TextValue.ID}
                            variant="outlined"
                            value={docNameInput}
                            onChange={e => setDocNameInput(e.target.value)}
                            inputProps={{maxLength: 50}}
                        />
                    </Box>
                    <Box mb={1}>
                        <DocumentList ref={documentListRef} onItemsUpdate={setItems}/>
                    </Box>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <Button variant="contained" color="primary" type="submit">
                            <DescriptionIcon/>
                            {TextValue.Create}
                        </Button>
                    </Box>
                </CustomTabPanel>
            </Box>
        </form>
    )
}

export default DocumentForm;
