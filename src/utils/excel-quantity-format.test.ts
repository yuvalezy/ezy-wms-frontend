import {ExcelQuantityFormatParams, formatQuantityForExcel} from './excel-quantity-format';

describe('formatQuantityForExcel', () => {
  const baseParams = {
    purPackUn: 4,
    numInBuy: 12
  };

  describe('Positive quantities', () => {
    test('should format quantity 576 correctly', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 576
      };

      const result = formatQuantityForExcel(params);

      // 576 ÷ (12 × 4) = 576 ÷ 48 = 12 packs, 0 dozens, 0 units
      expect(result).toEqual({
        pack: 12,
        dozen: 0,
        unit: 0
      });
    });

    test('should format quantity 612 correctly', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 612
      };

      const result = formatQuantityForExcel(params);

      // 612 ÷ 48 = 12 packs remainder 36
      // 36 ÷ 12 = 3 dozens remainder 0
      expect(result).toEqual({
        pack: 12,
        dozen: 3,
        unit: 0
      });
    });

    test('should format quantity 467 correctly', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 467
      };

      const result = formatQuantityForExcel(params);

      // 467 ÷ 48 = 9 packs remainder 35
      // 35 ÷ 12 = 2 dozens remainder 11
      expect(result).toEqual({
        pack: 9,
        dozen: 2,
        unit: 11
      });
    });

    test('should format quantity with units remainder', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 617
      };

      const result = formatQuantityForExcel(params);

      // 617 ÷ 48 = 12 packs remainder 41
      // 41 ÷ 12 = 3 dozens remainder 5
      expect(result).toEqual({
        pack: 12,
        dozen: 3,
        unit: 5
      });
    });
  });

  describe('Negative quantities', () => {
    test('should format quantity -36 correctly', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: -36
      };

      const result = formatQuantityForExcel(params);

      // 36 ÷ 48 = 0 packs remainder 36
      // 36 ÷ 12 = 3 dozens remainder 0
      // Apply negative sign (0 values remain 0)
      expect(result).toEqual({
        pack: 0,
        dozen: -3,
        unit: 0
      });
    });

    test('should format quantity -2 correctly', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: -2
      };

      const result = formatQuantityForExcel(params);

      // 2 ÷ 48 = 0 packs remainder 2
      // 2 ÷ 12 = 0 dozens remainder 2
      // Apply negative sign (0 values remain 0)
      expect(result).toEqual({
        pack: 0,
        dozen: 0,
        unit: -2
      });
    });

    test('should format negative quantity with all components', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: -617
      };

      const result = formatQuantityForExcel(params);

      // Same calculation as positive 617 but with negative sign
      expect(result).toEqual({
        pack: -12,
        dozen: -3,
        unit: -5
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle zero quantity', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 0
      };

      const result = formatQuantityForExcel(params);

      expect(result).toEqual({
        pack: 0,
        dozen: 0,
        unit: 0
      });
    });

    test('should handle quantity less than one dozen', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 8
      };

      const result = formatQuantityForExcel(params);

      expect(result).toEqual({
        pack: 0,
        dozen: 0,
        unit: 8
      });
    });

    test('should handle exactly one dozen', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 12
      };

      const result = formatQuantityForExcel(params);

      expect(result).toEqual({
        pack: 0,
        dozen: 1,
        unit: 0
      });
    });

    test('should handle exactly one pack', () => {
      const params: ExcelQuantityFormatParams = {
        ...baseParams,
        quantity: 48 // 12 × 4
      };

      const result = formatQuantityForExcel(params);

      expect(result).toEqual({
        pack: 1,
        dozen: 0,
        unit: 0
      });
    });
  });

  describe('Different packaging configurations', () => {
    test('should work with different purPackUn and numInBuy values', () => {
      const params: ExcelQuantityFormatParams = {
        purPackUn: 6,
        numInBuy: 10,
        quantity: 126
      };

      const result = formatQuantityForExcel(params);

      // 126 ÷ (10 × 6) = 126 ÷ 60 = 2 packs remainder 6
      // 6 ÷ 10 = 0 dozens remainder 6
      expect(result).toEqual({
        pack: 2,
        dozen: 0,
        unit: 6
      });
    });
  });
});