import React from 'react';
import type { Settings } from '../types';
import { View } from '../types';
import { LogoutIcon } from './icons';

interface HeaderProps {
  settings: Settings;
  isLoggedIn: boolean;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ settings, isLoggedIn, onNavigate, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-20 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => onNavigate(View.Home)}
          >
            {settings.siteLogo && <img src={settings.siteLogo} alt="Site Logo" className="h-12 w-12 ml-3 object-contain" />}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{settings.siteName}</h1>
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <>
                 <button 
                  onClick={() => onNavigate(View.Admin)}
                  className="ml-4 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
                >
                  لوحة التحكم
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Logout"
                >
                    <LogoutIcon className="w-5 h-5 ml-1" />
                    تسجيل الخروج
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate(View.Login)}
                className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
              >
                دخول المسؤول
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;