import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {MouseEventHandler, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Grid, Icon, Input, InputDomRef, MessageStrip, MessageStripDesign} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {checkIsComplete, transferAction} from "./Data/Transfer";

export default function TransferProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [enableFinish, setEnableFinish] = useState(false);
    const {setLoading, setAlert, setError} = useThemeContext();

    const title = `${t("transfer")} #${scanCode}`;

    useEffect(() => {
        setLoading(true);
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        let value = parseInt(scanCode);
        setID(value);
        checkIsComplete(value)
            .then((isComplete) => setEnableFinish(isComplete))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);


    function finish() {
        if (!enableFinish || id == null)
            return;
        if (window.confirm(StringFormat(t("createTransferConfirm"), id))) {
            setLoading(true);
            transferAction(id, "approve")
                .then(() => {
                    setAlert({message: t("transferApproved"), type: MessageStripDesign.Positive});
                })
                .catch((error) => {
                    setError(error);
                })
                .finally(() => setLoading(false));
        }
    }

    function finishButtonClasses() : string {
        let classNames = "homeMenuItemLink";
        if (!enableFinish) {
            classNames += " disabled-div";
        }
        return classNames;
    }

    return (
        <ContentTheme title={title} icon="cause">
            {id &&
                <Grid>
                    <Link to={`/transfer/${id}/source`} key="0" className="homeMenuItemLink">
                        <div className="homeMenuItem">
                            <Icon design="NonInteractive" name="functional-location" className="homeMenuItemIcon"/>
                            <span>{t("selectTransferSource")}</span>
                        </div>
                    </Link>
                    <Link to={`/transfer/${id}/target`} key="1" className="homeMenuItemLink">
                        <div className="homeMenuItem">
                            <Icon design="NonInteractive" name="map" className="homeMenuItemIcon"/>
                            <span>{t("selectTransferTarget")}</span>
                        </div>
                    </Link>
                    <div onClick={() => finish()} key="customAction" className={finishButtonClasses()} style={{cursor: 'pointer'}}>
                        <div className="homeMenuItem">
                            <Icon design="NonInteractive" name="accept" className="homeMenuItemIcon"/>
                            <span>{t("finish")}</span>
                        </div>
                    </div>
                </Grid>
            }
        </ContentTheme>
    );
}
