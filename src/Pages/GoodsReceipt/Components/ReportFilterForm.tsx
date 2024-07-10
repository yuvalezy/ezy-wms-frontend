import React, {useEffect, useRef, useState} from "react";
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
    PanelDomRef, DatePicker,
} from "@ui5/webcomponents-react";
import {BusinessPartner, fetchVendors, useDocumentStatusOptions} from "../../../Assets/Data";
import {GoodsReceiptReportFilter} from "../Data/Document";

interface ReportFilterFormProps {
    onSubmit: (filters: GoodsReceiptReportFilter) => void;
    onClear: () => void;
}

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({onSubmit, onClear}) => {
    const [filters, setFilters] = useState<GoodsReceiptReportFilter>(newFilters())
    const [vendors, setVendors] = useState<BusinessPartner[]>([]);
    const {t} = useTranslation();
    const documentStatusOptions = useDocumentStatusOptions();
    const panelRef = useRef<PanelDomRef>(null);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [statusValue, setStatusValue] = useState<string>("");

    useEffect(() => {
        fetchVendors()
            .then((data) => {
                setVendors(data);
            })
            .catch((error) => {
                console.error("Error fetching vendors:", error);
            });
    }, []);

    function newFilters() : GoodsReceiptReportFilter {
        return {lastID: -1, pageSize: 10};
    }

    function clearForm() {
        setFilters(newFilters());
        setStatusValue("");
        onClear();
    }

    const handleSubmit = () => {
        setIsPanelCollapsed(true);
        onSubmit(filters);
    };

    function changeCardCode(name: string | null) {
        let businessPartner: BusinessPartner | null = null;
        if (name != null) {
            businessPartner = vendors.find((v) => v.name === name) || null;
        }
        setFilters((prevFilters) => {
            return {
                ...prevFilters,
                businessPartner: businessPartner?.code
            };
        });
    }

    return (
        <Panel
            collapsed={isPanelCollapsed}
            onToggle={() => setIsPanelCollapsed(!isPanelCollapsed)}
            ref={panelRef}
            headerText={t("filters")}
        >
            <Form>
                <FormItem label={t("vendor")}>
                    <ComboBox
                        value={filters.businessPartner != null ? vendors.find((v) => v.code === filters.businessPartner)?.name??"" : ""}
                        onSelectionChange={(e) => changeCardCode(e.detail.item.text)}
                    >
                        {vendors.map((vendor) => (
                            <ComboBoxItem key={vendor.code} text={vendor.name}/>
                        ))}
                    </ComboBox>
                </FormItem>
                <FormItem label={t("number")}>
                    <Input
                        value={filters.id != null ? filters.id.toString() : ""}
                        type="Number"
                        onChange={(e) => {
                            let value = e.target.value as string;
                            return setFilters((pf) => ({
                                ...pf,
                                id: value.length > 0 ? parseInt(value) : null
                            }));
                        }}
                    />
                </FormItem>
                <FormItem label={t("id")}>
                    <Input
                        value={filters.name??""}
                        onChange={(e) =>
                            setFilters((pf) => ({
                                ...pf,
                                name: e.target.value as string
                            }))}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={`${t("status")} - ${t("fromDate")}`}>
                    <DatePicker
                        value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ""}
                        primaryCalendarType="Gregorian"
                        onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setFilters((prevFilters) => ({
                                ...prevFilters,
                                dateFrom: newDate,
                            }));
                        }}
                    />
                </FormItem>
                <FormItem label={`${t("status")} - ${t("toDate")}`}>
                    <DatePicker
                        value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ""}
                        primaryCalendarType="Gregorian"
                        onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setFilters((prevFilters) => ({
                                ...prevFilters,
                                dateTo: newDate,
                            }));
                        }}
                    />
                </FormItem>
                <FormItem label={t("purchaseOrder")}>
                    <Input
                        value={filters.purchaseOrder}
                        type="Number"
                        onChange={(e) =>
                            setFilters((pf) => ({
                                ...pf,
                                purchaseOrder: e.target.value as string
                            }))}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={t("reservedInvoice")}>
                    <Input
                        value={filters.reservedInvoice}
                        type="Number"
                        onChange={(e) =>
                            setFilters((pf) => ({
                                ...pf,
                                reservedInvoice: e.target.value as string
                            }))}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={t("goodsReceipt")}>
                    <Input
                        value={filters.grpo}
                        type="Number"
                        onChange={(e) =>
                            setFilters((pf) => ({
                                ...pf,
                                grpo: e.target.value as string
                            }))}
                        maxlength={50}
                    />
                </FormItem>
                <FormItem label={t("status")}>
                    <ComboBox
                        value={statusValue}
                        onSelectionChange={(e) => {
                            setFilters((pf) => ({
                                ...pf,
                                status: [documentStatusOptions[ Array.from(e.target.children).indexOf(e.detail.item) ].status]
                            }))
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
