import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {countingService} from "@/features/counting/data/counting-service";
import {BatchStatus, CountingBatch} from "@/features/counting/data/counting";
import {Loader2, RefreshCw} from "lucide-react";

interface BatchStatusPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countingId: string;
  countingNumber: number;
}

const POLL_INTERVAL = 3000;

const BatchStatusPanel: React.FC<BatchStatusPanelProps> = ({
  open,
  onOpenChange,
  countingId,
  countingNumber,
}) => {
  const {t} = useTranslation();
  const [batches, setBatches] = useState<CountingBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPollingActive = useCallback((batchList: CountingBatch[]) => {
    if (batchList.length === 0) return true;
    return batchList.some(
      (b) => b.status === BatchStatus.Pending || b.status === BatchStatus.Processing
    );
  }, []);

  const fetchBatches = useCallback(async () => {
    if (!countingId) return;
    try {
      const data = await countingService.fetchBatches(countingId);
      setBatches(data);
      return data;
    } catch (error) {
      console.error("Error fetching batches:", error);
      return null;
    }
  }, [countingId]);

  useEffect(() => {
    if (!open || !countingId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsLoading(true);
    fetchBatches().then((data) => {
      setIsLoading(false);
      if (data && isPollingActive(data)) {
        intervalRef.current = setInterval(async () => {
          const updated = await fetchBatches();
          if (updated && !isPollingActive(updated)) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }, POLL_INTERVAL);
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, countingId, fetchBatches, isPollingActive]);

  const completedCount = batches.filter((b) => b.status === BatchStatus.Completed).length;
  const totalCount = batches.length;
  const failedCount = batches.filter((b) => b.status === BatchStatus.Failed).length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleRetryAll = async () => {
    setIsRetrying("all");
    try {
      await countingService.retryBatches(countingId);
      await fetchBatches();
      // Restart polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(async () => {
        const updated = await fetchBatches();
        if (updated && !isPollingActive(updated)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, POLL_INTERVAL);
    } catch (error) {
      console.error("Error retrying batches:", error);
    } finally {
      setIsRetrying(null);
    }
  };

  const handleRetryBatch = async (batchId: string) => {
    setIsRetrying(batchId);
    try {
      await countingService.retryBatches(countingId, batchId);
      await fetchBatches();
      // Restart polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(async () => {
        const updated = await fetchBatches();
        if (updated && !isPollingActive(updated)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, POLL_INTERVAL);
    } catch (error) {
      console.error("Error retrying batch:", error);
    } finally {
      setIsRetrying(null);
    }
  };

  const getBadgeClass = (status: BatchStatus): string => {
    switch (status) {
      case BatchStatus.Pending:
        return "bg-gray-400 text-white hover:bg-gray-400";
      case BatchStatus.Processing:
        return "bg-blue-500 text-white hover:bg-blue-500";
      case BatchStatus.Completed:
        return "bg-green-500 text-white hover:bg-green-500";
      case BatchStatus.Failed:
        return "bg-red-500 text-white hover:bg-red-500";
      default:
        return "";
    }
  };

  const getBatchStatusLabel = (status: BatchStatus): string => {
    switch (status) {
      case BatchStatus.Pending:
        return t('pending');
      case BatchStatus.Processing:
        return t('processingStatus');
      case BatchStatus.Completed:
        return t('completed');
      case BatchStatus.Failed:
        return t('failed');
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('batchProcessing')} - #{countingNumber}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('progress')}</span>
                <span>
                  {completedCount} / {totalCount}
                  {failedCount > 0 && (
                    <span className="text-red-500 ml-2">
                      ({failedCount} {t('failed')})
                    </span>
                  )}
                </span>
              </div>
              <Progress value={progressPercent} />
            </div>

            {/* Retry all button */}
            {failedCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryAll}
                  disabled={isRetrying !== null}
                >
                  {isRetrying === "all" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t('retryAllFailed')}
                </Button>
              </div>
            )}

            {/* Batches table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('lines')}</TableHead>
                  <TableHead>{t('sapDocNumber')}</TableHead>
                  <TableHead>{t('error')}</TableHead>
                  <TableHead>{t('retries')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.sequenceOrder}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(batch.status)}>
                        {getBatchStatusLabel(batch.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.lineCount}</TableCell>
                    <TableCell>
                      {batch.sapDocNumber || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={batch.errorMessage}>
                      {batch.errorMessage || "-"}
                    </TableCell>
                    <TableCell>{batch.retryCount}</TableCell>
                    <TableCell>
                      {batch.status === BatchStatus.Failed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetryBatch(batch.id)}
                          disabled={isRetrying !== null}
                        >
                          {isRetrying === batch.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BatchStatusPanel;
