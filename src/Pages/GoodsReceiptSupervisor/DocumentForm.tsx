import React from 'react';
import {Box, TextField, Button} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import DescriptionIcon from '@mui/icons-material/Description';

interface DocumentFormProps {
    docNameInput: string;
    setDocNameInput: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({docNameInput, setDocNameInput, handleSubmit}) => {
    return (
        <form onSubmit={handleSubmit}>
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
