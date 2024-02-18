import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../Components/AppContext";
import ContentTheme from "../../Components/ContentTheme";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {MessageBox, MessageBoxActions, MessageStripDesign} from "@ui5/webcomponents-react";
import {StringFormat} from "../../Assets/Functions";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";
import CountingForm from "./Components/CountingForm";
import {countingAction, fetchCountings} from "./Data/Counting";
import {Counting} from "../../Assets/Counting";
import CountingCard from "./Components/CountingCard";
import {ObjectAction} from "../../Assets/Common";

export default function CountingSupervisor() {
    const qrRef = useRef<QRDialogRef>(null);
    const {user} = useAuth();
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [countings, setCountings] = useState<Counting[]>([]);
    const [selectedID , setSelectedID] = useState<number | null>(
        null
    );
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const errorAlert = (message: string) => setAlert({message: message, type: MessageStripDesign.Negative});

    useEffect(() => {
        setLoading(true);
        fetchCountings()
            .then((data) => {
                setCountings(data);
            })
            .catch((error) => {
                console.error(`Error fetching countings: ${error}`);
                errorAlert(`Error fetching countings: ${error}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAction = (docId: number, action: ObjectAction) => {
        setSelectedID(docId);
        setActionType(action);
        if (action !== "qrcode") {
            setDialogOpen(true);
        } else {
            qrRef?.current?.show(true);
        }
    };

    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        countingAction(selectedID!, actionType!, user!)
            .then(() => {
                setCountings((prev) =>
                    prev.filter((count) => count.id !== selectedID)
                );
                setAlert({message: actionType === "approve" ? t("approved") : t("cancelled"), type: MessageStripDesign.Positive});
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"];
                if (errorMessage) errorAlert(`SAP Error: ${errorMessage}`);
                else errorAlert(`Error performing action: ${error}`);
            })
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t("countingSupervisor")} icon="factory">
            <CountingForm
                onError={errorAlert}
                onNewCounting={(newCounting) =>
                    setCountings((prev) => [newCounting, ...prev])
                }
            />
            <br/>
            <br/>
            {countings.map((doc) => (
                <CountingCard key={doc.id} doc={doc} handleAction={handleAction}/>
            ))}
            <MessageBox
                onClose={(e) => {
                    if (e.detail.action === MessageBoxActions.OK) {
                        handleConfirmAction();
                        return;
                    }
                    setDialogOpen(false);
                }}
                open={dialogOpen}
                type="Confirm"

            >
                {StringFormat(
                    actionType === "approve"
                        ? t("confirmFinishDocument")
                        : t("confirmCancelDocument"),
                    selectedID
                )}
                <br /> {t('actionCannotReverse')}
            </MessageBox>
            <QRDialog ref={qrRef} prefix="CNT" id={selectedID}/>
        </ContentTheme>
    );
}
