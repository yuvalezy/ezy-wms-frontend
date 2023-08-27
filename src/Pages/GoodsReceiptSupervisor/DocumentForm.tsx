import React, {useEffect, useState} from 'react';
import {Box, TextField, Button, Autocomplete} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import DescriptionIcon from '@mui/icons-material/Description';
import {BusinessPartner, fetchVendors} from "../../assets/Data";

interface DocumentFormProps {
    cardCodeInput: string;
    setCardCodeInput: (value: string) => void;
    docNameInput: string;
    setDocNameInput: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
                                                       cardCodeInput,
                                                       setCardCodeInput,
                                                       docNameInput,
                                                       setDocNameInput,
                                                       handleSubmit
                                                   }) => {
    const [vendors, setVendors] = useState<BusinessPartner[]>([]);

    useEffect(() => {
        // Fetch vendors on component mount
        fetchVendors()
            .then(data => {
                setVendors(data);
            })
            .catch(error => {
                console.error("Error fetching vendors:", error);
            });
    }, []);  // The empty dependency array ensures this runs once on component mount

    return (
        <form onSubmit={handleSubmit}>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Autocomplete
                    options={vendors}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => {
                        if (newValue) {
                            setCardCodeInput(newValue.code);
                        } else {
                            setCardCodeInput("");
                        }
                    }}
                    renderInput={(params) =>
                        <TextField {...params} label={TextValue.SelectVendor} variant="outlined" />
                    }
                />
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <TextField
                    fullWidth
                    required
                    label={TextValue.ID}
                    variant="outlined"
                    value={docNameInput}
                    onChange={e => setDocNameInput(e.target.value)}
                    inputProps={{maxLength: 50}}
                />
                <Box mt={1}>
                    <Button variant="contained" color="primary" type="submit">
                        <DescriptionIcon/>
                        {TextValue.Create}
                    </Button>
                </Box>
            </Box>
        </form>
    )
}

export default DocumentForm;
