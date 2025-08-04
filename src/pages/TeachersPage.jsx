import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "../api/api";
//import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useTranslation } from 'react-i18next';


const TeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    //const navigate = useNavigate();
    const { t } = useTranslation();


    const loadTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await fetchData("staffs/teachers/");
            if (responseData && responseData.success && Array.isArray(responseData.results)) {
                setTeachers(responseData.results);
            } else if (responseData && responseData.success && responseData.results === null) {
                setTeachers([]);
                console.warn("O'qituvchilar ma'lumoti topilmadi (results: null):", responseData);
            } else {
                setError("API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(responseData));
                setTeachers([]);
            }
        } catch (err) {
            console.error("O'qituvchilarni yuklashda xatolik:", err);
            setError("O'qituvchilarni yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTeachers();
    }, [loadTeachers]);

    // const handleAddNewTeacherClick = () => {
    //     navigate('/admin-process/teachers/add');
    // };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.position?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">{t("Teachers.o'qtuv_ruyx")}</h1>

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
                {/* <div>
                    <button
                        onClick={handleAddNewTeacherClick}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        + Yangi kiritish
                    </button>
                </div> */}
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : filteredTeachers.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">F.I.O</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lavozimlari</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTeachers.map((teacher, index) => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.full_name || teacher.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.position ? teacher.position.name : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.status ? teacher.status.name : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2">Tahrirlash</button>
                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">O'chirish</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                    <p className="text-gray-500 dark:text-gray-400">{t("Teachers.malumot_topil")}</p>
                </div>
            )}
        </div>
    );
};

export default TeachersPage;