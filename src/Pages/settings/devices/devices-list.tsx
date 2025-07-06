import React, {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Eye, Edit, Activity, Search} from "lucide-react";
import {useThemeContext} from "@/components";
import {Device, DeviceFilters, DeviceStatus} from "./data/device";
import {deviceService} from "./data/device-service";
import DeviceDetails from "./components/device-details";
import ContentTheme from "@/components/ContentTheme";

const DevicesList: React.FC = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();

  const [devices, setDevices] = useState<Device[]>([]);
  const [filters, setFilters] = useState<DeviceFilters>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadDevices();
  }, [filters]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await deviceService.getAll(filters);
      setDevices(data);
    } catch (error) {
      setError(`Failed to load devices: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({...prev, searchTerm}));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === "all" ? undefined : status
    }));
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setShowDetails(true);
  };

  const handleDetailsClose = async (open: boolean) => {
    setShowDetails(open);
    if (!open) {
      setSelectedDevice(null);
    }
  };

  const handleDeviceUpdate = async () => {
    await loadDevices();
    // Update the selected device if it's currently being viewed
    if (selectedDevice) {
      try {
        const updatedDevice = await deviceService.getByUuid(selectedDevice.deviceUuid);
        setSelectedDevice(updatedDevice);
      } catch (error) {
        setError(`Failed to refresh device details: ${error}`);
      }
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
    return date.toLocaleDateString();
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("devices")}]}>
      <div className="space-y-4">
        <Card>
          <CardContent>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                  <Input
                    placeholder={t('searchDevices')}
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select onValueChange={handleStatusFilter} defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('status')}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  {Object.values(DeviceStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('deviceName')}</TableHead>
                  <TableHead>{t('deviceUuid')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('registrationDate')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices?.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.deviceName}</TableCell>
                    <TableCell className="font-mono text-sm">{device.deviceUuid}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(device.status)}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(device.registrationDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(device)}
                        >
                          <Eye className="h-4 w-4 mr-1"/>
                          {t('viewDetails')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {devices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('noDevicesFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedDevice && (
          <DeviceDetails
            device={selectedDevice}
            open={showDetails}
            onOpenChange={handleDetailsClose}
            onUpdate={handleDeviceUpdate}
          />
        )}
      </div>
    </ContentTheme>
  );
};

export default DevicesList;