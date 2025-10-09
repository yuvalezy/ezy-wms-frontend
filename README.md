# Light WMS

A modern Warehouse Management System built with React, TypeScript, and Vite. Light WMS streamlines warehouse operations including goods receipt, picking, counting, transfers, and inventory checks.

## Features

- **Goods Receipt**: Manage incoming inventory with real-time tracking and reporting
- **Picking**: Efficient order picking workflows with supervisor oversight
- **Counting**: Inventory counting processes with summary reports
- **Transfer**: Item and bin transfers between warehouse locations
- **Inventory Check**: Real-time item, package, and bin verification
- **User Management**: Role-based access control and authorization
- **Multi-language Support**: English and Spanish translations
- **Reports**: Comprehensive reporting including difference reports and receipt vs. exit analysis

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (shadcn/ui)
- **Forms**: React Hook Form 7.62
- **HTTP Client**: Axios 1.11
- **Internationalization**: i18next, react-i18next
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Excel Export**: ExcelJS

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd light_wms
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_APP_SERVER_URL=http://localhost:5000
VITE_APP_DEBUG=false
VITE_APP_TEST=true
```

### Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:5001`

### Building

Build for production:
```bash
npm run build
```

Build with production environment:
```bash
npm run build:prod
```

Preview production build:
```bash
npm run preview
```

### Code Quality

Run ESLint:
```bash
npm run lint
```

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test:watch
```

Generate coverage report:
```bash
npm test:coverage
```

## Project Structure

```
light_wms/
├── src/
│   ├── assets/          # Static assets and menu configurations
│   ├── components/
│   │   └── ui/          # Reusable UI components (shadcn/ui)
│   ├── context/         # React Context providers (Auth, Theme)
│   ├── pages/           # Application pages/modules
│   │   ├── Counting/    # Inventory counting module
│   │   ├── GoodsReceipt/ # Goods receipt module
│   │   ├── picking/     # Order picking module
│   │   ├── transfer/    # Transfer operations module
│   │   ├── items/       # Item check utilities
│   │   └── settings/    # System settings and configuration
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions and axios instance
│   └── App.tsx          # Main application component
├── public/              # Public static files
└── package.json         # Project dependencies and scripts
```

## Architecture

### Module Pattern

Each business module follows a consistent structure:

- `Module.tsx` - List/entry view
- `ModuleProcess.tsx` - Process execution view
- `ModuleSupervisor.tsx` - Supervisor dashboard
- `components/` - Module-specific components
- `data/` - API services and mock data

### Authentication & Authorization

- JWT-based authentication stored in localStorage
- Role-based access control via `Authorization` enum
- Protected routes enforce authorization checks

### State Management

- React Context API for global state (Auth, Theme)
- No external state management library
- Loading and error states managed through `ThemeContext`

### Data Fetching

Standard pattern used across the application:

```typescript
const fetchData = async (filters) => {
  const response = await axiosInstance.post(url, filters);
  return response.data;
};
```

## Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_SERVER_URL` | Backend API endpoint | `http://localhost:5000` |
| `VITE_APP_DEBUG` | Enable debug logging | `false` |
| `VITE_APP_TEST` | Enable test mode with mock data | `true` |

## Contributing

### Adding a New Module

1. Create folder structure under `src/pages/ModuleName/`
2. Implement list, process, and supervisor views as needed
3. Add routing in `App.tsx` with appropriate authorization
4. Create data services following the pattern in other modules
5. Add navigation menu items in `src/assets/useMenus.tsx`

### Working with Forms

- Use React Hook Form with existing form components
- Follow validation patterns from existing modules
- Handle errors through `ThemeContext.setError()`

### API Integration

- Use `axiosInstance` from `src/utils/axios-instance.ts`
- Implement both real and mock data paths
- Follow existing error handling patterns

### Code Standards

- Keep files under 500 lines (refactor if larger)
- Follow SOLID principles
- Never change enum number values
- Include icons in buttons
- Prefix placeholder comments with `TODO:`

## Browser Support

### Production
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development
- Latest Chrome
- Latest Firefox
- Latest Safari

## License

Private - All rights reserved

## Support

For issues and feature requests, please contact the development team.