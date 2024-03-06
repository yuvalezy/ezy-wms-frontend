import React, {useState} from "react";
import {Button, Form, FormItem, Input, TextArea} from "@ui5/webcomponents-react";
import {useTranslation} from "react-i18next";
import {createTransfer, Transfer} from "../Data/Transfer";
import {useThemeContext} from "../../../Components/ThemeContext";

interface TransferFormProps {
    onNewTransfer: (transfer: Transfer) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({onNewTransfer,}) => {
    const {t} = useTranslation();
    const [docNameInput, setDocNameInput] = useState<string>("");
    const [commentsInput, setCommentsInput] = useState<string>("");
    const {setLoading, setError} = useThemeContext();
    function create() {
        setLoading(true);
        try {
            createTransfer(docNameInput, commentsInput)
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
    return <Form>
        <FormItem label={t("id")}>
            <Input
                value={docNameInput}
                onInput={(e) => setDocNameInput(e.target.value as string)}
                maxlength={50}
            ></Input>
        </FormItem>
        <FormItem label={t("comment")}>
            <TextArea
                style={{minHeight: "100px", width: "100%"}}
                rows={5}
                value={commentsInput}
                onInput={(e) => setCommentsInput(e.target.value as string)}
            />
        </FormItem>
        <FormItem>
            <Button color="primary" icon="create" onClick={() => create()}>
                {t("create")}
            </Button>
        </FormItem>
    </Form>

};

export default TransferForm;
