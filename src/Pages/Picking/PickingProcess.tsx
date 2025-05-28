import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useState} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  InfoBoxValue,
  Progress,
  useThemeContext
} from "@/components";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {IsNumeric} from "@/assets";
import {fetchPicking, PickingDocument, PickingDocumentDetail} from "@/pages/Picking/data/PickingDocument";
import {useObjectName} from "@/assets";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartBar, faPlay} from "@fortawesome/free-solid-svg-icons";
import InfoBox from "@/components/InfoBox";

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

  function rowStyle(item: PickingDocumentDetail): CSSProperties {
    let properties = {} as CSSProperties;
    if (item.totalOpenItems === 0) {
      properties.textDecoration = 'line-through';
    }
    return properties;
  }

  return (
    <ContentTheme title={title}>
      {picking?.detail?.map((item, index) => (
        <Accordion type="single" collapsible key={index}>
          <AccordionItem value={`item-${index}`}>
            <AccordionTrigger style={rowStyle(item)}>
              {`${o(item.type)}# ${item.number}`}
            </AccordionTrigger>
            <AccordionContent>
              <InfoBox>
                <InfoBoxValue label={t("customer")} value={`${item.cardCode} - ${item.cardName}`}></InfoBoxValue>
                <InfoBoxValue label={t("totalItems")} value={item.totalItems}></InfoBoxValue>
                <InfoBoxValue label={t("totalOpenItems")} value={item.totalOpenItems}></InfoBoxValue>
              </InfoBox>
              <Progress
                value={100 - item.totalOpenItems * 100 / item.totalItems}
              />
              <div style={{textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>
                {item.totalOpenItems > 0 &&
                    <Button className="flex items-center gap-2" onClick={() => handleOpen(item)}>
                        <FontAwesomeIcon icon={faPlay} className="h-4 w-4"/>
                      {t("process")}
                    </Button>
                }
                {item.totalOpenItems === 0 &&
                    <Button variant="outline" className="flex items-center gap-2"
                            onClick={() => handleOpen(item)}>
                        <FontAwesomeIcon icon={faChartBar} className="h-4 w-4"/>
                      {t("report")}
                    </Button>

                }
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>))}
    </ContentTheme>
  );
}
