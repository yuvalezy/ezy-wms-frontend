import React from "react";
import BarCodeScanner from "@/components/BarCodeScanner";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {SourceTarget} from "@/features/transfer/data/transfer";
import {ObjectType} from "@/features/shared/data";

export default function TransferProcessSourceItem() {
  const {
    barcodeRef,
    handleAddItem,
  } = useTransferProcess();

  return (
    <BarCodeScanner
      unit
      ref={barcodeRef}
      onAddItem={(value) => handleAddItem(SourceTarget.Source, value)}
      enabled
      objectType={ObjectType.Transfer}
    />
  );
}
