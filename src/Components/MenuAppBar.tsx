import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faFileExcel,
  faQuestion, // general fallback
  faArrowLeft, // for back button
  faMapMarkedAlt // for map button
} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';

export interface CustomActionButton {
  iconName: string;
  action: () => void;
  label?: string;
}

interface MenuAppBarProps {
  title: string;
  exportExcel?: boolean;
  onExportExcel?: () => void;
  onBack?: () => void; // New prop for back navigation
  customActionButtons?: CustomActionButton[]; // New prop for custom buttons
}

const iconMap: { [key: string]: IconDefinition } = {
  "map": faMapMarkedAlt,
};

const getFaIcon = (iconName: string): IconDefinition => {
  return iconMap[iconName] || faQuestion; // Fallback to a generic question mark icon
};

const MenuAppBar: React.FC<MenuAppBarProps> = ({title, exportExcel, onExportExcel, onBack, customActionButtons}) => {
  return (
    <nav className="bg-white p-4 flex items-center justify-between relative z-20 shadow-md">
      {/* Left side: Back button or Menu Toggle Button */}
      <div className="flex items-center">
        {onBack && (
          <button onClick={onBack} className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={faArrowLeft} size="lg"/>
          </button>
        )}
      </div>

      {/* Page Header */}
      <div className="flex-grow text-center">
        <h1 className="text-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate px-4">
          {title}
        </h1>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center space-x-3">
        {customActionButtons && customActionButtons.map((btn, index) => (
          <button key={index} onClick={btn.action} title={btn.label}
                  className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={getFaIcon(btn.iconName)} size="lg"/>
          </button>
        ))}
        {exportExcel && onExportExcel && (
          <button onClick={onExportExcel} title={"Export to Excel"}
                  className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={faFileExcel} size="lg"/>
          </button>
        )}
      </div>
    </nav>
  );
}

export default MenuAppBar;
