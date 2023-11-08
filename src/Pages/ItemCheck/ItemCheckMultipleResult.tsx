import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import {
    Label,
    Button,
    Table,
    TableRow,
    TableCell,
    TableColumn,
    Icon,
    MessageStrip
} from "@ui5/webcomponents-react";

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
            <div style={{margin: '5px'}}>
                <MessageStrip design="Warning" hideCloseButton>
                    <strong>
                        {t('multipleItemsDetected')}
                    </strong>
                    <br/>
                    {t('barcode')}: {barcode}
                </MessageStrip>
            </div>
            <Table
                columns={<>
                    <TableColumn/>
                    <TableColumn>
                        <Label>{t('item')}</Label>
                    </TableColumn>
                    <TableColumn>
                        <Label>{t('description')}</Label>
                    </TableColumn>
                </>}
            >
                {
                    result.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Button design="Emphasized" onClick={() => setBarcodeItem(index)}>{t('select')}</Button>
                            </TableCell>
                            <TableCell><Label>{item.itemCode}</Label></TableCell>
                            <TableCell><Label>{item.itemName}</Label></TableCell>
                        </TableRow>
                    ))
                }
            </Table>
            <br/>
            <div style={{textAlign: 'center'}}>
                <Button design="Attention" onClick={() => clear()}>
                    <Icon design="Critical" name="cancel"/>
                    {t('clear')}
                </Button>
            </div>
        </>
    )
}
export default ItemCheckMultipleResult;