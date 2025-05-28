import * as React from 'react';
import {useAuth} from "./AppContext";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {MenuItem, useMenus} from "../assets/Menus";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faFileExcel,
  faSignOutAlt,
  faCheckCircle, // complete
  faCube, // dimension
  faClipboardList, // cause
  faChartBar, // kpi-managing-my-area
  faChartLine, // manager-insight
  faShoppingCart, // cart-2
  faBox, // product
  faIndustry, // factory
  faArrowsAlt, // move
  faTruckMoving, // journey-depart
  faQuestionCircle, // request (fallback/generic)
  faQuestion, // general fallback
  faArrowLeft, // for back button
  faMapMarkedAlt // for map button
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
  "complete": faCheckCircle,
  "dimension": faCube,
  "cause": faClipboardList,
  "kpi-managing-my-area": faChartBar,
  "manager-insight": faChartLine,
  "cart-2": faShoppingCart,
  "product": faBox,
  "factory": faIndustry,
  "move": faArrowsAlt,
  "journey-depart": faTruckMoving,
  "request": faQuestionCircle,
  "map": faMapMarkedAlt, // Added map icon
  // Add more mappings as needed based on UI5 icons
};

const getFaIcon = (iconName: string): IconDefinition => {
  return iconMap[iconName] || faQuestion; // Fallback to a generic question mark icon
};

const MenuAppBar: React.FC<MenuAppBarProps> = ({title, exportExcel, onExportExcel, onBack, customActionButtons}) => {
  const menus = useMenus();
  const [authorizedMenus, setAuthorizedMenus] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const {logout, user} = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setAuthorizedMenus(menus.GetMenus(user?.authorizations));
  }, [user, menus]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (link: string) => {
    navigate(link);
    setIsMenuOpen(false); // Close menu after navigation
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close menu after logout
  };

  return (
    <nav className="bg-white p-4 flex items-center justify-between relative z-20 shadow-md">
      {/* Left side: Back button or Menu Toggle Button */}
      <div className="flex items-center">
        {onBack ? (
          <button onClick={onBack} className="text-gray-800 focus:outline-none cursor-pointer mr-3">
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
        ) : (
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={faBars} size="lg" />
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
          <button key={index} onClick={btn.action} title={btn.label} className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={getFaIcon(btn.iconName)} size="lg" />
          </button>
        ))}
        {exportExcel && onExportExcel && (
          <button onClick={onExportExcel} title={"Export to Excel"} className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={faFileExcel} size="lg" />
          </button>
        )}
      </div>

      {/* Sidebar Menu (only if no back button) */}
      {!onBack && (
        <>
          <div className={`fixed top-0 left-0 h-full bg-white text-gray-800 w-64 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30 flex flex-col shadow-lg`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none cursor-pointer">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <ul className="flex flex-col p-4">
          {authorizedMenus.map((item, index) => (
            <li key={index} className="mb-2">
              <button
                onClick={() => handleMenuItemClick(item.Link)}
                className={`flex items-center w-full text-left p-2 rounded hover:bg-gray-200 ${location.pathname === item.Link ? 'bg-gray-200' : ''} cursor-pointer`}
              >
                <FontAwesomeIcon icon={getFaIcon(item.Icon)} className="mr-3" />
                {item.Text}
              </button>
            </li>
          ))}
          <li className="mb-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout
            </button>
          </li>
        </ul>
      </div>
      {/* Overlay for mobile when menu is open */}
      {isMenuOpen && !onBack && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={toggleMenu}
        ></div>
      )}
      </>
      )}
    </nav>
  );
}

export default MenuAppBar;
