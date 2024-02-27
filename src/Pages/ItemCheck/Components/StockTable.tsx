import {useTranslation} from "react-i18next";
import {Button, CheckBox, Grid, Input, Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React, {useEffect, useState} from "react";
import {itemStock, ItemStockResponse} from "../Item";
import {useThemeContext} from "../../../Components/ThemeContext";

interface StockTableProps {
    itemCode: string;
}

const StockTable: React.FC<StockTableProps> = ({itemCode}) => {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [data, setData] = useState<ItemStockResponse[]>([]);

    useEffect(() => {
        setLoading(true);
        itemStock(itemCode)
            .then((data) => setData(data))
            .catch((e) => setError(e))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Table
                columns={
                    <>
                        <TableColumn><Label>{t('bin')}</Label></TableColumn>
                        <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                    </>
                }
            >
                {data.map((value, index) => (
                    <TableRow key={index}>
                        <TableCell><Label>{value.binCode}</Label></TableCell>
                        <TableCell><Label>{value.quantity}</Label></TableCell>
                    </TableRow>
                ))}
            </Table>
        </>
    );
};
export default StockTable;
