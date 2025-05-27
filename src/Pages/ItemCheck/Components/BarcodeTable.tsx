import {useTranslation} from "react-i18next";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import {Label} from "@/components/ui/label";

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
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16">{t('delete')}</TableHead>
                        <TableHead>{t('barcode')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {barcodes.map((barcode, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Checkbox
                                    checked={checkedBarcodes.includes(barcode)}
                                    onCheckedChange={(checked: boolean) => handleCheckboxChange(barcode, checked)}
                                />
                            </TableCell>
                            <TableCell><Label
                              style={{cursor: 'pointer'}}
                              onClick={() => handleCheckboxChange(barcode, !checkedBarcodes.includes(barcode))}>{barcode}</Label></TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
                            <Input
                                maxLength={254}
                                placeholder={t('newBarcode')}
                                value={newBarcodeInput}
                                onChange={(e) => setNewBarcodeInput(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className="flex justify-center p-2">
                <Button variant="destructive" onClick={handleSubmit}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {t('update')}
                </Button>
            </div>
        </div>
    );
};
export default BarcodeTable;
