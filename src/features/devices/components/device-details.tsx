import React, {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Clock, User, Activity, Smartphone, Calendar} from "lucide-react";
import {useThemeContext} from "@/components";
import {Device, DeviceAuditEntry} from "../data/device";
import {deviceService} from "../data/device-service";
import DeviceStatusForm from "./device-status-form";
import DeviceNameForm from "./device-name-form";
import {DeviceDetailsSkeleton} from "./DeviceDetailsSkeleton";

interface DeviceDetailsProps {
  device: Device;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({device, open, onOpenChange, onUpdate}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [auditHistory, setAuditHistory] = useState<DeviceAuditEntry[]>([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    if (open && device) {
      loadAuditHistory();
    }
  }, [open, device]);

  const loadAuditHistory = async () => {
    try {
      setIsLoadingAudit(true);
      const data = await deviceService.getAuditHistory(device.deviceUuid);
      setAuditHistory(data);
    } catch (error) {
      setError(`Failed to load audit history: ${error}`);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'outline';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleFormClose = async (shouldReload: boolean) => {
    setShowStatusForm(false);
    setShowNameForm(false);
    if (shouldReload) {
      await loadAuditHistory();
      onUpdate();
    }
  };

  // Show skeleton while loading audit data
  if (isLoadingAudit) {
    return <DeviceDetailsSkeleton open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('deviceDetails')}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">{t('details')}</TabsTrigger>
              <TabsTrigger value="audit">{t('auditHistory')}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('deviceInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Smartphone className="w-4 h-4 mr-2"/>
                        {t('deviceName')}
                      </div>
                      <p className="font-medium">{device.deviceName}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Activity className="w-4 h-4 mr-2"/>
                        {t('status')}
                      </div>
                      <Badge variant={getStatusBadgeVariant(device.status)}>
                        {device.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Smartphone className="w-4 h-4 mr-2"/>
                        {t('deviceUuid')}
                      </div>
                      <p className="font-mono text-sm">{device.deviceUuid}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2"/>
                        {t('registrationDate')}
                      </div>
                      <p className="text-sm">{formatDate(device.registrationDate)}</p>
                    </div>
                  </div>

                  {device.statusNotes && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">{t('statusNotes')}</div>
                      <p className="text-sm">{device.statusNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStatusForm(true)}
                    >
                      {t('updateStatus')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNameForm(true)}
                    >
                      {t('changeName')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('auditHistory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {auditHistory.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">{t('noAuditHistory')}</p>
                  ) : (
                    <div className="space-y-4">
                      {auditHistory.map((entry, index) => (
                        <div key={`${entry.changedAt}-${index}`} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="w-4 h-4 text-primary"/>
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">Status Changed</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.changedAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-3 h-3"/>
                              <span>{entry.changedByUser}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground font-medium">{t('reason')}: </span>
                              <span>{entry.reason || t('noReasonProvided')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                {t('from')}: <span className="font-mono">{entry.previousStatus}</span>
                              </span>
                              {' → '}
                              <span className="text-muted-foreground">
                                {t('to')}: <span className="font-mono">{entry.newStatus}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showStatusForm && (
        <DeviceStatusForm
          device={device}
          open={showStatusForm}
          onOpenChange={setShowStatusForm}
          onClose={handleFormClose}
        />
      )}

      {showNameForm && (
        <DeviceNameForm
          device={device}
          open={showNameForm}
          onOpenChange={setShowNameForm}
          onClose={handleFormClose}
        />
      )}
    </>
  );
};

export default DeviceDetails;