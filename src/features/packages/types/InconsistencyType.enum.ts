export enum InconsistencyType {
  SapStockLessThanWms = "SapStockLessThanWms",
  PackageExceedsSapStock = "PackageExceedsSapStock",
  NegativePackageQuantity = "NegativePackageQuantity",
  ValidationError = "ValidationError",
  LocationMismatch = "LocationMismatch",
  DuplicateContent = "DuplicateContent"
}