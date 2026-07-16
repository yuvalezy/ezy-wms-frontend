import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {BarChart3, ChevronRight} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {reportService} from "@/features/reports/data/report-service";
import {ReportDefinitionSummary} from "@/features/reports/data/types";

/**
 * The end-user report picker (`/reports`).
 *
 * The list is whatever `GET /report` returns — enabled reports this user's groups are granted,
 * checked **live against the DB** rather than read from the session's login-time role snapshot.
 * That is why a report granted a minute ago shows up on a refresh with no re-login, and why this
 * screen never tries to filter by role itself: it has no way to know, and guessing would either
 * hide a granted report or advertise one that 403s on click.
 */
const ReportsList: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportDefinitionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.list();
        setReports(data);
      } catch (error) {
        setError(`${t("reports.loadFailed")}: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ContentTheme title={t("reports.title")}>
      <div className="p-2 md:p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3" aria-label={t("loading")}>
            {Array.from({length: 6}).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-5 w-40"/>
                  <Skeleton className="h-4 w-full"/>
                  <Skeleton className="h-4 w-2/3"/>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground"/>
            <p className="mt-3 text-sm font-medium">{t("reports.noReportsAvailable")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("reports.noReportsAvailableHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                onClick={() => navigate(`/reports/${encodeURIComponent(report.slug)}`)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <BarChart3 className="h-5 w-5 text-blue-600"/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" title={report.name}>{report.name}</p>
                    {report.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{report.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground"/>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ContentTheme>
  );
};

export default ReportsList;
