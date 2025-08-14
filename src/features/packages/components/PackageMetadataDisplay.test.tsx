import React from 'react';
import { render, screen } from '@testing-library/react';
import { PackageMetadataDisplay } from './PackageMetadataDisplay';
import { PackageDto, PackageStatus, MetadataFieldType } from '../types';
import {MetadataDefinition} from "@/features/items";

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'packages.noMetadataFieldsConfigured': 'No metadata fields configured',
        'packages.noMetadataValues': 'No metadata values set',
        'packages.metadata': 'Metadata',
        'text': 'Text',
        'number': 'Number', 
        'date': 'Date',
        'unknown': 'Unknown',
        'notSet': 'Not set'
      };
      return translations[key] || key;
    }
  })
}));

const createMockPackage = (
  metadataDefinitions: MetadataDefinition[] = [],
  customAttributes = {}
): PackageDto => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  barcode: 'PKG001',
  status: PackageStatus.Active,
  whsCode: 'WH01',
  binEntry: 1,
  binCode: 'A001',
  createdAt: new Date('2025-01-01'),
  closedAt: undefined,
  closedBy: undefined,
  notes: undefined,
  customAttributes,
  contents: [],
  locationHistory: [],
  createdBy: {
    id: 'user-123',
    name: 'Test User'
  }
});

describe('PackageMetadataDisplay', () => {
  test('renders no metadata fields message when no definitions exist', () => {
    const packageData = createMockPackage();
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('No metadata fields configured')).toBeInTheDocument();
  });

  test('renders metadata fields with values', () => {
    const metadataDefinitions = [
      { id: 'volume', description: 'Volume', type: MetadataFieldType.Decimal, required: false, readOnly: false },
      { id: 'note', description: 'Note', type: MetadataFieldType.String, required: false, readOnly: false },
      { id: 'expiryDate', description: 'Expiry Date', type: MetadataFieldType.Date, required: false, readOnly: false }
    ];

    const customAttributes = {
      volume: 10.5,
      note: 'Test note',
      expiryDate: '2025-12-31T00:00:00Z'
    };

    const packageData = createMockPackage(metadataDefinitions, customAttributes);
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByText('10.5')).toBeInTheDocument();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  test('renders no values message when fields exist but no values set', () => {
    const metadataDefinitions = [
      { id: 'volume', description: 'Volume', type: MetadataFieldType.Decimal, required: false, readOnly: false }
    ];

    const packageData = createMockPackage(metadataDefinitions, {});
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('No metadata values set')).toBeInTheDocument();
  });

  test('renders field type badges correctly', () => {
    const metadataDefinitions = [
      { id: 'volume', description: 'Volume', type: MetadataFieldType.Decimal, required: false, readOnly: false },
      { id: 'note', description: 'Note', type: MetadataFieldType.String, required: false, readOnly: false },
      { id: 'expiryDate', description: 'Expiry Date', type: MetadataFieldType.Date, required: false, readOnly: false }
    ];

    const customAttributes = {
      volume: 10.5,
      note: 'Test note',
      expiryDate: '2025-12-31T00:00:00Z'
    };

    const packageData = createMockPackage(metadataDefinitions, customAttributes);
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  test('handles null values gracefully', () => {
    const metadataDefinitions  = [
      { id: 'volume', description: 'Volume', type: MetadataFieldType.Decimal, required: false, readOnly: false }
    ];

    const customAttributes = {
      volume: null
    };

    const packageData = createMockPackage(metadataDefinitions, customAttributes);
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  test('renders metadata title', () => {
    const metadataDefinitions = [
      { id: 'volume', description: 'Volume', type: MetadataFieldType.Decimal, required: false, readOnly: false }
    ];

    const customAttributes = { volume: 10.5 };
    const packageData = createMockPackage(metadataDefinitions, customAttributes);
    
    render(<PackageMetadataDisplay packageData={packageData} />);
    
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });
});