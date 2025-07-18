import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'universal-cookie';
import { useAuth, useThemeContext } from '@/components';
import { DeviceStatus } from '@/features/devices/data/device';
import { AccountState } from '@/features/account/data/account';

export type Warehouse = {
  id: string;
  name: string;
};

export const useLoginData = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [requiresWarehouse, setRequiresWarehouse] = useState(false);
  const [requiresDeviceName, setRequiresDeviceName] = useState(false);
  const [deviceNameTaken, setDeviceNameTaken] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');
  
  const { setLoading } = useThemeContext();
  const navigate = useNavigate();
  const { login, isValidAccount, companyInfo, reloadCompanyInfo } = useAuth();
  const { t, i18n } = useTranslation();


  // Reload company info when hook mounts or when logout=true in URL
  useEffect(() => {
    if (window.location.search.includes('logout=true')) {
      navigate("/login?logout=true");
    }
    reloadCompanyInfo();
  }, [reloadCompanyInfo]);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    const cookies = new Cookies();
    cookies.set('userLanguage', lang, {
      path: '/',
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    });
  };

  const clearError = () => {
    setErrorMessage('');
    setErrorType('');
    setRequiresDeviceName(false);
    setDeviceNameTaken(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = data.get('password') as string;
    const warehouse = data.get('warehouse') as string | null;
    const newDeviceName = data.get('newDeviceName') as string | null;

    setLoading(true);
    
    // Clear device name taken alert when submitting
    setDeviceNameTaken(false);

    try {
      const response = await login(password, warehouse || undefined, newDeviceName || undefined);
      if (response.deviceStatus === DeviceStatus.Active && isValidAccount) {
        navigate('/');
      } else if (response.superUser) {
        if (response.deviceStatus !== DeviceStatus.Active) {
          navigate('/settings/devices');
        } else {
          navigate('/settings/license');
        }
      }
    } catch (error: any) {
      console.debug('LoginPage: Full error object:', error);
      
      // Check for network/CORS errors
      if (!error.response && error.message) {
        console.error('LoginPage: Network/CORS error:', error.message);
        setErrorMessage(`Network error: ${error.message}. Check console for details.`);
        setErrorType('network_error');
        return;
      }
      
      const errorData = error?.response?.data;
      const errorCode = errorData?.error;
      
      // Check if it's a warehouse selection error
      if (errorCode === 'WAREHOUSE_SELECTION_REQUIRED') {
        setWarehouses(errorData.data.warehouses);
        setRequiresWarehouse(true);
        setErrorMessage('');
        setErrorType('');
      }
      // Check if it's a new device name required error
      else if (errorCode === 'NEW_DEVICE_NAME') {
        setRequiresDeviceName(true);
        setDeviceNameTaken(false);
        setErrorMessage('');
        setErrorType('');
      }
      // Check if device name is taken
      else if (errorCode === 'NEW_DEVICE_TAKEN') {
        setDeviceNameTaken(true);
        setErrorMessage('');
        setErrorType('');
        // Focus on device name input after render
        setTimeout(() => {
          const deviceNameInput = document.getElementById('newDeviceName');
          if (deviceNameInput) {
            deviceNameInput.focus();
          }
        }, 100);
      }
      else {
        if (errorCode === 'invalid_grant') {
          setErrorType('invalid_grant');
          setErrorMessage('');
        } else {
          setErrorType('');
          setErrorMessage(errorData?.error_description || error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Status banner helpers
  const shouldShowDeviceStatusBanner = () => {
    return (companyInfo?.deviceStatus && companyInfo.deviceStatus !== DeviceStatus.Active) || false;
  };

  const shouldShowAccountStatusBanner = () => {
    if (!companyInfo?.accountStatus) return false;
    const invalidStates = [
      AccountState.Invalid,
      AccountState.PaymentDue,
      AccountState.PaymentDueUnknown,
      AccountState.Demo,
      AccountState.DemoExpired,
      AccountState.Disabled
    ];
    return invalidStates.includes(companyInfo.accountStatus);
  };

  const isAccountDisabled = () => {
    return companyInfo?.accountStatus === AccountState.Disabled;
  };

  return {
    // State
    warehouses,
    requiresWarehouse,
    requiresDeviceName,
    deviceNameTaken,
    errorMessage,
    errorType,
    companyInfo,
    currentLanguage: i18n.language,
    
    // Actions
    handleSubmit,
    handleLanguageChange,
    clearError,
    
    // Status checks
    shouldShowDeviceStatusBanner,
    shouldShowAccountStatusBanner,
    isAccountDisabled,
    
    // Translation
    t,
  };
};