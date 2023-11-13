import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Icon, ComboBox, ComboBoxItem, Input, Button, List, StandardListItem, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {DocumentItem} from "../../Assets/Document";
import {useObjectName} from "../../Assets/ObjectName";

export interface DocumentListRef {
    clearItems: () => void;
}

type DocumentListProps = {
    onItemsUpdate: (newItems: DocumentItem[]) => void;
};

// function DocumentList({onItemsUpdate}: DocumentListProps)
const DocumentList = forwardRef((props: DocumentListProps, ref) => {
    const {t} = useTranslation();
    const {setAlert} = useThemeContext();
    const o = useObjectName();
    const docNumRef = useRef<HTMLInputElement>();
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [objType, setObjType] = useState(18);
    const [docNum, setDocNum] = useState<string>('');

    useImperativeHandle(ref, () => ({
        clearItems() {
            setItems([]);
        }
    }))
    const handleAddClick = () => {
        if (docNum.length === 0) {
            setAlert({message: t('documentRequired'), type: MessageStripDesign.Warning});
            return;
        }
        let newDocument: DocumentItem = {
            objectType: objType,
            documentNumber: parseInt(docNum)
        };
        if (items.find(i => i.objectType === newDocument.objectType && i.documentNumber === newDocument.documentNumber)) {
            setAlert({message: t('duplicateNotAllowed'), type: MessageStripDesign.Warning});
            return;
        }
        const newItems = items.concat(newDocument);
        setItems(newItems);
        setDocNum('');
        docNumRef.current?.focus();
        props.onItemsUpdate(newItems);
    };

    const handleRemoveClick = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        props.onItemsUpdate(newItems);
    };

    return (
        <div style={{border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '4px', padding: '5px'}}>
            <List>
                {items.map((item, index) => (
                    <StandardListItem key={index} style={{display: 'flex', alignItems: 'center'}}>
                        {`${o(item.objectType)}: ${item.documentNumber}`}
                        <Icon style={{float: 'right'}} name="decline" design="Negative" onClick={() => handleRemoveClick(index)}/>
                    </StandardListItem>
                ))}
            </List>
            <ComboBox required value={o(objType)} onSelectionChange={e => setObjType(e.detail.item.text === t('purchaseOrder') ? 22 : 18)}>
                <>
                    <ComboBoxItem text={t('purchaseOrder')}/>
                    <ComboBoxItem text={t('reservedInvoice')}/>
                </>
            </ComboBox>
            <br/>
            <Input value={docNum} type="Number" placeholder={t('documentNumber')} onInput={e => setDocNum(e.target.value as string)}/>
            <Button color="secondary" onClick={handleAddClick}>
                <Icon name="add"/>
                {t('add')}
            </Button>
        </div>
    );
});

export default DocumentList;
