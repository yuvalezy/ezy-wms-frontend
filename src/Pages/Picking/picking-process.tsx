import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router";
import React, {CSSProperties, useEffect, useState} from "react";
import {
  Card, CardContent, CardFooter, CardHeader, FullInfoBox,
  InfoBoxValue,
  Progress, SecondaryInfoBox,
  useThemeContext
} from "@/components";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {BarChart3, Play} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatNumber, IsNumeric} from "@/utils/number-utils";
import {PickingDocument, PickingDocumentDetail} from "@/features/picking/data/picking";
import { useObjectName } from "@/hooks/useObjectName";
import {pickingService} from "@/features/picking/data/picking-service";
import {Skeleton} from "@/components/ui/skeleton";

export default function PickingProcess() {
  const {idParam} = useParams();
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const {setLoading, setError} = useThemeContext();
  const [picking, setPicking] = useState<PickingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    pickingService.fetchPicking({id})
      .then(value => {
        if (value == null) {
          setPicking(null);
          setError(t("pickingNotFound"))
          return;
        }
        setPicking(value);
      })
      .catch(error => setError(error))
      .finally(() => {
        setLoading(false);
        setIsLoading(false);
      });
  }, []);

  function handleOpen(detail: PickingDocumentDetail) {
    navigate(`/pick/${id}/${detail.type}/${detail.entry}`);
  }

  // Skeleton components
  const ProcessMobileCardSkeleton = () => (
    <Card className="mb-4" aria-label="Loading...">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );

  const ProcessTableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('type')}</TableHead>
          <TableHead>{t('number')}</TableHead>
          <TableHead>{t('customer')}</TableHead>
          <TableHead className="text-right">{t('totalItems')}</TableHead>
          <TableHead className="text-right">{t('totalOpenItems')}</TableHead>
          <TableHead>{t('progress')}</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-8" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-8" /></TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ContentTheme title={t("picking")}
                  titleOnClick={() => navigate("/pick")}
                  titleBreadcrumbs={[{label: `${idParam}`}]}
    >
      <div className="contentStyle">
        {isLoading ? (
          <>
            {/* Mobile view - Card skeletons */}
            <div className="block sm:hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProcessMobileCardSkeleton key={index} />
              ))}
            </div>

            {/* Desktop view - Table skeleton */}
            <div className="hidden sm:block">
              <ProcessTableSkeleton />
            </div>
          </>
        ) : picking?.detail && (
          <>
            {/* Mobile view - Cards */}
            <div className="block sm:hidden">
              {picking.detail.map((item, index) => {
                const progressValue = 100 - item.totalOpenItems * 100 / item.totalItems;
                return (
                  <Card key={index}>
                    <CardHeader>
                      {`${o(item.type)}# ${item.number}`}
                    </CardHeader>
                    <CardContent>
                      <FullInfoBox>
                        <InfoBoxValue label={t("customer")} value={`${item.cardCode} - ${item.cardName}`}></InfoBoxValue>
                        <InfoBoxValue label={t("totalItems")} value={item.totalItems}></InfoBoxValue>
                        <InfoBoxValue label={t("totalOpenItems")} value={item.totalOpenItems}></InfoBoxValue>
                      </FullInfoBox>
                      <ul className="space-y-2 text-sm">
                        <li className="pt-2">
                          <Progress value={progressValue} />
                          <p className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressValue, 0)}% {t('progress')}</p>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
                      {item.totalOpenItems > 0 &&
                          <Button className="flex items-center gap-2" onClick={() => handleOpen(item)}>
                              <Play className="h-4 w-4"/>
                            {t("process")}
                          </Button>
                      }
                      {item.totalOpenItems === 0 &&
                          <Button variant="outline" className="flex items-center gap-2"
                                  onClick={() => handleOpen(item)}>
                              <BarChart3 className="h-4 w-4"/>
                            {t("report")}
                          </Button>
                      }
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('number')}</TableHead>
                    <TableHead>{t('customer')}</TableHead>
                    <TableHead className="text-right">{t('totalItems')}</TableHead>
                    <TableHead className="text-right">{t('totalOpenItems')}</TableHead>
                    <TableHead>{t('progress')}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picking.detail.map((item, index) => {
                    const progressValue = 100 - item.totalOpenItems * 100 / item.totalItems;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{o(item.type)}</TableCell>
                        <TableCell>{item.number}</TableCell>
                        <TableCell>{`${item.cardCode} - ${item.cardName}`}</TableCell>
                        <TableCell className="text-right">{item.totalItems}</TableCell>
                        <TableCell className="text-right">{item.totalOpenItems}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={progressValue} className="w-20" />
                            <span className="text-xs">{formatNumber(progressValue, 0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.totalOpenItems > 0 &&
                                <Button size="sm" className="flex items-center gap-2" onClick={() => handleOpen(item)}>
                                    <Play className="h-3 w-3"/>
                                  {t("process")}
                                </Button>
                            }
                            {item.totalOpenItems === 0 &&
                                <Button variant="outline" size="sm" className="flex items-center gap-2"
                                        onClick={() => handleOpen(item)}>
                                    <BarChart3 className="h-3 w-3"/>
                                  {t("report")}
                                </Button>
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}</div>
    </ContentTheme>
  );
}
