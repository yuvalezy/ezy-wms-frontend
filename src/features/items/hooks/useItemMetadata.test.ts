import { renderHook, act } from '@testing-library/react';
import { useItemMetadata } from './useItemMetadata';
import { ItemMetadataDefinition } from '../types/ItemMetadataDefinition.dto';
import { MetadataFieldType } from '../../packages/types/MetadataFieldType.enum';
import { ItemDetails } from '../data/items';

// Mock ThemeContext
const mockSetError = jest.fn();
jest.mock('@/components/ThemeContext', () => ({
  useThemeContext: () => ({
    setError: mockSetError
  })
}));

// Mock the items-service
jest.mock('../data/items-service', () => ({
  updateItemMetadata: jest.fn()
}));

describe('useItemMetadata Hook', () => {
  const mockItemData: ItemDetails = {
    itemCode: 'ITEM001',
    itemName: 'Test Item',
    numInBuy: 1,
    purPackUn: 1,
    customAttributes: {
      PurchaseUnitLength: 10,
      PurchaseUnitWidth: 5,
      PurchaseUnitHeight: 3,
      Volume: 150 // This should be recalculated
    }
  };

  const metadataDefinitions: ItemMetadataDefinition[] = [
    {
      id: 'PurchaseUnitLength',
      description: 'Length (cm)',
      type: MetadataFieldType.Decimal,
      required: true,
      readOnly: false
    },
    {
      id: 'PurchaseUnitWidth',
      description: 'Width (cm)',
      type: MetadataFieldType.Decimal,
      required: true,
      readOnly: false
    },
    {
      id: 'PurchaseUnitHeight',
      description: 'Height (cm)',
      type: MetadataFieldType.Decimal,
      required: true,
      readOnly: false
    },
    {
      id: 'Volume',
      description: 'Volume (cm³)',
      type: MetadataFieldType.Decimal,
      required: false,
      readOnly: false,
      calculated: {
        formula: 'PurchaseUnitLength * PurchaseUnitWidth * PurchaseUnitHeight',
        dependencies: ['PurchaseUnitLength', 'PurchaseUnitWidth', 'PurchaseUnitHeight'],
        precision: 2,
        clearDependenciesOnManualEdit: false
      }
    }
  ];

  beforeEach(() => {
    mockSetError.mockClear();
  });

  describe('Formula Evaluation', () => {
    test('should calculate volume when all dependencies have valid values', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      // The Volume field should be automatically calculated: 10 * 5 * 3 = 150
      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(150);
    });

    test('should recalculate volume when dependency field changes', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      act(() => {
        // Change length from 10 to 12
        result.current.updateFieldValue('PurchaseUnitLength', 12);
      });

      // Volume should be recalculated: 12 * 5 * 3 = 180
      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(180);
    });

    test('should clear calculated field when dependency is removed', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      act(() => {
        // Remove one dependency
        result.current.updateFieldValue('PurchaseUnitLength', null);
      });

      // Volume should be cleared because not all dependencies are available
      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(null);
    });

    test('should handle precision correctly', () => {
      const testDefinitions = [...metadataDefinitions];
      testDefinitions[3] = {
        ...testDefinitions[3],
        calculated: {
          formula: 'PurchaseUnitLength * PurchaseUnitWidth * PurchaseUnitHeight / 3',
          dependencies: ['PurchaseUnitLength', 'PurchaseUnitWidth', 'PurchaseUnitHeight'],
          precision: 2,
          clearDependenciesOnManualEdit: false
        }
      };

      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, testDefinitions)
      );

      // Volume should be calculated and rounded: (10 * 5 * 3) / 3 = 50.00
      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(50);
    });
  });

  describe('Form State Management', () => {
    test('should mark form as having changes when calculated field updates', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      act(() => {
        // Change a dependency field
        result.current.updateFieldValue('PurchaseUnitLength', 15);
      });

      // Form should be marked as having changes
      expect(result.current.formState.hasChanges).toBe(true);
    });

    test('should maintain form validity when calculated field updates', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      act(() => {
        // Change a dependency field
        result.current.updateFieldValue('PurchaseUnitLength', 15);
      });

      // Form should remain valid
      expect(result.current.formState.isValid).toBe(true);
    });
  });

  describe('Multiple Calculated Fields', () => {
    const extendedDefinitions: ItemMetadataDefinition[] = [
      ...metadataDefinitions,
      {
        id: 'SurfaceArea',
        description: 'Surface Area (cm²)',
        type: MetadataFieldType.Decimal,
        required: false,
        readOnly: false,
        calculated: {
          formula: '2 * (PurchaseUnitLength * PurchaseUnitWidth + PurchaseUnitLength * PurchaseUnitHeight + PurchaseUnitWidth * PurchaseUnitHeight)',
          dependencies: ['PurchaseUnitLength', 'PurchaseUnitWidth', 'PurchaseUnitHeight'],
          precision: 2,
          clearDependenciesOnManualEdit: false
        }
      }
    ];

    test('should calculate multiple dependent fields simultaneously', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, extendedDefinitions)
      );

      // Check that both calculated fields are computed
      const volumeValue = result.current.getFieldValue('Volume');
      const surfaceAreaValue = result.current.getFieldValue('SurfaceArea');

      expect(volumeValue).toBe(150); // 10 * 5 * 3
      expect(surfaceAreaValue).toBe(190); // 2 * (50 + 30 + 15)
    });

    test('should update multiple calculated fields when dependency changes', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, extendedDefinitions)
      );

      act(() => {
        // Change length from 10 to 6
        result.current.updateFieldValue('PurchaseUnitLength', 6);
      });

      const volumeValue = result.current.getFieldValue('Volume');
      const surfaceAreaValue = result.current.getFieldValue('SurfaceArea');

      expect(volumeValue).toBe(90); // 6 * 5 * 3
      expect(surfaceAreaValue).toBe(126); // 2 * (30 + 18 + 15)
    });
  });

  describe('Error Handling', () => {
    const invalidFormulaDefinitions: ItemMetadataDefinition[] = [
      ...metadataDefinitions.slice(0, 3), // Keep dependency fields
      {
        id: 'InvalidCalculation',
        description: 'Invalid Calculation',
        type: MetadataFieldType.Decimal,
        required: false,
        readOnly: false,
        calculated: {
          formula: 'PurchaseUnitLength + invalidFunction()', // Invalid formula
          dependencies: ['PurchaseUnitLength'],
          precision: 2,
          clearDependenciesOnManualEdit: false
        }
      }
    ];

    test('should handle invalid formulas gracefully', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, invalidFormulaDefinitions)
      );

      // Should not crash and calculated field should be null
      const calculatedValue = result.current.getFieldValue('InvalidCalculation');
      expect(calculatedValue).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero values in calculations', () => {
      const itemWithZeros: ItemDetails = {
        itemCode: 'ITEM001',
        itemName: 'Test Item',
        numInBuy: 1,
        purPackUn: 1,
        customAttributes: {
          PurchaseUnitLength: 0,
          PurchaseUnitWidth: 5,
          PurchaseUnitHeight: 3
        }
      };

      const { result } = renderHook(() => 
        useItemMetadata(itemWithZeros, metadataDefinitions)
      );

      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(0); // 0 * 5 * 3 = 0
    });

    test('should handle negative values in calculations', () => {
      const { result } = renderHook(() => 
        useItemMetadata(mockItemData, metadataDefinitions)
      );

      act(() => {
        result.current.updateFieldValue('PurchaseUnitLength', -5);
      });

      const volumeValue = result.current.getFieldValue('Volume');
      expect(volumeValue).toBe(-75); // -5 * 5 * 3 = -75
    });
  });
});