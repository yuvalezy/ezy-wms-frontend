import * as React from 'react';
import { Button, Input, Select, Option, Form, FormItem } from "@ui5/webcomponents-react";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";
import { useLoading } from "../../Components/LoadingContext";
import { useTranslation } from "react-i18next"; // Adjust the path based on your directory structure
import CircularProgressOverlay from '../../Components/CircularProgressOverlay';
import {useEffect} from "react";

type LoginFormProps = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const { t, i18n } = useTranslation();
    const { loading } = useLoading();

    const onLanguageChange = (event: CustomEvent) => {
        const language = event.detail.selectedOption.dataset.key;
        i18n.changeLanguage(language);
    };

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0]; // Gets the browser language
        const availableLanguages = ['en', 'es']; // Add more languages if you support them
        const defaultLang = 'en'; // Fallback language if browser language is not supported

        // If the browser language is in the list of available languages, use it, otherwise fallback to default
        const languageToSet = availableLanguages.includes(browserLang) ? browserLang : defaultLang;
        i18n.changeLanguage(languageToSet);
    }, []);

    return (
        <>
            {loading && <CircularProgressOverlay />}
            <Form onSubmit={onSubmit} style={{ width: '300px', margin: 'auto' }}>
                <FormItem>
                    &nbsp;
                </FormItem>
                <FormItem label={t('code')}>
                    <Input required name="username" type="Password" />
                </FormItem>
                <FormItem label={t('language')}>
                    <Select onChange={onLanguageChange}>
                        <Option selected={i18n.language === "en"} data-key="en">English</Option>
                        <Option selected={i18n.language === "es"} data-key="es">Español</Option>
                    </Select>
                </FormItem>
                <FormItem>
                    <Button design="Emphasized" type="Submit">
                        {t('enter')}
                    </Button>
                </FormItem>
            </Form>
        </>
    );
}
