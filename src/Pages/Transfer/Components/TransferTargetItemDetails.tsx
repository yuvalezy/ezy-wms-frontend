import {Bar, Button, CheckBox, Dialog, DialogDomRef, Input, Label, MessageStripDesign, Table, TableCell, TableColumn, TableRow, Title} from "@ui5/webcomponents-react";
import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {DetailUpdateParameters, Status} from "../../../Assets/Common";
import {fetchTargetItemDetails, fetchTransfers, TargetItemDetail, TransferContent, TransferContentBin} from "../Data/Transfer";

export interface TransferTargetItemsDetailRef {
    show: (content: TransferContent, bin: TransferContentBin) => void;
    hide: () => void;
}

export interface TransferTargetItemsDetailProps {
    id: number;
    onUpdate: (data: DetailUpdateParameters) => void;
}

const TransferTargetItemsDetailsDialog = forwardRef((props: TransferTargetItemsDetailProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert, setError} = useThemeContext();
    const dialogRef = useRef<DialogDomRef>(null);
    const [content, setContent] = useState<TransferContent | null>(null);
    const [bin, setBin] = useState<TransferContentBin | null>(null);
    const [data, setData] = useState<TargetItemDetail[]>([]);
    const [enableUpdate, setEnableUpdate] = useState(false);
    const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({}); // State to store checked rows
    const [quantityChanges, setQuantityChanges] = useState<{ [key: number]: number }>({}); // State to store quantity changes

    function update() {
        try {
            const removeRows = data?.filter(detail => checkedRows[detail.lineID]).map(detail => detail.lineID) ?? [];
            props.onUpdate({id: props.id, removeRows: removeRows, quantityChanges: quantityChanges});
        } catch (e) {
            setError(e);
        }
    }

    function loadDetails(content: TransferContent, bin: TransferContentBin) {
        setLoading(true);
        setEnableUpdate(false);
        setCheckedRows({})
        setQuantityChanges({})
        fetchTransfers({id: props.id})
            .then((transfer) => {
                setEnableUpdate(transfer[0].status === Status.InProgress);
                fetchTargetItemDetails(props.id, content.code, bin.entry)
                    .then((result) => {
                        dialogRef?.current?.show();
                        setData(result);
                    })
                    .catch((error) => setError(error))
                    .finally(() => setLoading(false));
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    useImperativeHandle(ref, () => ({
        show(content: TransferContent, bin: TransferContentBin) {
            setContent(content)
            setBin(bin);
            loadDetails(content, bin);
        },
        hide() {
            dialogRef?.current?.close();
        }
    }))

    function handleCheckboxChange(lineID: number, checked: boolean) {
        setCheckedRows(prevState => ({
            ...prevState,
            [lineID]: checked
        }));
        setEnableUpdate(true);
    }

    function handleQuantityChange(lineID: number, newValue: number) {
        setQuantityChanges(prevState => ({
            ...prevState,
            [lineID]: newValue
        }));
        setEnableUpdate(true);
    }

    function startContent() {
        if (!enableUpdate) {
            return null;
        }
        return <Button disabled={!enableUpdate} onClick={() => update()}>
            {t("update")}
        </Button>
    }

    return (
        <Dialog
            className="footerPartNoPadding"
            ref={dialogRef}
            footer={
                <Bar
                    design="Footer"
                    startContent={startContent()}
                    endContent={
                        <Button design="Negative" onClick={() => dialogRef?.current?.close()}>
                            {t("close")}
                        </Button>
                    }
                />
            }
        >
            <Title level="H5">
                {t("detail")} - {bin?.code}
            </Title>
            <Title level="H6">
                {content?.code} - {content?.name}
            </Title>
            {content && bin &&
                <Table

                    columns={<>
                        {enableUpdate && <TableColumn><Label>{t('delete')}</Label></TableColumn>}
                        <TableColumn><Label>{t('employee')}</Label></TableColumn>
                        <TableColumn><Label>{t('date')}</Label></TableColumn>
                        <TableColumn><Label>{t('time')}</Label></TableColumn>
                        <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                    </>}
                >
                    {data.map((row) => (
                        <TableRow key={row.lineID}>
                            {enableUpdate && <TableCell><CheckBox checked={checkedRows[row.lineID]} onChange={(e) => handleCheckboxChange(row.lineID, e.target.checked ?? false)}/></TableCell>}
                            <TableCell>{row.employeeName}</TableCell>
                            <TableCell>{row.timeStamp?.toLocaleDateString()}</TableCell>
                            <TableCell>{row.timeStamp?.toLocaleTimeString()}</TableCell>
                            <TableCell>{enableUpdate && <Input type="Number" style={{textAlign: 'right', width: '100px'}} value={row.quantity.toString()}
                                              onChange={(e) => handleQuantityChange(row.lineID, parseInt(e.target.value ?? "0", 10))}/>}
                                {!enableUpdate && row.quantity}</TableCell>
                        </TableRow>
                    ))}
                </Table>
            }
        </Dialog>
    );
});
export default TransferTargetItemsDetailsDialog;
