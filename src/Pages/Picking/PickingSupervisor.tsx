import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {fetchPickings, PickingDocument} from "./Data/PickingDocument";
import PickingCard from "./Components/PickingCard";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {MessageStripDesign} from "@ui5/webcomponents-react";

export default function PickingSupervisor() {
    const {t} = useTranslation();
    const [pickings, setPickings] = useState<PickingDocument[]>([]);
    const [selectedPickEntry, setSelectedPickEntry] = useState<number>(-1);
    const qrRef = useRef<QRDialogRef>(null);
    const {setLoading, setAlert} = useThemeContext();
    const errorAlert = (message: string) => setAlert({message: message, type: MessageStripDesign.Negative});

    useEffect(() => {
        setLoading(true);
        fetchPickings()
            .then(values => {
                setPickings(values);
            })
            .catch((error) => {
                console.error(`Error fetching documents: ${error}`);
                errorAlert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleAction(picking: PickingDocument, action: 'qrcode') {
        setSelectedPickEntry(picking.entry);
        qrRef?.current?.show(true);
    }

    function handleQRClose() {
        qrRef?.current?.show(false);
    }

    return (
        <ContentTheme title={t("pickSupervisor")} icon="kpi-managing-my-area">
            {pickings.map((pick) => (
                <PickingCard key={pick.entry} picking={pick} handleAction={handleAction}/>
            ))}
            <QRDialog ref={qrRef} onClose={handleQRClose} prefix="PCK" id={selectedPickEntry}/>
        </ContentTheme>
    );
}