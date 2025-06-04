import {useTranslation} from "react-i18next";

export interface StockInfoParams {
  quantity: number;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
}

export const useStockInfo = () => {
  const {t} = useTranslation();
  return (params: StockInfoParams) => {
    const packages = Math.floor(params.quantity / (params.numInBuy * params.purPackUn));
    const remainingForDozens = params.quantity % (params.numInBuy * params.purPackUn);
    const dozens = Math.floor(remainingForDozens / params.numInBuy);
    const units = remainingForDozens % params.numInBuy;
    let response = '';
    if (packages > 0) {
      response = `${packages} ${params.purPackMsr.length > 0 ? params.purPackMsr : t('packUnit')} `;
    }

    if (dozens > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${dozens} ${params.buyUnitMsr.length > 0 ? params.buyUnitMsr : t('buyUnit')} `;
    }

    if (units > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${units} ${t('units')}`;
    }
    return response;
  };
}