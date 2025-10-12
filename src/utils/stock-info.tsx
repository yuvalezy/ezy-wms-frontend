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
  const {defaultUnit, unitSelection, user} = useAuth();
  const settings = user!.settings;

  return (params: StockInfoParams) => {
    const isNegative = params.quantity < 0;
    let quantity = Math.abs(params.quantity);
    const purPackMsr = params.purPackMsr && params.purPackMsr.length > 0 ? params.purPackMsr : settings.boxLabel ?? t('packUnit');
    const buyUnitMsr = params.buyUnitMsr && params.buyUnitMsr.length > 0 ? params.buyUnitMsr : settings.dozensLabel ?? t('buyUnit');
    const unitMsr = t('units');
    if (!unitSelection) {
      const defaultUnitMsr = defaultUnit === UnitType.Pack ? purPackMsr : defaultUnit === UnitType.Dozen ? buyUnitMsr : unitMsr;
      if (defaultUnit === UnitType.Pack) {
        quantity = Math.floor(quantity / params.purPackUn);
      }
      return `${isNegative ? '-' : ''}${quantity} ${defaultUnitMsr}`;
    }
    const packages = params.purPackUn == 1 ? 0 : Math.floor(quantity / (params.numInBuy * params.purPackUn));
    const remainingForDozens = params.purPackUn == 1 ? quantity : quantity % (params.numInBuy * params.purPackUn);
    let dozens;
    let units;
    if (settings.maxUnitLevel === UnitType.Dozen) {
      dozens = remainingForDozens / params.numInBuy;
      units = 0;
    } else {
      dozens = Math.floor(remainingForDozens / params.numInBuy);
      units = remainingForDozens % params.numInBuy;
    }
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
    return isNegative ? `-${response}` : response;
  };
}