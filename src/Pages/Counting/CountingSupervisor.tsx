import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/utils/string-utils";
import {countingService} from "@/features/counting/data/counting-service";
import CountingCard from "@/features/counting/components/CountingCard";
import {ObjectAction} from "@/features/shared/data/shared";
import {MessageBox} from "@/components/ui/message-box";
import {toast} from "sonner";
import CountingForm from "@/features/counting/components/CountingForm";
import CountingTable from "@/features/counting/components/CountingTable";
import {Counting} from "@/features/counting/data/counting";
import {useAuth} from "@/components";
import {User} from "@/features/users/data/user";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Loader2} from "lucide-react";

export default function CountingSupervisor() {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {setError} = useThemeContext();
  const [countings, setCountings] = useState<Counting[]>([]);
  const [selected, setSelected] = useState<Counting | null>(
    null
  );
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    countingService.search()
      .then((data) => {
        setCountings(data);
      })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [setError]);

  const handleAction = (doc: Counting, action: ObjectAction) => {
    setSelected(doc);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setDialogOpen(false);
    
    if (actionType === "approve") {
      setIsProcessing(true);
    }

    const serviceCall = actionType === "cancel"
      ? countingService.cancel(selected!.id)
      : countingService.process(selected!.id);

    serviceCall
      .then((result) => {
        if (typeof result === "boolean" || result.success) {
          setCountings((prev) =>
            prev.filter((count) => count.id !== selected?.id)
          );
          toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
        }
      })
      .catch((error) => setError(error))
      .finally(() => {
        if (actionType === "approve") {
          setIsProcessing(false);
        }
      });
  };

  // Skeleton components
  const FormSkeleton = () => (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-12" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const CardSkeleton = () => (
    <Card className="mb-4 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContentTheme title={t("countingSupervisor")}>
      {isLoading ? (
        <>
          <FormSkeleton />
          <br/>
          {/* Mobile view - Card skeletons */}
          <div className="block sm:hidden" aria-label="Loading...">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>

          {/* Desktop view - Table skeleton */}
          <div className="hidden sm:block" aria-label="Loading...">
            <TableSkeleton />
          </div>
        </>
      ) : (
        <>
          <CountingForm
            onNewCounting={(newCounting) => {
              const createByUser: User = {
                fullName: user!.name, id: user!.id, deleted: false,
                superUser: false,
                active: false,
                warehouses: []
              };
              newCounting = {...newCounting, createdByUser: createByUser};
              setCountings((prev) => [newCounting, ...prev]);
            }
            }
          />
          <br/>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {countings.map((doc) => (
              <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={(action) => handleAction(doc, action)}/>
            ))}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <CountingTable
              countings={countings}
              supervisor={true}
              onAction={handleAction}
            />
          </div>
        </>
      )}
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
          </div>
        </div>
      )}
      
      <MessageBox
        onConfirm={handleConfirmAction}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        type="confirm"
        title={StringFormat(
          actionType === "approve"
            ? t("confirmFinishDocument")
            : t("confirmCancelDocument"),
          selected?.number
        )}
        description={t('actionCannotReverse')}

      />
    </ContentTheme>
  );
}
