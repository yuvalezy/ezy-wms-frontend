import {useTranslation} from "react-i18next";
import {Button, CheckBox, Grid, Input, Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React from "react";

interface BarcodeTableProps {
    itemCode: string;
    barcodes: string[];
    submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
}

const BarcodeTable: React.FC<BarcodeTableProps> = ({itemCode, barcodes, submit}) => {
    const {t} = useTranslation();
    const [checkedBarcodes, setCheckedBarcodes] = React.useState<string[]>([]);
    const [newBarcodeInput, setNewBarcodeInput] = React.useState('');

    function handleCheckboxChange(barcode: string, isChecked: boolean) {
        if (isChecked) {
            setCheckedBarcodes(prev => [...prev, barcode]);
        } else {
            setCheckedBarcodes(prev => prev.filter(bc => bc !== barcode));
        }
    }
    function handleSubmit() {
        submit(itemCode, checkedBarcodes, newBarcodeInput);
        setCheckedBarcodes([]);
        setNewBarcodeInput('');
    }

    return (
        <>
            <Table
                columns={
                    <>
                        <TableColumn><Label>{t('delete')}</Label></TableColumn>
                        <TableColumn><Label>{t('barcode')}</Label></TableColumn>
                    </>
                }
            >
                {barcodes.map((barcode, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <CheckBox
                                checked={checkedBarcodes.includes(barcode)}
                                onChange={(e) => handleCheckboxChange(barcode, e.target.checked ?? false)}
                            />
                        </TableCell>
                        <TableCell><Label>{barcode}</Label></TableCell>
                    </TableRow>
                ))}
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell>
                        <Input
                            maxlength={254}
                            placeholder={t('newBarcode')}
                            value={newBarcodeInput}
                            onChange={(e) => setNewBarcodeInput(e.target.value as string)}
                        />
                    </TableCell>
                </TableRow>
            </Table>
            <Grid>
                <div style={{textAlign: 'center', padding: '5px'}}>
                    <Button icon="save" design="Attention" onClick={handleSubmit} color="warning">
                        {t('update')}
                    </Button>
                </div>
            </Grid>
        </>
    );
};
export default BarcodeTable;
