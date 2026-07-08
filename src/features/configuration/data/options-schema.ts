/**
 * Declarative schema that drives the friendly "Options" editor.
 *
 * The stored Options JSON uses PascalCase keys (matching the backend Options POCO)
 * and every leaf value is a STRING — booleans are "true"/"false", enums are the enum
 * name, ints are numeric strings. The editor reads and writes strings to stay
 * consistent with how the config is stored and bound on the backend.
 */

export type OptionKind = "bool" | "enum" | "enumNullable" | "string" | "int" | "secret";

export type OptionGroup =
  | "general"
  | "units"
  | "goodsReceipt"
  | "transfer"
  | "picking"
  | "session";

export interface OptionField {
  /** PascalCase JSON key, e.g. "EnableUseBaseUn". */
  key: string;
  kind: OptionKind;
  /** Group id (OptionGroup for the Options editor; any string for reuse, e.g. SBO). */
  group: string;
  /** Allowed values for enum / enumNullable, e.g. ["Unit","Dozen","Pack"]. */
  enumValues?: string[];
  /** i18n namespace under configuration.options.enums for the value labels. */
  enumLabel?: string;
  /** When present, the field is only shown when this returns true. */
  visibleWhen?: (v: Record<string, any>) => boolean;
}

/** Sentinel for "not set / inherit the global value" in nullable selects. */
export const INHERIT = "__inherit__";

export const SCANNER_MODE = ["ItemBarcode", "ItemCode"];
export const UNIT_TYPE = ["Unit", "Dozen", "Pack"];
export const GOODS_RECEIPT_TYPE = ["Transactional", "Confirmation", "Both"];
export const OBJECT_TYPE = ["GoodsReceipt", "InventoryCounting", "Transfer", "Picking", "PickingClosure"];

export const OPTION_GROUPS: OptionGroup[] = [
  "general",
  "units",
  "goodsReceipt",
  "transfer",
  "picking",
  "session",
];

const isTrue = (v: Record<string, any>, key: string) => String(v?.[key]) === "true";

export const OPTION_FIELDS: OptionField[] = [
  // General
  {key: "EnableUseBaseUn", kind: "bool", group: "general"},
  {key: "ScannerMode", kind: "enum", group: "general", enumValues: SCANNER_MODE, enumLabel: "ScannerMode"},
  {key: "DisplayVendor", kind: "bool", group: "general"},
  {key: "WhsCodeBinSuffix", kind: "bool", group: "general"},

  // Units
  {key: "EnableUnitSelection", kind: "bool", group: "units"},
  {key: "DefaultUnitType", kind: "enum", group: "units", enumValues: UNIT_TYPE, enumLabel: "UnitType"},
  {key: "MaxUnitLevel", kind: "enumNullable", group: "units", enumValues: UNIT_TYPE, enumLabel: "UnitType"},
  {key: "UnitLabel", kind: "string", group: "units"},
  {key: "UnitAbbr", kind: "string", group: "units"},
  {key: "DozensLabel", kind: "string", group: "units"},
  {key: "DozensAbbr", kind: "string", group: "units"},
  {key: "BoxLabel", kind: "string", group: "units"},
  {key: "BoxAbbr", kind: "string", group: "units"},

  // Goods Receipt
  {key: "GoodsReceiptDraft", kind: "bool", group: "goodsReceipt"},
  {key: "GoodsReceiptType", kind: "enum", group: "goodsReceipt", enumValues: GOODS_RECEIPT_TYPE, enumLabel: "GoodsReceiptDocumentType"},
  {key: "GoodsReceiptModificationsRequiredSupervisor", kind: "bool", group: "goodsReceipt"},
  {key: "GoodsReceiptCreateSupervisorRequired", kind: "bool", group: "goodsReceipt"},
  {key: "GoodsReceiptTargetDocuments", kind: "bool", group: "goodsReceipt"},
  {key: "GoodsReceiptConfirmationAdjustStock", kind: "bool", group: "goodsReceipt"},
  {
    key: "GoodsReceiptConfirmationAdjustStockPriceList",
    kind: "int",
    group: "goodsReceipt",
    visibleWhen: (v) => isTrue(v, "GoodsReceiptConfirmationAdjustStock"),
  },

  // Transfer
  {key: "EnableTransferConfirm", kind: "bool", group: "transfer"},
  {key: "EnableTransferRequest", kind: "bool", group: "transfer"},
  {key: "EnableWarehouseTransfer", kind: "bool", group: "transfer"},
  {key: "TransferCreateSupervisorRequired", kind: "bool", group: "transfer"},
  {key: "TransferTargetItems", kind: "bool", group: "transfer"},
  {key: "DirectTransferAll", kind: "bool", group: "transfer"},

  // Picking
  {key: "EnablePickingCheck", kind: "bool", group: "picking"},
  {key: "EnablePickPathRouting", kind: "bool", group: "picking"},
  {
    key: "PickPathSortKey",
    kind: "string",
    group: "picking",
    visibleWhen: (v) => isTrue(v, "EnablePickPathRouting"),
  },
  {key: "EnablePickingPackageLabels", kind: "bool", group: "picking"},
  {
    key: "EnablePostPickRepack",
    kind: "bool",
    group: "picking",
    visibleWhen: (v) => isTrue(v, "EnablePickingPackageLabels"),
  },
  {
    key: "PickingPackageLabelPrefix",
    kind: "string",
    group: "picking",
    visibleWhen: (v) => isTrue(v, "EnablePickingPackageLabels"),
  },
  {key: "BlockPickScanDuringGoodsReceipt", kind: "bool", group: "picking"},
  {key: "BlockPickProcessDuringGoodsReceipt", kind: "bool", group: "picking"},

  // Session & Quantities
  {key: "IdleLogoutTimeout", kind: "int", group: "session"},
  {key: "EnableDecimalQuantities", kind: "bool", group: "session"},
  {key: "InventoryCountingBatchSize", kind: "int", group: "session"},
];
