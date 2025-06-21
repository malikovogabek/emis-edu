import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTableCellsLarge,
    faBookOpen,
    faFolderOpen,
    faChartSimple,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [openMenuItem, setOpenMenuItem] = useState([]);

    const navItems = [
        {
            name: "Ma'muriy jarayon TM",
            icon: faTableCellsLarge,
            path: "/admin-process",
            subItems: [
                { name: "- Xodimlar", path: "/admin-process/staffs" },
                { name: "- O'qituvchilar", path: "/admin-process/teachers" },
            ],
        },
        {
            name: "O'quv jarayon TM",
            icon: faBookOpen,
            path: "/study-process",
            subItems: [
                { name: "- Yo'nalishlar", path: "/study-process/directions" },
                { name: "- O'quv rejalar", path: "/study-process/plans" },
                { name: "- Guruhlar", path: "/study-process/groups" },
                { name: "- Talabalar", path: "/study-process/students" },
                { name: "- Bitiruvchilar", path: "/study-process/graduates" },
                { name: "- Dars soatlari", path: "/study-process/lesson-hours" },
            ],
        },
        {
            name: "TM ma'lumotlari",
            icon: faFolderOpen,
            path: "/tm-info",
            subItems: [
                { name: "- Bino korpus", path: "/tm-info/buildings" },
                { name: "- Xona", path: "/tm-info/rooms" },
            ],
        },
        {
            name: "Hisobotlar",
            icon: faChartSimple,
            path: "/reports",
            subItems: [
                { name: "- O'qituvchilar", path: "/reports/teachers" },
            ],
        },
    ];


    const toggleMenuItem = (itemName) => {
        setOpenMenuItem((prevOpen) =>
            prevOpen.includes(itemName)
                ? prevOpen.filter(name => name !== itemName)
                : [...prevOpen, itemName]
        );
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md overflow-y-auto pt-4 flex-shrink-0 min-h-full">
            <nav className="flex flex-col p-4">
                {navItems.map((item) => (
                    <div key={item.name} className="mb-1">
                        <button
                            onClick={() => toggleMenuItem(item.name)}
                            className={`flex items-center justify-between w-full p-3 my-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200
                ${openMenuItem.includes(item.name) ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : ''}
              `}
                        >
                            <div className="flex items-center space-x-3">
                                <FontAwesomeIcon icon={item.icon} className="text-xl" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </div>
                            <FontAwesomeIcon
                                icon={openMenuItem.includes(item.name) ? faChevronUp : faChevronDown}
                                className="text-xs ml-2"
                            />
                        </button>
                        {item.subItems && openMenuItem.includes(item.name) && (
                            <div className="flex flex-col pl-8 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1">
                                {item.subItems.map((subItem) => (
                                    <NavLink
                                        key={subItem.path}
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                            `block p-2 my-0.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-800 dark:hover:text-blue-100 transition-colors duration-200
                      ${isActive ? 'bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-blue-100 font-semibold' : ''}`
                                        }
                                    >
                                        {subItem.name}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;