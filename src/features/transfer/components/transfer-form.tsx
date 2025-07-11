import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";

interface TransferFormProps {
    onNewTransfer: (transfer: TransferDocument) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({onNewTransfer,}) => {
    const {t} = useTranslation();
    const [docNameInput, setDocNameInput] = useState<string>("");
    const [commentsInput, setCommentsInput] = useState<string>("");
    const {setLoading, setError} = useThemeContext();
    function create() {
        setLoading(true);
        try {
            transferService.create(docNameInput, commentsInput)
                .then((response) => {
                    onNewTransfer(response);
                    setDocNameInput('');
                    setCommentsInput('');
                })
                .catch((e) => {
                    setError(e);

                }).finally(() => setLoading(false));
        } catch (e: any) {
            setError(e);
        }
    }
    // Prevent default form submission, call create function instead
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        create();
    };

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
                <Button type="submit">
                     <PlusCircle className="mr-2 h-4 w-4" />
                    {t("create")}
                </Button>
            </div>
        </form>
    );
};

export default TransferForm;
