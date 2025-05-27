import React, {useEffect, useRef, useState} from "react";
import {createDocument, GoodsReceiptType,} from "../Data/Document";
import {useThemeContext} from "../../../components/ThemeContext";
import DocumentList, {DocumentListRef} from "./DocumentList";
import {useTranslation} from "react-i18next";
import {
    Button,
    ComboBox,
    ComboBoxItem,
    Form,
    FormItem, Input, Tab,
    TabContainer,
} from "@ui5/webcomponents-react";
import {useObjectName} from "../../../Assets/ObjectName";
import {Document, DocumentItem} from "../../../Assets/Document";
import {BusinessPartner, fetchVendors} from "../../../Assets/Data";
import {StringFormat} from "../../../Assets/Functions";

interface DocumentFormProps {
    onNewDocument: (document: Document) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({onNewDocument,}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const {setLoading, setError} = useThemeContext();
    const documentListRef = useRef<DocumentListRef>();
    const [selectedType, setSelectedType] = React.useState(GoodsReceiptType.AutoConfirm);
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [cardCodeInput, setCardCodeInput] = useState<string>("");
    const [docNameInput, setDocNameInput] = useState<string>("");
    const [vendors, setVendors] = useState<BusinessPartner[]>([]);

    useEffect(() => {
        fetchVendors()
            .then((data) => setVendors(data))
            .catch((error) => setError(error));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // if (docNameInput === null || docNameInput === "") {
        //     alert(t("idRequired"));
        //     return;
        // }
        switch (selectedType) {
            case GoodsReceiptType.AutoConfirm:
                // if (cardCodeInput.length === 0) {
                //     alert(t("vendorRequired"));
                //     return;
                // }
                break;
            case GoodsReceiptType.SpecificOrders:
                if (items.length === 0) {
                    alert(t("documentRequired"));
                    return;
                }
                break;
        }
        setLoading(true);
        try {
            createDocument(
                selectedType,
                cardCodeInput,
                docNameInput,
                items
            )
                .then((response) => {
                    if (!response.error) {
                        onNewDocument(response);
                        setDocNameInput("");
                        documentListRef.current?.clearItems();
                        return;
                    }
                    let errorMessage: string = t("unknownError");
                    switch (response.errorCode) {
                        case -1:
                            try {
                                let errorParameters = response.errorParameters;
                                if (errorParameters != null && errorParameters.length >= 3) {
                                    let errorObjType: number = errorParameters[0];
                                    let errorDocNum: number = errorParameters[1];
                                    let errorType: string =
                                        errorParameters[2] === "E"
                                            ? t("doesNotExists")
                                            : t("isNotOpen");
                                    switch (errorParameters[2]) {
                                        case "E":
                                            errorType = t("doesNotExists");
                                            break;
                                        case "R":
                                            errorType = "Not Reserved";
                                            break;
                                        case "W":
                                            errorType = "No lines for warehouse";
                                            break;
                                        default:
                                            errorType = t("isNotOpen");
                                            break;
                                    }
                                    errorMessage = StringFormat(
                                        t("badDocumentError"),
                                        o(errorObjType),
                                        errorDocNum,
                                        errorType
                                    );
                                }
                            } catch {
                            }
                            break;
                    }
                    setError(errorMessage);
                })
                .catch((e) => setError(e))
                .finally(() => setLoading(false));
        } catch (e: any) {
            setError(e);
        }
    };

    return (
        <TabContainer
            onTabSelect={(e) =>
                setSelectedType(
                    e.detail.tabIndex === 0
                        ? GoodsReceiptType.AutoConfirm
                        : GoodsReceiptType.SpecificOrders
                )
            }
        >
            <Tab text={t("automatic")} selected>
                <Form>
                    <FormItem label={t("id")}>
                        <Input
                            value={docNameInput}
                            onInput={(e) => setDocNameInput(e.target.value as string)}
                            maxlength={50}
                        ></Input>
                    </FormItem>
                    <FormItem label={t("selectVendor")}>
                        <ComboBox
                            onSelectionChange={(e) =>
                                setCardCodeInput(
                                    vendors[Array.from(e.target.children).indexOf(e.detail.item)]
                                        .code
                                )
                            }
                        >
                            {vendors.map((vendor) => (
                                <ComboBoxItem key={vendor.code} text={vendor.name}/>
                            ))}
                        </ComboBox>
                    </FormItem>
                    <FormItem>
                        <Button color="primary" icon="create" onClick={handleSubmit}>
                            {t("create")}
                        </Button>
                    </FormItem>
                </Form>
            </Tab>
            <Tab text={t("specificDocuments")}>
                <Form>
                    <FormItem label={t("id")}>
                        <Input
                            value={docNameInput}
                            onInput={(e) => setDocNameInput(e.target.value as string)}
                            maxlength={50}
                        ></Input>
                    </FormItem>
                    <FormItem label={t("documentsList")}>
                        <DocumentList ref={documentListRef} onItemsUpdate={setItems}/>
                    </FormItem>
                    <FormItem>
                        <Button color="primary" icon="create" onClick={handleSubmit}>
                            {t("create")}
                        </Button>
                    </FormItem>
                </Form>
            </Tab>
        </TabContainer>
    );
};

export default DocumentForm;
