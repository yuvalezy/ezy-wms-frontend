import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {MouseEventHandler, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Grid, Icon, Input, InputDomRef, MessageStrip} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";

export default function TransferProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const {setLoading, setAlert} = useThemeContext();

    const title = `${t("transfer")} #${scanCode}`;

    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));
    }, []);


    function finish() {
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

    return (
        <ContentTheme title={title} icon="cause">
            {id &&
                <Grid>
                    <Link to={`/transfer/${id}/source`} key="0" className="homeMenuItemLink">
                        <div className="homeMenuItem">
                            <Icon design="NonInteractive" name="functional-location" className="homeMenuItemIcon"/>
                            <span>{t("selectSourceBin")}</span>
                        </div>
                    </Link>
                    <Link to={`/transfer/${id}/target`} key="1" className="homeMenuItemLink">
                        <div className="homeMenuItem">
                            <Icon design="NonInteractive" name="map" className="homeMenuItemIcon"/>
                            <span>{t("selectTargetBin")}</span>
                        </div>
                    </Link>
                    <div onClick={() => finish()} key="customAction" className="homeMenuItemLink" style={{cursor: 'pointer'}}>
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
