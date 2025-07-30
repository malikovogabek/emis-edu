import React, { useEffect, useState, useCallback } from 'react';
import { fetchData, postData } from '../api/api';
import AddClassHourModal from '../components/AddClassHourModal';
import Loader from "../components/Loader";

const ClassHoursPage = () => {
    const [classHours, setClassHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [institutionId] = useState('10778');

    useEffect(() => {
        if (institutionId) {
            setLoading(false);
            setError(null);
        } else {
            setError("Muassasa ID'si topilmadi. Iltimos, tizimga qayta kiring.");
            setLoading(false);
        }
    }, [institutionId]);

    const loadClassHours = useCallback(async () => {

        if (!institutionId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const responseData = await fetchData(`institutions/${institutionId}/class-hours/`);


            if (responseData && responseData.success) {
                const dataToSet = responseData.results;
                if (Array.isArray(dataToSet)) {
                    setClassHours(dataToSet);
                } else if (dataToSet === null) {
                    setClassHours([]);
                    console.warn("Dars soatlari ma'lumoti topilmadi (results: null):", responseData);
                } else {
                    setError("API dan kutilgan ma'lumot formati kelmadi (results array emas): " + JSON.stringify(responseData));
                    setClassHours([]);
                    console.error("API dan kutilgan ma'lumot formati kelmadi (results array emas):", responseData);
                }
            } else {
                setError("API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(responseData));
                setClassHours([]);
                console.error("API dan kutilgan ma'lumot formati kelmadi yoki xato:", responseData);
            }
        } catch (err) {
            console.error("Dars soatlarini yuklashda xatolik:", err);
            setError("Dars soatlarini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setClassHours([]);
        } finally {
            setLoading(false);
        }
    }, [institutionId]);

    useEffect(() => {
        loadClassHours();
    }, [loadClassHours]);

    const handleAddClassHour = async (newHourData) => {
        if (!institutionId) {
            alert("Muassasa ID'si mavjud emas. Ma'lumot qo'shib bo'lmaydi.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            for (const lesson of newHourData) {
                const payload = {
                    pair_number: lesson.para,
                    begin_time: lesson.start_time,
                    end_time: lesson.end_time,
                };
                const response = await postData(`institutions/${institutionId}/class-hours/`, payload);
                if (!response.success) {
                    let errorMessage = "Yuborishda xatolik";
                    if (response.error && response.error.error && response.error.error.messages) {
                        errorMessage = response.error.error.messages;
                    } else if (response.error && response.error.messages) {
                        errorMessage = response.error.messages;
                    } else if (typeof response.error === 'string') {
                        errorMessage = response.error;
                    }
                    throw new Error(errorMessage);
                }
            }

            alert("Barcha dars soatlari muvaffaqiyatli qo'shildi!");
            setIsModalOpen(false);
            loadClassHours();
        } catch (err) {
            console.error("POST xatolik catch blokida:", err);
            alert("Dars soatini qo‘shishda xatolik: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    const renderTableContent = () => {
        if (classHours.length > 0) {
            return (
                classHours.map((hour, index) => (
                    <tr key={hour.id || index}>
                        <td>
                            {typeof hour.pair_number === 'number' && hour.pair_number >= 0
                                ? hour.pair_number + 1
                                : index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{hour.begin_time || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{hour.end_time || 'N/A'}</td>
                    </tr>
                ))
            );
        } else {
            return (
                <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            <p>Ma'lumot topilmadi</p>
                        </div>
                    </td>
                </tr>
            );
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Dars soatlari</h1>

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition duration-300"
                >
                    Shakllantirish
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Para</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boshlanish vaqti</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tugash vaqti</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {renderTableContent()}
                        </tbody>
                    </table>
                </div>
            )}

            <AddClassHourModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddClassHour}
                existingClassHours={classHours}
            />
        </div>
    );
};

export default ClassHoursPage;