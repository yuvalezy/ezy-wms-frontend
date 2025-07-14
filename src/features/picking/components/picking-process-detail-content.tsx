import React, {useEffect, useState} from "react";
import {PickingDocumentDetailItem} from "@/features/picking/data/picking";
import {PickingProcessDetailContentBins} from "@/features/picking/components/picking-process-detail-content-bins";
import {
  PickingProcessDetailContentAvailable
} from "@/features/picking/components/picking-process-detail-content-available";

export interface PickingProcessDetailContentProps {
  items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items}) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(items?.some(i => i.available != null && i.available > 0) ?? false);
  }, [items]);

  return (
    <div className="contentStyle">
      {!available ? <PickingProcessDetailContentBins items={items} />:
       <PickingProcessDetailContentAvailable items={items} />}
    </div>
  )
}

export default PickingProcessDetailContent;
