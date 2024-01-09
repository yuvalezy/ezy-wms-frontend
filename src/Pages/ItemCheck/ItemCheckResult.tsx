import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import {
    Input,
    Label,
    Button,
    Card,
    CardHeader,
    CheckBox,
    Grid,
    List,
    StandardListItem,
    Table,
    TableRow,
    TableCell,
    TableColumn,
    Icon,
    CheckBoxDomRef
} from "@ui5/webcomponents-react";

interface ItemCheckResultProps {
    result: ItemCheckResponse;
    clear: () => void;
    submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, clear, submit}) => {
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
        submit(result.itemCode, checkedBarcodes, newBarcodeInput);
        setCheckedBarcodes([]);
        setNewBarcodeInput('');
    }

    return (
        <Card header={<CardHeader titleText={`${t('code')}: ${result.itemCode}`}/>}>
            <List>
                <StandardListItem><strong>{t('description')}:</strong> {result.itemName}</StandardListItem>
                <StandardListItem> <strong>{t('purPackUn')}:</strong> {result.purPackUn}</StandardListItem>
            </List>
            <Table
                columns={<>
                    <TableColumn>
                        <Label>{t('delete')}</Label>
                    </TableColumn>
                    <TableColumn>
                        <Label>{t('barcode')}</Label>
                    </TableColumn>
                </>}
            >
                {result?.barcodes?.map((barcode, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <Label>
                                <CheckBox
                                    checked={checkedBarcodes.includes(barcode)}
                                    onChange={(e) => handleCheckboxChange(barcode, (e.target as CheckBoxDomRef).checked??false)}
                                />
                            </Label>
                        </TableCell>
                        <TableCell>
                            <Label>
                                {barcode}
                            </Label>
                        </TableCell>
                    </TableRow>
                ))}
                <TableRow>
                    <TableCell>
                    </TableCell>
                    <TableCell>
                        <Label>
                            <Input maxlength={254} placeholder={t('newBarcode')} value={newBarcodeInput}
                                   onChange={(e) => setNewBarcodeInput(e.target.value as string)}/>
                        </Label>
                    </TableCell>
                </TableRow>
            </Table>
            <Grid>
                <div style={{textAlign: 'center', padding: '5px'}}>
                    <Button icon="save" design="Attention" onClick={() => handleSubmit()} color="warning">
                        {t('update')}
                    </Button>
                </div>
                <div style={{textAlign: 'center', padding: '5px'}}>
                    <Button icon="cancel" onClick={() => clear()}>
                        {t('clear')}
                    </Button>
                </div>
            </Grid>
        </Card>
    )
}

export default ItemCheckResult;