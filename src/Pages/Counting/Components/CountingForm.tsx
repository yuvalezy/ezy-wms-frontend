import React, {useState} from "react";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input,} from "@ui5/webcomponents-react";
import {createCounting} from "../Data/Counting";
import {Counting} from "../../../Assets/Counting";

interface CountingFormProps {
    onNewCounting: (document: Counting) => void;
}

const CountingForm: React.FC<CountingFormProps> = ({onNewCounting,}) => {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [docNameInput, setDocNameInput] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (docNameInput === null || docNameInput === "") {
            alert(t("idRequired"));
            return;
        }
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
                    setError(errorMessage);
                })
                .catch((e) => setError(e))
                .finally(() => setLoading(false));
        } catch (e: any) {
            setError(e);
        }
    };

    return (
        <Form>
            <FormItem label={t("id")}>
                <Input
                    value={docNameInput}
                    onInput={(e) => setDocNameInput(e.target.value as string)}
                    maxlength={50}
                ></Input>
            </FormItem>
            <FormItem>
                <Button color="primary" icon="create" onClick={handleSubmit}>
                    {t("create")}
                </Button>
            </FormItem>
        </Form>
    );
};

export default CountingForm;
