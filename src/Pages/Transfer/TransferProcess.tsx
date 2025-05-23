import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {
    FlexBox,
    Icon,
    MessageStrip,
    MessageStripDesign,
    FlexBoxDirection,
    FlexBoxJustifyContent
} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {getProcessInfo, transferAction} from "./Data/TransferDocument";

export default function TransferProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [info, setInfo] = useState<{isComplete: boolean, comments: string | null}>({isComplete: false, comments: null});
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
        getProcessInfo(value)
            .then((result) => setInfo(result))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);


    function finish() {
        if (!info.isComplete || id == null)
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

    function finishButtonClasses(): string {
        let classNames = "homeMenuItemLink";
        if (!info.isComplete) {
            classNames += " disabled-div";
        }
        return classNames;
    }

    return (
        <ContentTheme title={title} icon="cause">
            {id &&
              <>
                  <FlexBox direction={FlexBoxDirection.Column} justifyContent={FlexBoxJustifyContent.Start}
                           style={{gap: '1rem'}}>
                      <Link to={`/transfer/${id}/source`} key="0" style={{textDecoration: 'none'}}>
                          <div className="homeMenuItem">
                              <Icon design="NonInteractive" name="functional-location" className="homeMenuItemIcon"/>
                              <span>{t("selectTransferSource")}</span>
                          </div>
                      </Link>
                      <Link to={`/transfer/${id}/targetBins`} key="1" style={{textDecoration: 'none'}}>
                          <div className="homeMenuItem">
                              <Icon design="NonInteractive" name="map" className="homeMenuItemIcon"/>
                              <span>{t("selectTransferTargetBins")}</span>
                          </div>
                      </Link>
                      {/*<Link to={`/transfer/${id}/targetItems`} key="1" className="homeMenuItemLink">*/}
                      {/*    <div className="homeMenuItem">*/}
                      {/*        <Icon design="NonInteractive" name="map" className="homeMenuItemIcon"/>*/}
                      {/*        <span>{t("selectTransferTargetItems")}</span>*/}
                      {/*    </div>*/}
                      {/*</Link>*/}
                      <div onClick={() => finish()} key="btnFinish" className={finishButtonClasses()}
                           style={{cursor: info.isComplete ? 'pointer' : 'not-allowed'}}>
                          <div className="homeMenuItem">
                              <Icon design="NonInteractive" name="accept" className="homeMenuItemIcon"/>
                              <span>{t("finish")}</span>
                          </div>
                      </div>
                  </FlexBox>
                  {info.comments &&
                    <MessageStrip
                      design={MessageStripDesign.Information}
                    >
                        <strong>{t('comments')}: </strong>{info.comments}
                    </MessageStrip>
                  }
              </>
            }
        </ContentTheme>
    );
}
