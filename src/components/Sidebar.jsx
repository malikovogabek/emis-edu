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
import { useTranslation } from 'react-i18next';

const role = localStorage.getItem('selectRole')

function Sidebar() {
    const [openMenuItem, setOpenMenuItem] = useState([]);
    const { t } = useTranslation();


    const navItems = [
        {
            name: t("sidebar.admin_process"),
            icon: faTableCellsLarge,
            path: "/admin-process",
            subItems: [
                { name: t("sidebar.staffs"), path: "/admin-process/staffs" },
                { name: t("sidebar.teachers"), path: "/admin-process/teachers" },
            ],
        },
        {
            name: t("sidebar.study_process"),
            icon: faBookOpen,
            path: "/study-process",
            subItems: [
                { name: t("sidebar.directions"), path: "/study-process/directions" },
                { name: t("sidebar.plans"), path: "/study-process/plans" },
                { name: t("sidebar.groups"), path: "/study-process/groups" },
                { name: t("sidebar.students"), path: "/study-process/students" },
                { name: t("sidebar.graduates"), path: "/study-process/graduates" },
                { name: t("sidebar.lesson_hours"), path: "/study-process/lesson-hours" },
            ],
        },
        {
            name: t("sidebar.tm_info"),
            icon: faFolderOpen,
            path: "/tm-info",
            subItems: [
                { name: t("sidebar.buildings"), path: "/tm-info/buildings" },
                { name: t("sidebar.rooms"), path: "/tm-info/rooms" },
            ],
        },
        {
            name: t("sidebar.reports"),
            icon: faChartSimple,
            path: "/reports",
            subItems: [
                { name: t("sidebar.reports_teachers"), path: "/reports/teachers" },
            ],
        },
    ];

    const navItemsForTeacher = [
        {
            name: t("learning"),
            path: "/learning",
            subItems: [
                { name: t("topics"), path: "/learning/topics" },
                { name: t("classSchedule"), path: "/learning/schedule" },
                { name: t("groups"), path: "/learning/groups" },
            ],
        },
    ]

    const navs = () => {
        if (role) {
            return role === 'admin' ? navItems : navItemsForTeacher
        }

        return navItems
    }


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
                {navs().map((item) => (
                    <div key={item.name} className="mb-1">
                        <button
                            onClick={() => toggleMenuItem(item.name)}
                            className={` flex items-center justify-between w-full p-3 my-1 rounded-lg
    text-gray-700 dark:text-blue-400
    hover:bg-blue-100 dark:hover:bg-blue-700
    hover:text-blue-700 dark:hover:text-blue-200
    transition-colors duration-200
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