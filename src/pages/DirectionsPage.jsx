import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "../api/api";
import Loader from "../components/Loader";
import { useTranslation } from 'react-i18next';


const DirectionsPage = () => {
    const [directions, setDirections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();


    const loadDirections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await fetchData("edu-directions/");
            if (responseData && responseData.success && Array.isArray(responseData.results)) {
                setDirections(responseData.results);
            } else if (responseData && responseData.success && responseData.results === null) {
                setDirections([]);
                console.warn("Ta'lim yo'nalishlari ma'lumoti topilmadi (results: null):", responseData);
            } else {
                setError("API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(responseData));
                setDirections([]);
                console.error("API dan kutilgan ma'lumot formati kelmadi yoki xato:", responseData);
            }
        } catch (err) {
            console.error("Ta'lim yo'nalishlarini yuklashda xatolik:", err);
            setError("Ta'lim yo'nalishlarini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setDirections([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDirections();
    }, [loadDirections]);

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : directions.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                    <h1 className="text-xl font-bold mb-4">{t("Directions.yo'nalishlar")}</h1>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("Directions.talim_yunalsh")}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("Directions.talim_yunalsh_kodi")}</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {directions.map((direction, index) => (
                                <tr key={direction.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{direction.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{direction.code || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

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

export default DirectionsPage;