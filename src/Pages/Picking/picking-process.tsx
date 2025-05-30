import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useState} from "react";
import {
  Card, CardContent, CardFooter, CardHeader, FullInfoBox,
  InfoBoxValue,
  Progress, SecondaryInfoBox,
  useThemeContext
} from "@/components";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {IsNumeric} from "@/assets";
import {fetchPicking, PickingDocument, PickingDocumentDetail} from "@/pages/picking/data/picking-document";
import {useObjectName} from "@/assets";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartBar, faPlay} from "@fortawesome/free-solid-svg-icons";
import InfoBox from "@/components/InfoBox";
import {formatNumber} from "@/lib/utils";

export default function PickingProcess() {
  const {idParam} = useParams();
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const {setLoading, setError} = useThemeContext();
  const [picking, setPicking] = useState<PickingDocument | null>(null);
  const o = useObjectName();
  const navigate = useNavigate();

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

  return (
    <ContentTheme title={t("picking")}
                  titleOnClick={() => navigate("/pick")}
                  titleBreadcrumbs={[{label: `${idParam}`}]}
    >
      <div className="contentStyle">
        {picking?.detail?.map((item, index) => {
          const progressValue = 100 - item.totalOpenItems * 100 / item.totalItems;
          return (
            <>
              <Card key={index}>
                <CardHeader>
                  {`${o(item.type)}# ${item.number}`}
                </CardHeader>
                <CardContent>
                  <FullInfoBox>
                    <InfoBoxValue label={t("customer")} value={`${item.cardCode} - ${item.cardName}`}></InfoBoxValue>
                  </FullInfoBox>
                  <SecondaryInfoBox>
                    <InfoBoxValue label={t("totalItems")} value={item.totalItems}></InfoBoxValue>
                    <InfoBoxValue label={t("totalOpenItems")} value={item.totalOpenItems}></InfoBoxValue>
                  </SecondaryInfoBox>
                  <ul className="space-y-2 text-sm">
                    <li className="pt-2">
                      <Progress
                        value={progressValue}
                      />
                      <p
                        className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressValue, 0)}% {t('progress')}</p>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
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
                </CardFooter>
              </Card>
            </>
          );
        })}</div>
    </ContentTheme>
  );
}
