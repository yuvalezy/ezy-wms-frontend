import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {BusinessPartner, fetchVendors, useDocumentStatusOptions} from "@/assets/Data";
import {GoodsReceiptReportFilter} from "@/pages/GoodsReceipt/data/Document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar"; // For DatePicker
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // For DatePicker
import { cn } from "@/lib/utils"; // For DatePicker
import { format } from "date-fns"; // For DatePicker
import { CalendarIcon, BarChart2, Eraser } from "lucide-react";

interface ReportFilterFormProps {
    onSubmit: (filters: GoodsReceiptReportFilter) => void;
    onClear: () => void;
}

const ReportFilterForm: React.FC<ReportFilterFormProps> = ({onSubmit, onClear}) => {
    const [filters, setFilters] = useState<GoodsReceiptReportFilter>(newFilters())
    const [vendors, setVendors] = useState<BusinessPartner[]>([]);
    const {t} = useTranslation();
    const documentStatusOptions = useDocumentStatusOptions();
    const [isPanelOpen, setIsPanelOpen] = useState(true); // Control accordion state
    const [statusValue, setStatusValue] = useState<string>("");
    const [vendorName, setVendorName] = useState<string>("");
    const [isDateFromPopoverOpen, setIsDateFromPopoverOpen] = useState(false);
    const [isDateToPopoverOpen, setIsDateToPopoverOpen] = useState(false);


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
        setIsPanelOpen(false); // Collapse accordion on submit
        onSubmit(filters);
    };

    const handleVendorChange = (value: string) => { // value is string from Select
        const selectedVendor = vendors.find((v) => v.code === value);
        setVendorName(selectedVendor?.name || "");
        setFilters((prevFilters) => ({
            ...prevFilters,
            businessPartner: selectedVendor?.code,
        }));
    };
    
    const handleStatusChange = (value: string) => {
        const selectedOption = documentStatusOptions.find(opt => opt.code === value);
        setStatusValue(selectedOption?.name || "");
        setFilters((prevFilters) => ({
            ...prevFilters,
            status: selectedOption ? [selectedOption.status] : undefined,
        }));
    };

    return (
        <Accordion type="single" collapsible className="w-full mb-4" value={isPanelOpen ? "filters-panel" : ""} onValueChange={(value: string) => setIsPanelOpen(value === "filters-panel")}>
            <AccordionItem value="filters-panel">
                <AccordionTrigger className="text-lg font-semibold">{t("filters")}</AccordionTrigger>
                <AccordionContent>
                    <form className="space-y-4 p-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="vendor">{t("vendor")}</Label>
                                <Select value={filters.businessPartner || ""} onValueChange={handleVendorChange}>
                                    <SelectTrigger id="vendor">
                                        <SelectValue placeholder={t("selectVendorPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendors.map((vendor) => (
                                            <SelectItem key={vendor.code} value={vendor.code}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="docNumber">{t("number")}</Label>
                                <Input
                                    id="docNumber"
                                    value={filters.id != null ? filters.id.toString() : ""}
                                    type="number"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFilters((pf) => ({ ...pf, id: val ? parseInt(val) : null }));
                                    }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="docId">{t("id")}</Label>
                                <Input
                                    id="docId"
                                    value={filters.name ?? ""}
                                    onChange={(e) => setFilters((pf) => ({ ...pf, name: e.target.value }))}
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateFrom">{`${t("status")} - ${t("fromDate")}`}</Label>
                                <Popover open={isDateFromPopoverOpen} onOpenChange={setIsDateFromPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>{t("pickADate")}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateFrom || undefined}
                                            onSelect={(date: Date | undefined) => {
                                                setFilters(pf => ({...pf, dateFrom: date || null}));
                                                setIsDateFromPopoverOpen(false); // Close popover on date selection
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="dateTo">{`${t("status")} - ${t("toDate")}`}</Label>
                                 <Popover open={isDateToPopoverOpen} onOpenChange={setIsDateToPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateTo ? format(filters.dateTo, "PPP") : <span>{t("pickADate")}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateTo || undefined}
                                            onSelect={(date: Date | undefined) => {
                                                setFilters(pf => ({...pf, dateTo: date || null}));
                                                setIsDateToPopoverOpen(false); // Close popover on date selection
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="purchaseOrder">{t("purchaseOrder")}</Label>
                                <Input
                                    id="purchaseOrder"
                                    value={filters.purchaseOrder ?? ""}
                                    type="number"
                                    onChange={(e) => setFilters((pf) => ({ ...pf, purchaseOrder: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="reservedInvoice">{t("reservedInvoice")}</Label>
                                <Input
                                    id="reservedInvoice"
                                    value={filters.reservedInvoice ?? ""}
                                    type="number"
                                    onChange={(e) => setFilters((pf) => ({ ...pf, reservedInvoice: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="goodsReceipt">{t("goodsReceipt")}</Label>
                                <Input
                                    id="goodsReceipt"
                                    value={filters.grpo ?? ""}
                                    type="number"
                                    onChange={(e) => setFilters((pf) => ({ ...pf, grpo: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">{t("status")}</Label>
                                <Select value={filters.status && filters.status.length > 0 ? documentStatusOptions.find(opt => opt.status === filters.status![0])?.code || "" : ""} onValueChange={handleStatusChange}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder={t("selectStatusPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentStatusOptions.map((option) => (
                                            <SelectItem key={option.code} value={option.code}>
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={clearForm}>
                                <Eraser className="mr-2 h-4 w-4" />{t("clear")}
                            </Button>
                            <Button type="button" onClick={handleSubmit}>
                                <BarChart2 className="mr-2 h-4 w-4" />{t("Execute")}
                            </Button>
                        </div>
                    </form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ReportFilterForm;
