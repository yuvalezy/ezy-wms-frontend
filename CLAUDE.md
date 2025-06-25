# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server**
```bash
npm start
```
Runs the Vite development server on http://localhost:5001

**Build for Production**
```bash
npm run build
```
Creates optimized production build with TypeScript compilation

**Lint Code**
```bash
npm run lint
```
Runs ESLint with TypeScript support, fails on warnings

**Preview Production Build**
```bash
npm run preview
```
Locally preview the production build

## Architecture Overview

This is a Light WMS (Warehouse Management System) built with React, TypeScript, and Vite. The application manages warehouse operations including goods receipt, picking, counting, transfers, and inventory checks.

### Key Architectural Patterns

1. **Module Structure**: Each business domain (GoodsReceipt, Picking, Counting, Transfer, etc.) follows a consistent pattern:
   - `Module.tsx` - List/entry view
   - `ModuleProcess.tsx` - Process execution view
   - `ModuleSupervisor.tsx` - Supervisor dashboard
   - `components/` - Module-specific components
   - `data/` - API services and mock data

2. **Authentication & Authorization**:
   - JWT-based authentication stored in localStorage
   - Role-based access control via `Authorization` enum
   - Protected routes enforce authorization checks

3. **State Management**:
   - React Context API for global state (Auth, Theme)
   - No external state management library
   - Loading and error states managed through `ThemeContext`

4. **UI Framework**:
   - Tailwind CSS for styling
   - shadcn/ui components (Radix UI based) in `src/components/ui/`
   - Consistent use of Card, Form, and Table components across modules

5. **Data Fetching Pattern**:
   ```typescript
   const fetchData = async (filters) => {
     const response = await axiosInstance.post(url, filters);
     return response.data;
   };
   ```

6. **Environment Configuration**:
   - `VITE_APP_SERVER_URL` - API endpoint
   - `VITE_APP_DEBUG` - Debug logging
   - `VITE_APP_TEST` - Test mode

### Working with Business Modules

When adding new features or modifying existing modules:

1. Follow the established file structure pattern
2. Use existing UI components from `src/components/ui/`
3. Implement mock data for offline development
4. Add translations to both English and Spanish files
5. Ensure proper authorization checks for new routes
6. Use React Hook Form for complex forms
7. Handle loading states through `ThemeContext`

### Common Development Tasks

**Adding a New Module**:
1. Create folder structure under `src/pages/ModuleName/`
2. Implement list, process, and supervisor views as needed
3. Add routing in `App.tsx` with appropriate authorization
4. Create data services following the pattern in other modules
5. Add navigation menu items in `src/assets/Menus.tsx`

**Working with Forms**:
- Use React Hook Form with the existing form components
- Follow validation patterns from existing modules
- Handle errors through `ThemeContext.setError()`

**API Integration**:
- Use `axiosInstance` from `src/utils/axios-instance.ts`
- Implement both real and mock data paths
- Follow existing error handling patterns