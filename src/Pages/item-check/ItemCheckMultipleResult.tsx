import React from "react";
import {ItemCheckResponse} from "./item";
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ItemCheckMultipleResultProps {
    barcode: string;
    result: ItemCheckResponse[];
    clear: () => void;
    setBarcodeItem: (index: number) => void;
}

const ItemCheckMultipleResult: React.FC<ItemCheckMultipleResultProps> = ({barcode, clear, result, setBarcodeItem}) => {
    const {t} = useTranslation();
    return (
        <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                    <strong>{t('multipleItemsDetected')}</strong>
                    <br/>
                    {t('barcode')}: {barcode}
                </AlertDescription>
            </Alert>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-24"></TableHead>
                        <TableHead>{t('item')}</TableHead>
                        <TableHead>{t('description')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Button onClick={() => setBarcodeItem(index)}>
                                    {t('select')}
                                </Button>
                            </TableCell>
                            <TableCell>{item.itemCode}</TableCell>
                            <TableCell>{item.itemName}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            <div className="flex justify-center">
                <Button variant="destructive" onClick={() => clear()}>
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    {t('clear')}
                </Button>
            </div>
        </div>
    )
}
export default ItemCheckMultipleResult;
