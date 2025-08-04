import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "../api/api";
import StaffList from "../components/Staff/StaffList";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useTranslation } from 'react-i18next';


const StaffPage = () => {
    const [staffData, setStaffData] = useState({
        staffs: [],
        positions: [],
        teachers: [],
        workForms: [],
        staffById: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { t } = useTranslation();


    const loadStaffData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [staffsResponse] = await Promise.all([
                fetchData("staffs/"),
            ]);

            setStaffData({
                staffs: staffsResponse?.success && Array.isArray(staffsResponse.results) ? staffsResponse.results : [],

            });
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message || err.toString()));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaffData();
    }, [loadStaffData]);

    const handleAddNewStaffClick = () => {
        navigate('/admin-process/staffs/add');
    };

    const filteredStaffs = staffData.staffs.filter(staff =>
        staff.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">{t("staffsAdd.xodim_ruy")}</h1>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <input
                        type="text"
                        placeholder={t("staffsAdd.qidrish")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div>
                    <button
                        onClick={handleAddNewStaffClick}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        {t("staffsAdd.yangi_kiritsh")}
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : filteredStaffs.length > 0 ? (
                <StaffList staffData={staffData} />
            ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
                    <svg
                        className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">{t("staffsAdd.xatolik")}</p>
                </div>
            )}
        </div>
    );
};

export default StaffPage;