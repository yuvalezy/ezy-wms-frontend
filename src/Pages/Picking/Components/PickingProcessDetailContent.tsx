import {Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {PickingDocumentDetailItem} from "../Data/PickingDocument";
import BinLocationQuantities from "../../../components/BinLocationQuantities";

export interface PickingProcessDetailContentProps {
    items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items }) => {
    const {t} = useTranslation();
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        setAvailable(items?.some(i => i.available != null && i.available > 0)??false);
    }, [items]);

    return (
        <div className="contentStyle">
            <Table
                columns={<>
                    <TableColumn><Label>{t('code')}</Label></TableColumn>
                    <TableColumn><Label>{t('description')}</Label></TableColumn>
                    <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                    <TableColumn><Label>{t('picked')}</Label></TableColumn>
                    <TableColumn><Label>{t('pending')}</Label></TableColumn>
                    {available && <TableColumn><Label>{t('available')}</Label></TableColumn>}
                </>}
            >
                {items?.map((row) => (
                    <>
                        <TableRow key={row.itemCode} className={row.openQuantity === 0 ? 'completed-row' : ''}>
                            <TableCell><Label>{row.itemCode}</Label></TableCell>
                            <TableCell><Label>{row.itemName}</Label></TableCell>
                            <TableCell><Label>{row.quantity}</Label></TableCell>
                            <TableCell><Label>{row.picked}</Label></TableCell>
                            <TableCell><Label>{row.openQuantity}</Label></TableCell>
                            {available && <TableCell><Label>{row.available}</Label></TableCell>}
                        </TableRow>
                        {!available && row.openQuantity > 0 && <tr>
                            <td colSpan={5} style={{textAlign: 'center'}}>
                                {row.binQuantities && <BinLocationQuantities data={row.binQuantities}/>}
                            </td>
                        </tr>}
                    </>
                ))}
            </Table>
        </div>
    )
}

export default PickingProcessDetailContent;
