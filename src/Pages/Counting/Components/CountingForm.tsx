import React, {useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {createCounting} from "../Data/Counting";
import {Counting} from "@/Assets/Counting";
import { PlusCircle } from "lucide-react";

interface CountingFormProps {
    onNewCounting: (document: Counting) => void;
}

const CountingForm: React.FC<CountingFormProps> = ({onNewCounting,}) => {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [docNameInput, setDocNameInput] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // if (docNameInput === null || docNameInput === "") {
        //     toast.warning(t("idRequired")); // Changed alert to toast
        //     return;
        // }
        setLoading(true);
        try {
            createCounting(docNameInput)
                .then((response) => {
                    if (!response.error) {
                        onNewCounting(response);
                        setDocNameInput("");
                        return;
                    }
                    let errorMessage: string = t("unknownError");
                    //if needed specific code, look into Document.ts to copy structure from createDocument
                    setError(errorMessage); // setError will now use toast.error
                })
                .catch((e) => setError(e))
                .finally(() => setLoading(false));
        } catch (e: any) {
            setError(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow">
            <div className="space-y-2">
                <Label htmlFor="docNameInput">{t("id")}</Label>
                <Input
                    id="docNameInput"
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    maxLength={50}
                    placeholder={t("enterDocumentId") || "Enter Document ID"}
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

export default CountingForm;
