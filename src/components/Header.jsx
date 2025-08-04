import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const handleChangeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm h-20 gap-8 flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center flex-1">
                <div className="flex items-center gap-8 space-x-4">
                    <img
                        src="https://emis.e-edu.uz/assets/logo_text_light-9BXUoXJk.png"
                        alt="EMIS Logo"
                        className="h-20 w-auto"
                    />
                    <span className="text-gray-700 dark:text-gray-200 font-semibold text-base whitespace-nowrap overflow-hidden text-ellipsis flex-grow">
                        {t('litsey_name')}
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative">
                    <select
                        onChange={handleChangeLanguage}
                        defaultValue={i18n.language}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                        <option value="uzbek">O'zbek</option>
                        <option value="russian">Русский</option>
                        <option value="english">English</option>
                    </select>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600">
                        <span className="text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">
                            {
                                i18n.language === 'uzbek' ? "O'zbek" :
                                    i18n.language === 'russian' ? "Русский" :
                                        "English"
                            }
                        </span>
                        <svg className="fill-current h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>

                <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className={`relative w-10 h-5 transition duration-200 ease-in-out bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-gray-300 w-4 h-4 rounded-full shadow transform transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-full' : ''}`}></span>
                    </span>
                </label>

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm whitespace-nowrap">
                            {t('isim')}
                        </span>
                        <img
                            src="https://lh3.googleusercontent.com/a/ACg8ocJD-qntVFSSWxNEtmmWz2m0G8ra_ymBIXYN_mARX_lVXYkrSx4=s576-c-no"
                            className="h-10 w-10 rounded-full border-2 border-blue-500"
                            alt="User Profile"
                        />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-600">
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                {t('admin')}
                            </a>
                            <button
                                onClick={() => {
                                    console.log("Foydalanuvchi tizimdan chiqdi!");
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3v-7a3 3 0 013-3h10a3 3 0 013 3v1"></path></svg>
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
