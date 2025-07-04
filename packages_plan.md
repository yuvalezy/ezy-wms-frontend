# PackageCheck Implementation Plan

## Overview
Implement a PackageCheck route (`/packageCheck`) that allows users to scan package barcodes and view package contents, similar to the existing BinCheck functionality.

## Implementation Steps

### 1. Create Package Check Directory Structure
Create `/src/pages/PackageCheck/` directory with the following files:
- `PackageCheck.tsx` - Main component for package scanning
- `PackageCheckResult.tsx` - Display package contents and details
- `package-check-data.ts` - Custom hook for package check logic

### 2. Create PackageScanner Component
Create `/src/components/PackageScanner.tsx`:
- Similar to BinLocationScanner but for package barcode scanning
- Interface: `PackageScannerProps` with onScan, onClear callbacks
- Implement ref forwarding for focus control
- Add validation for package barcode format

### 3. Implement PackageCheck.tsx
Key features:
- Use ContentTheme wrapper with title translation
- Implement package barcode scanning functionality
- Show PackageScanner when no package is selected
- Display PackageCheckResult when package data is loaded
- Add export to Excel functionality
- Include breadcrumb navigation
- Use hooks from `/src/pages/packages/hooks/`

### 4. Implement PackageCheckResult.tsx
Display components:
- Package information (barcode, status, location, dates)
- Package contents using `PackageContentDto[]`
- Item breakdowns with `UnitType` enum (Unit/Dozen/Pack)
- Summary cards showing:
  - Total items in package
  - Package status with color coding
  - Location information
  - Created/closed dates
- Expandable rows for detailed item information

### 5. Implement package-check-data.ts Hook
Functionality:
- Use `getPackageByBarcode(barcode, {contents: true, history: true})` from existing hooks
- Handle loading and error states via `ThemeContext`
- Implement Excel export using `formatQuantityForExcel` utility
- Manage package scanning and clearing state

### 6. Add Route to App.tsx
```jsx
<Route 
  path="/packageCheck" 
  element={
    <ProtectedRoute 
      authorizations={[
        RoleType.GOODS_RECEIPT_SUPERVISOR,
        RoleType.PICKING_SUPERVISOR,
        RoleType.COUNTING_SUPERVISOR,
        RoleType.TRANSFER_SUPERVISOR,
        RoleType.PACKAGE_MANAGEMENT,
        RoleType.PACKAGE_MANAGEMENT_SUPERVISOR
      ]} 
      element={<PackageCheck/>}
    />
  }
/>
```

### 7. Add Translations
In both English and Spanish translation.json files, add:
```json
{
  "packages": {
    "packageCheck": "Package Check",
    "packageScanner": "Package Scanner",
    "scanPackageBarcode": "Scan package barcode",
    "packageStatus": "Package Status",
    "packageContents": "Package Contents",
    "noPackageContentFound": "No package content found",
    "packageLocation": "Package Location",
    "packageCreated": "Created",
    "packageClosed": "Closed",
    "totalItemsInPackage": "Total Items in Package",
    "packageBarcode": "Package Barcode",
    "status": {
      "init": "Initialized",
      "active": "Active",
      "closed": "Closed",
      "cancelled": "Cancelled",
      "locked": "Locked"
    }
  }
}
```

### 8. Import Types from Existing Package Types
```typescript
import { 
  PackageDto,
  PackageContentDto,
  PackageStatus,
  UnitType,
  PackageLocationHistoryDto
} from '@/pages/packages/types';
```

## Key Implementation Details

1. **No new types needed** - Use existing types from `/src/pages/packages/types/`
2. **Reuse existing hooks** - Package management hooks already exist in `/src/pages/packages/hooks/`
3. **Follow BinCheck pattern** - Similar UI/UX patterns but adapted for packages
4. **Use nested translation structure** - Access translations with `packages.packageCheck` format
5. **Status display** - Show package status with appropriate color coding
6. **Location tracking** - Display current bin location if package is assigned to a bin

## File Structure
```
src/
├── components/
│   └── PackageScanner.tsx (new)
├── pages/
│   └── PackageCheck/
│       ├── PackageCheck.tsx
│       ├── PackageCheckResult.tsx
│       └── package-check-data.ts
└── App.tsx (update with new route)
```