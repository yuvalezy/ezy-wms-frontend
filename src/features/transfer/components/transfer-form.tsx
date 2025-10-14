import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useThemeContext, useAuth} from "@/components";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {PlusCircle, Warehouse} from "lucide-react";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {TransferFormSkeleton} from "./TransferFormSkeleton";

interface TransferFormProps {
    onNewTransfer: (transfer: TransferDocument) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({onNewTransfer,}) => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const [docNameInput, setDocNameInput] = useState<string>("");
    const [commentsInput, setCommentsInput] = useState<string>("");
    const [targetWhsCode, setTargetWhsCode] = useState<string>(user?.currentWarehouse || "");
    const {setError} = useThemeContext();
    const [isCreatingTransfer, setIsCreatingTransfer] = useState<boolean>(false);
    function create() {
        setIsCreatingTransfer(true);
        try {
            transferService.create(docNameInput, commentsInput, targetWhsCode !== user?.currentWarehouse ? targetWhsCode : undefined)
                .then((response) => {
                    onNewTransfer(response);
                    setDocNameInput('');
                    setCommentsInput('');
                    setTargetWhsCode(user?.currentWarehouse || "");
                })
                .catch((e) => {
                    setError(e);

                }).finally(() => setIsCreatingTransfer(false));
        } catch (e: any) {
            setError(e);
        }
    }
    // Prevent default form submission, call create function instead
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        create();
    };

    if (isCreatingTransfer) {
        return <TransferFormSkeleton />;
    }

    const enableWarehouseTransfer = user?.settings?.enableWarehouseTransfer ?? false;
    const warehouses = user?.warehouses || [];

    // Validation: if target warehouse is same as current warehouse and user doesn't have binLocations enabled, show error
    const isInvalidSelection = targetWhsCode === user?.currentWarehouse && !user?.binLocations;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow">
            <div className="space-y-2">
                <Label htmlFor="transferDocName">{t("id")}</Label>
                <Input
                    id="transferDocName"
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    maxLength={50}
                    placeholder={t("enterDocumentId") || "Enter Document ID"}
                />
            </div>
            {enableWarehouseTransfer && warehouses.length > 1 && (
                <div className="space-y-2">
                    <Label htmlFor="targetWarehouse" className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4" />
                        {t("targetWarehouse")}
                    </Label>
                    <Select value={targetWhsCode} onValueChange={setTargetWhsCode}>
                        <SelectTrigger id="targetWarehouse" className={isInvalidSelection ? "border-red-500" : ""}>
                            <SelectValue placeholder={t("selectTargetWarehouse")} />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses.map((whs) => (
                                <SelectItem key={whs.id} value={whs.id}>
                                    {whs.id} - {whs.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isInvalidSelection && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                            {t("mustSelectDifferentWarehouse")}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="transferComments">{t("comment")}</Label>
                <Textarea
                    id="transferComments"
                    rows={3}
                    value={commentsInput}
                    onChange={(e) => setCommentsInput(e.target.value)}
                    placeholder={t("enterCommentsHere") || "Enter comments here"}
                    className="w-full"
                />
            </div>
            <div>
                <Button type="submit" disabled={isInvalidSelection}>
                     <PlusCircle className="mr-2 h-4 w-4" />
                    {t("create")}
                </Button>
            </div>
        </form>
    );
};

export default TransferForm;
