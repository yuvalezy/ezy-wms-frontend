import React, {useEffect, useRef, useState, useContext} from "react";
import {useTranslation} from "react-i18next";
import {
    Grid,
    Input,
    ComboBox,
    ComboBoxItem,
    Form,
    FormItem,
    Button,
    Panel,
    PanelDomRef,
} from "@ui5/webcomponents-react";
import {AuthContext} from "../../../Components/AppContext";
import {BusinessPartner, fetchVendors, useDocumentStatusOptions} from "../../../Assets/Data";
import {DocumentStatusOption} from "../../../Assets/Document";

interface ReportFilterFormProps {
    idInput: string;
    setIDInput: (value: string) => void;
    cardCodeInput: BusinessPartner | null;
    setCardCodeInput: (value: BusinessPartner | null) => void;
    docNameInput: string;
    setDocNameInput: (value: string) => void;
    grpoInput: string;
    setGRPOInput: (value: string) => void;
    statusInput: DocumentStatusOption | null;
    setStatusInput: (value: DocumentStatusOption | null) => void;
    dateInput: Date | null;
    setDateInput: (value: Date | null) => void;
    onSubmit: () => void;
    onClear: () => void;
}

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({
                                                               idInput,
                                                               setIDInput,
                                                               cardCodeInput,
                                                               setCardCodeInput,
                                                               docNameInput,
                                                               setDocNameInput,
                                                               grpoInput,
                                                               setGRPOInput,
                                                               statusInput,
                                                               setStatusInput,
                                                               dateInput,
                                                               setDateInput,
                                                               onSubmit,
                                                               onClear,
                                                           }) => {
    const {config} = useContext(AuthContext);

    const [vendors, setVendors] = useState<BusinessPartner[]>([]);
    const {t} = useTranslation();
    const documentStatusOptions = useDocumentStatusOptions();
    const panelRef = useRef<PanelDomRef>(null);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [vendorValue, setVendorValue] = useState<string>("");
    const [statusValue, setStatusValue] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string | undefined>();

    useEffect(() => {
        fetchVendors()
            .then((data) => {
                setVendors(data);
            })
            .catch((error) => {
                console.error("Error fetching vendors:", error);
            });
    }, []);

    function clearForm() {
        setIDInput("");
        setCardCodeInput(null);
        setDocNameInput("");
        setGRPOInput("");
        setStatusInput(null);
        setDateInput(null);

        setVendorValue("");
        setStatusValue("");
        setSelectedDate(undefined);

        onClear();
    }

    const handleSubmit = () => {
        setIsPanelCollapsed(true);
        onSubmit();
    };

    return (
        <Panel
            collapsed={isPanelCollapsed}
            onToggle={() => setIsPanelCollapsed(!isPanelCollapsed)}
            ref={panelRef}
            headerText={t("filters")}
        >
            <Form>
                {/*<FormItem label={t("date")}>*/}
                {/*    <DatePicker*/}
                {/*        value={selectedDate !== undefined ? selectedDate : ""}*/}
                {/*        primaryCalendarType="Gregorian"*/}
                {/*        onChange={(e) => {*/}
                {/*            setDateInput(e.target.dateValue);*/}
                {/*            setSelectedDate(e.target.value);*/}
                {/*        }}*/}
                {/*    />*/}
                {/*</FormItem>*/}
                <FormItem label={t("vendor")}>
                    <ComboBox
                        value={vendorValue}
                        onSelectionChange={(e) => {
                            setCardCodeInput(
                                vendors[Array.from(e.target.children).indexOf(e.detail.item)]
                            );
                            setVendorValue(e.detail.item.text);
                        }}
                    >
                        {vendors.map((vendor) => (
                            <ComboBoxItem key={vendor.code} text={vendor.name}/>
                        ))}
                    </ComboBox>
                </FormItem>
                <FormItem label={t("transaction")}>
                    <Input
                        value={idInput}
                        type="Number"
                        onChange={(e) => setIDInput(e.target.value as string)}
                    />
                </FormItem>
                <FormItem label={t("id")}>
                    <Input
                        value={docNameInput}
                        onChange={(e) => setDocNameInput(e.target.value as string)}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={t("goodsReceipt")}>
                    <Input
                        value={grpoInput}
                        type="Number"
                        onChange={(e) => setGRPOInput(e.target.value as string)}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={t("status")}>
                    <ComboBox
                        value={statusValue}
                        onSelectionChange={(e) => {
                            setStatusInput(
                                documentStatusOptions[
                                    Array.from(e.target.children).indexOf(e.detail.item)
                                    ]
                            );
                            setStatusValue(e.detail.item.text); // Update the state when selection changes
                        }}
                    >
                        {documentStatusOptions.map((option) => (
                            <ComboBoxItem key={option.code} text={option.name}/>
                        ))}
                    </ComboBox>
                </FormItem>
                <FormItem>
                    <Grid>
                        <div>
                            <Button color="primary" icon="bar-chart" onClick={(e) => handleSubmit()}>
                                {t("Execute")}
                            </Button>
                        </div>
                        <div>
                            <Button color="secondary" icon="clear-all" onClick={() => clearForm()}>
                                {t("clear")}
                            </Button>
                        </div>
                    </Grid>
                </FormItem>
            </Form>
        </Panel>
    );
};

export default ReportFilterForm;
