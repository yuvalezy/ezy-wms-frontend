import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {MouseEventHandler, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Grid, Icon, Input, InputDomRef, MessageStrip, MessageStripDesign} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {checkIsComplete} from "./Data/Transfer";

export default function TransferProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [enableFinish, setEnableFinish] = useState(false);
    const {setLoading, setAlert} = useThemeContext();

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
            .catch((error) => setAlert({type: MessageStripDesign.Negative, message: error.message}))
            .finally(() => setLoading(false));
    }, []);


    function finish() {
        if (!enableFinish)
            return;
        if (window.confirm(t("AreYouSure"))) {
            // setLoading(true);
            // fetch(`/api/transfer/finish/${id}`, {
            //     method: 'POST',
            // }).then(res => {
            //     if (res.ok) {
            //         setAlert({
            //             type: 'success',
            //             title: t('Success'),
            //             message: t('TransferFinished')
            //         });
            //     } else {
            //         setAlert({
            //             type: 'error',
            //             title: t('Error'),
            //             message: t('TransferFinishedError')
            //         });
            //     }
            //     setLoading(false);
            // });
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
