import React from 'react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';

interface LoginErrorAlertProps {
  errorMessage?: string;
  errorType?: string;
  invalidGrantText: string;
  loginErrorText: string;
}

export const LoginErrorAlert: React.FC<LoginErrorAlertProps> = ({
  errorMessage,
  errorType,
  invalidGrantText,
  loginErrorText
}) => {
  if (!errorMessage && !errorType) return null;

  return (
    <Alert className="bg-red-50 border-red-200 mb-4">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        {errorType === 'invalid_grant'
          ? invalidGrantText
          : `${loginErrorText}: ${errorMessage}`
        }
      </AlertDescription>
    </Alert>
  );
};