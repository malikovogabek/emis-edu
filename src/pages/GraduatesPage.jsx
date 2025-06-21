import React, { useEffect, useState } from 'react';
import { fetchData } from '../api/api';
import Loader from "../components/Loader";

const GraduatesPage = () => {
    const [graduates, setGraduates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGraduates = async () => {
            try {
                const responseData = await fetchData('graduates/');

                if (responseData && responseData.success && Array.isArray(responseData.results)) {
                    setGraduates(responseData.results);
                } else if (responseData && responseData.success && responseData.results === null) {
                    setGraduates([]);
                    console.warn("Bitiruvchilar ma'lumoti topilmadi (results: null):", responseData);
                } else {
                    setError("API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(responseData));
                    setGraduates([]);
                    console.error("API dan kutilgan ma'lumot formati kelmadi yoki xato:", responseData);
                }
            } catch (err) {
                console.error("Bitiruvchilarni yuklashda xatolik:", err);
                setError("Bitiruvchilarni yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
                setGraduates([]);
            } finally {
                setLoading(false);
            }
        };

        loadGraduates();
    }, []);

    const renderTableContent = () => {
        if (graduates.length > 0) {
            return (
                graduates.map((graduate, index) => (
                    <tr key={graduate.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.group_name || graduate.group?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.curriculum_name || graduate.curriculum?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.direction_name || graduate.direction?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.course || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.semester || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.academic_year || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{graduate.status || 'N/A'}</td>
                    </tr>
                ))
            );
        } else {
            // Ma'lumot yo'qligida chiqadigan qator
            return (
                <tr>
                    <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            {/* SVG ikonkani ham dark mode'ga moslash uchun style yoki class berishingiz mumkin */}
                            {/* Agar ikonka SVG bo'lsa va rangini o'zgartira olsa, `fill-current text-gray-500 dark:text-gray-300` kabi klasslar berish mumkin */}
                            <img src="/src/assets/no_data_icon.svg" alt="Ma'lumot topilmadi" className="w-16 h-16 mb-2 dark:filter dark:invert" />
                            <p>Ma'lumot topilmadi</p>
                        </div>
                    </td>
                </tr>
            );
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Bitiruvchilar</h1>
            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruh nomi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">O'quv reja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">O'quv yo'nalishi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kurs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semestr</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ochiligan O'quv Yili</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {renderTableContent()}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GraduatesPage;