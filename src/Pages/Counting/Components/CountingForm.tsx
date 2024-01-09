import React, {useState} from "react";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {
    Button,
    Form,
    FormItem, Input, MessageStripDesign,


} from "@ui5/webcomponents-react";
import {useObjectName} from "../../../Assets/ObjectName";
import {createCounting} from "../Data/Counting";
import {Counting} from "../../../Assets/Counting";

interface CountingFormProps {
    onNewCounting: (document: Counting) => void;
    onError: (errorMessage: string) => void;
}

const CountingForm: React.FC<CountingFormProps> = ({onNewCounting, onError,}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const {setLoading, setAlert} = useThemeContext();
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
                    setAlert({message: errorMessage, type: MessageStripDesign.Negative});
                })
                .catch((e) => {
                    console.error(`Error creating counting: ${e}`);
                    onError(`Error creating counting: ${e.message}`);
                })
                .finally(() => setLoading(false));
        } catch (e: any) {
            onError(`Error creating document: ${e.message}`);
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
