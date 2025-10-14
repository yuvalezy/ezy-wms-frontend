import React from "react";
import BarCodeScanner from "@/components/BarCodeScanner";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {SourceTarget} from "@/features/transfer/data/transfer";
import {ObjectType} from "@/features/packages/types";

export default function TransferProcessSourceItem() {
  const {
    barcodeRef,
    handleAddItem,
    handleAddPackage,
    user,
    info,
    binLocation
  } = useTransferProcess();

  return (
    <BarCodeScanner
      unit
      ref={barcodeRef}
      onAddItem={(value) => handleAddItem(SourceTarget.Source, value)}
      enabled
      enablePackage={user!.settings!.enablePackages}
      enablePackageCreate={false}
      isEphemeralPackage={false}
      objectType={ObjectType.Transfer}
      objectId={info?.id}
      objectNumber={info?.number}
      binEntry={binLocation?.entry}
      onPackageChanged={(value) => handleAddPackage(SourceTarget.Source, value)}
    />
  );
}
