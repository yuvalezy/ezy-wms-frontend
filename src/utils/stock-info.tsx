import {useTranslation} from "react-i18next";
import {useAuth} from "@/components";
import {UnitType} from "@/features/shared/data";

export interface StockInfoParams {
  quantity: number;
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
}

export const useStockInfo = () => {
  const {t} = useTranslation();
  const {defaultUnit, unitSelection} = useAuth();

  return (params: StockInfoParams) => {
    const purPackMsr = params.purPackMsr && params.purPackMsr.length > 0 ? params.purPackMsr : t('packUnit');
    const buyUnitMsr = params.buyUnitMsr && params.buyUnitMsr.length > 0 ? params.buyUnitMsr : t('buyUnit');
    const unitMsr = t('units');
    if (!unitSelection) {
      const defaultUnitMsr = defaultUnit === UnitType.Pack ? purPackMsr : defaultUnit === UnitType.Dozen ? buyUnitMsr : unitMsr;
      return `${params.quantity} ${defaultUnitMsr}`;
    }
    const packages = Math.floor(params.quantity / (params.numInBuy * params.purPackUn));
    const remainingForDozens = params.quantity % (params.numInBuy * params.purPackUn);
    const dozens = Math.floor(remainingForDozens / params.numInBuy);
    const units = remainingForDozens % params.numInBuy;
    let response = '';
    if (packages > 0) {
      response = `${packages} ${purPackMsr} `;
    }

    if (dozens > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${dozens} ${buyUnitMsr} `;
    }

    if (units > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${units} ${unitMsr}`;
    }
    if (response.length === 0)
      response = '0';
    return response;
  };
}