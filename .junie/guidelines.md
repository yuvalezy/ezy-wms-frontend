# Light WMS - Project Guidelines

## Project Overview
Light WMS is a lightweight Warehouse Management System built with React and TypeScript. The application helps manage warehouse operations including goods receipt, inventory counting, bin checking, item verification, order picking, and inventory transfers.

## Project Structure
- **src/assets**: Static files like images and icons
- **src/components**: Reusable UI components
- **src/hooks**: Custom React hooks
- **src/lib**: Utility libraries
- **src/pages**: Page components organized by feature:
  - **BinCheck**: Bin/location verification
  - **Counting**: Inventory counting
  - **GoodsReceipt**: Receiving goods
  - **ItemCheck**: Item verification
  - **login**: User authentication
  - **picking**: Order picking process
  - **transfer**: Inventory transfers
- **src/translations**: Internationalization files
- **src/utils**: Utility functions

## Technology Stack
- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Routing**: React Router
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Internationalization**: i18next
- **File Handling**: XLSX for Excel files, File-saver for downloads

## Development Guidelines
1. **Code Style**: Follow ESLint rules configured in the project
2. **Testing**: Write tests using Jest and React Testing Library
3. **Naming Conventions**: 
   - Use PascalCase for component files and folders
   - Use camelCase for utility functions and hooks
4. **Component Structure**: Keep components focused on a single responsibility
5. **State Management**: Use React hooks for local state, consider context for shared state

## Testing
- Run tests with `npm test`
- Ensure all tests pass before submitting changes
- Write tests for new features and bug fixes

## Building
- Build the project with `npm run build` before submitting
- Ensure there are no TypeScript errors or ESLint warnings

## Deployment
- The application is built for production using `npm run build`
- The build output is in the `dist` folder
