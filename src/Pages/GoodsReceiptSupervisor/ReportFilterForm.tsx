import React, {useEffect, useState} from 'react';
import {Box, TextField, Button, Autocomplete} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import ClearAllIcon from '@mui/icons-material/ClearAll';
import {BusinessPartner, DocumentStatusOption, DocumentStatusOptions, fetchVendors} from "../../assets/Data";
import {DatePicker} from "@mui/x-date-pickers";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {IsNullOrEmpty} from "../../assets/Functions";

interface ReportFilterFormProps {
    idInput: string;
    setIDInput: (value: string) => void;
    cardCodeInput: BusinessPartner | null;
    setCardCodeInput: (value: BusinessPartner | null) => void;
    docNameInput: string;
    setDocNameInput: (value: string) => void;
    grpoInput: string;
    setGRPOInput: (value: string) => void;
    statusInput: DocumentStatusOption | null;
    setStatusInput: (value: DocumentStatusOption | null) => void;
    dateInput: Date | null;
    setDateInput: (value: Date | null) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({
                                                               idInput,
                                                               setIDInput,
                                                               cardCodeInput,
                                                               setCardCodeInput,
                                                               docNameInput,
                                                               setDocNameInput,
                                                               grpoInput,
                                                               setGRPOInput,
                                                               statusInput,
                                                               setStatusInput,
                                                               dateInput,
                                                               setDateInput,
                                                               handleSubmit
                                                           }) => {
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

    function clearForm() {
        setIDInput('');
        setCardCodeInput(null);
        setDocNameInput('');
        setGRPOInput('');
        setStatusInput(null);
        setDateInput(null);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Box mb={1} style={{textAlign: 'center'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker label={TextValue.Date} value={dateInput} onChange={(newValue) => setDateInput(newValue)}/>
                </LocalizationProvider>
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Autocomplete
                    value={cardCodeInput}
                    options={vendors}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => setCardCodeInput(newValue)}
                    renderInput={(params) =>
                        <TextField {...params} label={TextValue.Vendor} variant="outlined"/>
                    }
                />
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <TextField
                    id="idInput"
                    fullWidth
                    required
                    label={TextValue.Transaction}
                    variant="outlined"
                    value={idInput}
                    type="number"
                    onChange={e => {
                        let value = e.target.value;
                        return setIDInput(value);
                    }}
                    inputProps={{maxLength: 50}}
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
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <TextField
                    fullWidth
                    required
                    label={TextValue.GoodsReceipt}
                    variant="outlined"
                    value={grpoInput}
                    type="number"
                    onChange={e => {
                        let value = e.target.value;
                        return setGRPOInput(value);
                    }}
                    inputProps={{maxLength: 50}}
                />
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Autocomplete
                    options={DocumentStatusOptions}
                    value={statusInput}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => setStatusInput(newValue)}
                    renderInput={(params) =>
                        <TextField {...params} label={TextValue.Status} variant="outlined"/>
                    }
                />
            </Box>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Box mt={1}>
                    <Button variant="contained" color="primary" onClick={() => clearForm()}>
                        <ClearAllIcon/>
                        {TextValue.Clear}
                    </Button>
                </Box>
            </Box>
        </form>
    )

}

export default ReportFilterForm;
