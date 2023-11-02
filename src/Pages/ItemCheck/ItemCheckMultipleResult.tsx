// import {Alert, AlertTitle, Button, Paper, Table, TableBody, TableHead} from "@mui/material";
// import TableContainer from "@mui/material/TableContainer";
// import TableRow from "@mui/material/TableRow";
// import TableCell from "@mui/material/TableCell";
// import Box from "@mui/material/Box";
// import HighlightOffIcon from "@mui/icons-material/HighlightOff";
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
    CheckBoxDomRef,
    MessageStrip
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/save.js"
import "@ui5/webcomponents-icons/dist/cancel.js"

interface ItemCheckMultipleResultProps {
    barcode: string;
    result: ItemCheckResponse[];
    clear: () => void;
    setBarcodeItem: (index: number) => void;
}

const ItemCheckMultipleResult: React.FC<ItemCheckMultipleResultProps> = ({barcode, result, clear, setBarcodeItem}) => {
    const {t} = useTranslation();
    return (
        <>
            <MessageStrip design="Warning" hideCloseButton>
                <strong>
                    {t('MultipleItemsDetected')}
                </strong>
                {t('Barcode')}: {barcode}
            </MessageStrip>
            <br/>
            <br/>
            <Table
                columns={<>
                    <TableColumn>
                        <Label>{t('Item')}</Label>
                    </TableColumn>
                    <TableColumn>
                        <Label>{t('Description')}</Label>
                    </TableColumn>
                    <TableColumn/>
                </>}
            >
                    {
                        result.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell><Label>{item.itemCode}</Label></TableCell>
                                <TableCell><Label>{item.itemName}</Label></TableCell>
                                <TableCell>
                                    <Button design="Emphasized" onClick={() => setBarcodeItem(index)}>{t('Select')}</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    }
            </Table>
            <br/>
            <Button design="Attention" onClick={() => clear()}>
                <Icon design="Critical" name="cancel"/>
                {t('Clear')}
            </Button>
        </>
    )
}
export default ItemCheckMultipleResult;