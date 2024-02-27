import {BinLocation} from "../Assets/Common";
import {Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React from "react";
import {useTranslation} from "react-i18next";

export interface BinLocationQuantitiesProps {
    data: BinLocation[]
}

export const BinLocationQuantities: React.FC<BinLocationQuantitiesProps> = ({data}) => {
    const {t} = useTranslation();
    return (
        <Table style={{width: 'auto', border: '1px solid lightgrey'}} columns={<>
            <TableColumn><Label>{t('bin')}</Label></TableColumn>
            <TableColumn><Label>{t('quantity')}</Label></TableColumn>
        </>}>
            {data.map((bin) =>
                <TableRow>
                    <TableCell><Label>{bin.code}</Label></TableCell>
                    <TableCell><Label>{bin.quantity}</Label></TableCell>
                </TableRow>
            )}

        </Table>
    )
}

export default BinLocationQuantities;