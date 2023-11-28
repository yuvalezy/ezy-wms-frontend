import ContentTheme from "../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Icon, Panel, Title, Text} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {IsNumeric} from "../Assets/Functions";
import {fetchPicking, fetchPickings, PickingDocument, PickingDocumentDetail} from "./PickSupervisor/PickingDocument";
import {useObjectName} from "../Assets/ObjectName";

export default function PickingProcess() {
    const {idParam} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const {setLoading, setAlert} = useThemeContext();
    const [picking, setPicking] = useState<PickingDocument | null>(null);
    const o = useObjectName();
    const navigate = useNavigate();

    const title = `${t("picking")} #${idParam}`;

    function errorAlert(message: string) {
        setAlert({message: message, type: MessageStripDesign.Negative})
    }

    useEffect(() => {
        if (idParam === null || idParam === undefined || !IsNumeric(idParam)) {
            setID(null);
            return;
        }
        let id = parseInt(idParam);
        setID(id);

        setLoading(true);
        fetchPicking(id)
            .then(value => {
                if (value == null) {
                    setPicking(null);
                    errorAlert(t("pickingNotFound"))
                    return;
                }
                setPicking(value);
            })
            .catch(error => errorAlert(error))
            .finally(() => setLoading(false));
    }, []);

    function handleOpen(detail: PickingDocumentDetail) {
        navigate(`/pick/${id}/${detail.type}/${detail.entry}`);
    }

    return (
        <ContentTheme title={title} icon="cause">
            {picking?.detail?.map((item, index) => (
                <Panel key={index} headerText={`${o(item.type)}# ${item.number}`}>
                    <Title level="H5">
                        <strong>{t("customer")}: </strong>
                        {item.cardCode} - {item.cardName}
                    </Title>
                    <Text>
                        <strong>{t("totalItems")}: </strong>
                        {item.totalItems}
                    </Text>
                    <div style={{textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                        <Button color="primary" onClick={() => handleOpen(item)}>
                            <Icon name="begin"/>
                            {t("start")}
                        </Button>
                    </div>
                </Panel>
            ))}
        </ContentTheme>
    );
}
