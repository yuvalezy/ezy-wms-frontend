import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Label, Title, Text, Button} from '@ui5/webcomponents-react';

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAll[]
  onClick: (data: GoodsReceiptAll) => void;
}

interface MetricRowProps {
  label: string;
  values: {
    units: string | number;
    buyUnits: string | number;
    packUnits: string | number;
  };
}

const MetricRow: React.FC<MetricRowProps> = ({label, values}) => (
  <div className="metric-row" style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e0e0e0'
  }}>
    <div style={{flex: '0 0 30%', fontWeight: '500'}}>
      <Text>{label}</Text>
    </div>
    <div style={{flex: '1', display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
      <div style={{flex: '1'}}>
        <Text>{values.units}</Text>
      </div>
      <div style={{flex: '1'}}>
        <Text>{values.buyUnits}</Text>
      </div>
      <div style={{flex: '1'}}>
        <Text>{values.packUnits}</Text>
      </div>
    </div>
  </div>
);

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick}) => {
  const {t} = useTranslation();

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      {data.map((row) => {
        const inWarehouse = row.quantity - row.delivery - row.showroom;

        return (
          <Card
            key={row.itemCode}
            style={{width: '100%'}}
            header={
              <CardHeader titleText={`${t('code')}: ${row.itemCode}`}
                          subtitleText={`${t('description')}: ${row.itemName}`}/>
            }
          >
            <div style={{paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px'}}>
              {/* Unit Headers */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '2px solid #0070f3',
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                <div style={{flex: '0 0 30%'}}>
                  <Text style={{fontWeight: 'bold'}}>{t('unit')}</Text>
                </div>
                <div style={{flex: '1', display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>{t('units')}</Text>
                  </div>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>
                      {row.buyUnitMsr ?? t('purPackUn')}
                    </Text>
                  </div>
                  <div style={{flex: '1'}}>
                    <Text style={{fontWeight: 'bold', fontSize: '12px'}}>
                      {row.purPackMsr ?? t('packUn')}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <MetricRow
                label={t('quantity')}
                values={{
                  units: row.quantity,
                  buyUnits: (row.quantity / row.numInBuy).toFixed(2),
                  packUnits: (row.quantity / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('delivery')}
                values={{
                  units: row.delivery,
                  buyUnits: (row.delivery / row.numInBuy).toFixed(2),
                  packUnits: (row.delivery / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('showroom')}
                values={{
                  units: row.showroom,
                  buyUnits: (row.showroom / row.numInBuy).toFixed(2),
                  packUnits: (row.showroom / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('inWarehouse')}
                values={{
                  units: inWarehouse,
                  buyUnits: (inWarehouse / row.numInBuy).toFixed(2),
                  packUnits: (inWarehouse / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('stock')}
                values={{
                  units: row.stock,
                  buyUnits: (row.stock / row.numInBuy).toFixed(2),
                  packUnits: (row.stock / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              {/* Action Button */}
              <div style={{marginTop: '16px', textAlign: 'center'}}>
                <Button
                  design="Emphasized"
                  onClick={() => onClick(row)}
                  style={{width: '100%'}}
                >
                  {t('modifyValues')}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default GoodsReceiptAllReportTable;
