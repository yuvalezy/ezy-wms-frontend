import {Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React from "react";
import {useTranslation} from "react-i18next";
import {PickingDocumentDetailItem} from "../Data/PickingDocument";
import BinLocationQuantities from "../../../Components/BinLocationQuantities";

export interface PickingProcessDetailContentProps {
    items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items}) => {
    const {t} = useTranslation();
    return (
        <div className="contentStyle">
            <Table
                columns={<>
                    <TableColumn><Label>{t('code')}</Label></TableColumn>
                    <TableColumn><Label>{t('description')}</Label></TableColumn>
                    <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                    <TableColumn><Label>{t('picked')}</Label></TableColumn>
                    <TableColumn><Label>{t('pending')}</Label></TableColumn>
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
                        </TableRow>
                        {row.openQuantity > 0 && <tr>
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
