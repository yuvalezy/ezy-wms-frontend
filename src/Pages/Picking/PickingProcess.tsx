import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useState} from "react";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChartBar } from '@fortawesome/free-solid-svg-icons';
import {IsNumeric} from "../../assets/Functions";
import {fetchPicking, PickingDocument, PickingDocumentDetail} from "./Data/PickingDocument";
import {useObjectName} from "../../assets/ObjectName";

export default function PickingProcess() {
    const {idParam} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const {setLoading, setError} = useThemeContext();
    const [picking, setPicking] = useState<PickingDocument | null>(null);
    const o = useObjectName();
    const navigate = useNavigate();

    const title = `${t("picking")} #${idParam}`;

    useEffect(() => {
        if (idParam === null || idParam === undefined || !IsNumeric(idParam)) {
            setID(null);
            return;
        }
        let id = parseInt(idParam);
        setID(id);

        setLoading(true);
        fetchPicking({id})
            .then(value => {
                if (value == null) {
                    setPicking(null);
                    setError(t("pickingNotFound"))
                    return;
                }
                setPicking(value);
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }, []);

    function handleOpen(detail: PickingDocumentDetail) {
        navigate(`/pick/${id}/${detail.type}/${detail.entry}`);
    }

    function rowStyle(item: PickingDocumentDetail) : CSSProperties {
        let properties = {} as CSSProperties;
        if (item.totalOpenItems === 0) {
            properties.textDecoration = 'line-through';
        }
        return properties;
    }

    return (
        <ContentTheme title={title}>
            {picking?.detail?.map((item, index) => (
                <Panel key={index} headerText={`${o(item.type)}# ${item.number}`} style={rowStyle(item)}>
                    <Title level="H5">
                        <strong>{t("customer")}: </strong>
                        {item.cardCode} - {item.cardName}
                    </Title>
                    <div>
                        <Text>
                            <strong>{t("totalItems")}: </strong>
                            {item.totalItems}
                        </Text>
                    </div>
                    <div>
                        <Text>
                            <strong>{t("totalOpenItems")}: </strong>
                            {item.totalOpenItems}
                        </Text>
                    </div>
                    <div>
                        <ProgressIndicator
                            value={100 - item.totalOpenItems * 100 / item.totalItems}
                        />
                    </div>
                    <div style={{textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                        {item.totalOpenItems > 0 &&
                        <Button icon="begin" onClick={() => handleOpen(item)}>
                            {t("process")}
                        </Button>
                        }
                        {item.totalOpenItems === 0 &&
                            <Button design="Attention" icon="manager-insight" onClick={() => handleOpen(item)}>
                                {t("report")}
                            </Button>
                        }
                    </div>
                </Panel>
            ))}
        </ContentTheme>
    );
}
