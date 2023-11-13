import * as React from 'react';
import {Button, Input, Select, Option, Form, FormItem} from "@ui5/webcomponents-react";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";
import {useTranslation} from "react-i18next"; // Adjust the path based on your directory structure
import {useEffect} from "react";
import './LoginForm.css';
import {globalConfig} from "../../Assets/GlobalConfig";

type LoginFormProps = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({onSubmit}: LoginFormProps) {
    const {t, i18n} = useTranslation();

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
        <div className="loginBox">
            <div className="loginFormContainer">
                <div className="loginFormTitle">
                    {globalConfig?.companyName}
                </div>
                <div className="loginFormSubTitle">
                    {t('login')}
                </div>
                <Form onSubmit={onSubmit}>
                    {/* Form items here */}
                    <FormItem label={t('code')}>
                        <Input style={{width: '100%'}} required name="username" type="Password" />
                    </FormItem>
                    <FormItem label={t('language')}>
                        <Select style={{width: '100%'}} onChange={onLanguageChange}>
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
            </div>
        </div>
    );
}
