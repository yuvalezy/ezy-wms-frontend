import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {fetchPickings, PickingDocument, processPicking} from "./Data/PickingDocument";
import PickingCard from "./Components/PickingCard";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {MessageStrip, MessageStripDesign} from "@ui5/webcomponents-react";
import {StringFormat} from "../../Assets/Functions";

export default function PickingSupervisor() {
    const {t} = useTranslation();
    const [pickings, setPickings] = useState<PickingDocument[]>([]);
    const [selectedPickEntry, setSelectedPickEntry] = useState<number>(-1);
    const qrRef = useRef<QRDialogRef>(null);
    const {setLoading, setAlert, setError} = useThemeContext();
    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        setLoading(true);
        fetchPickings()
            .then(values => setPickings(values))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }

    function handleAction(picking: PickingDocument, action: 'qrcode') {
        setSelectedPickEntry(picking.entry);
        qrRef?.current?.show(true);
    }

    function handleUpdatePick(picking: PickingDocument) {
        if (picking.openQuantity > 0 && !window.confirm(StringFormat(t('pickOpenQuantityAlert'), picking.entry) + '\n' + t('confirmContinue'))) {
            return;
        }
        setLoading(true);
        processPicking(picking.entry)
            .then(() => {
                setAlert({message: StringFormat(t("pickingUpdateSuccess"), picking.entry), type: MessageStripDesign.Positive})
                loadData();
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    return (
        <ContentTheme title={t("pickSupervisor")} icon="kpi-managing-my-area">
            {pickings.map((pick) => (
                <PickingCard key={pick.entry} picking={pick} onAction={handleAction} onUpdatePick={handleUpdatePick}/>
            ))}
            {pickings.length === 0 &&
                <div style={{padding: '10px'}}>
                    <MessageStrip hideCloseButton design={MessageStripDesign.Information}>
                        {t("nodata")}
                    </MessageStrip>
                </div>
            }
            <QRDialog ref={qrRef} prefix="PCK" id={selectedPickEntry}/>
        </ContentTheme>
    );
}