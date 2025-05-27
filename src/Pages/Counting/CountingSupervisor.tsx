import React, {useEffect, useState} from "react";
import {useAuth} from "@/components/AppContext";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MessageStripDesign} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {StringFormat} from "@/Assets/Functions";
import CountingForm from "./Components/CountingForm";
import {countingAction, fetchCountings} from "./Data/Counting";
import {Counting} from "@/Assets/Counting";
import CountingCard from "./Components/CountingCard";
import {ObjectAction} from "@/Assets/Common";

export default function CountingSupervisor() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const {setLoading, setAlert, setError} = useThemeContext();
    const [countings, setCountings] = useState<Counting[]>([]);
    const [selectedID , setSelectedID] = useState<number | null>(
        null
    );
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchCountings()
            .then((data) => {
                setCountings(data);
            })
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);

    const handleAction = (docId: number, action: ObjectAction) => {
        setSelectedID(docId);
        setActionType(action);
        if (action !== "qrcode") {
            setDialogOpen(true);
        } else {
          console.error('qr discontinued');
            // qrRef?.current?.show(true);
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
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t("countingSupervisor")} icon="factory">
            <CountingForm
                onNewCounting={(newCounting) =>
                    setCountings((prev) => [newCounting, ...prev])
                }
            />
            <br/>
            <br/>
            {countings.map((doc) => (
                <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={handleAction}/>
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
        </ContentTheme>
    );
}
