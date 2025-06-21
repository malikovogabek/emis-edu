import React, { useEffect, useState } from 'react';
import { fetchData, postData } from '../api/api';
import AddClassHourModal from '../components/AddClassHourModal';
import Loader from "../components/Loader";

const ClassHoursPage = () => {
    const [classHours, setClassHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [institutionId, setInstitutionId] = useState(null);

    useEffect(() => {
        const storedInstitutionId = localStorage.getItem('');
        if (storedInstitutionId) {
            setInstitutionId(storedInstitutionId);
        } else {
            setError("Muassasa ID'si topilmadi. Iltimos, tizimga qayta kiring.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadClassHours = async () => {
            if (!institutionId) {

                if (!error && !loading) setLoading(true);
                return;
            }

            try {
                const responseData = await fetchData(`institutions/${institutionId}/class-hours/`);

                if (responseData && responseData.success && Array.isArray(responseData.results)) {
                    setClassHours(responseData.results);
                } else if (responseData && responseData.success && responseData.results === null) {
                    setClassHours([]);
                    console.warn("Dars soatlari ma'lumoti topilmadi (results: null):", responseData);
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
        };

        loadClassHours();
    },);

    const handleAddClassHour = async (newHourData) => {
        if (!institutionId) {
            alert("Muassasa ID'si mavjud emas. Ma'lumot qo'shib bo'lmaydi.");
            return;
        }
        try {
            // Yangi dars soatini POST qilish
            const response = await postData(`institutions/${institutionId}/class-hours/`, newHourData);
            if (response && response.success) {
                alert("Dars soati muvaffaqiyatli qo'shildi!");
                // Jadvalni yangilash uchun ma'lumotni qayta yuklash
                setLoading(true);
                const updatedResponse = await fetchData(`institutions/${institutionId}/class-hours/`);
                if (updatedResponse && updatedResponse.success && Array.isArray(updatedResponse.results)) {
                    setClassHours(updatedResponse.results);
                }
            } else {
                alert("Dars soatini qo'shishda xatolik yuz berdi: " + (response.error || "Noma'lum xato"));
            }
        } catch (err) {
            console.error("Dars soatini qo'shishda xatolik:", err);
            alert("Dars soatini qo'shishda server xatoligi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false); // Yuklashni tugatish
            setIsModalOpen(false); // Modalni yopish
        }
    };

    const renderTableContent = () => {
        if (classHours.length > 0) {
            return (
                classHours.map((hour, index) => (
                    <tr key={hour.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{hour.para || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{hour.start_time || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{hour.end_time || 'N/A'}</td>
                    </tr>
                ))
            );
        } else {
            return (
                <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                            {/* <img src="/src/assets/no_data_icon.svg" alt="Ma'lumot topilmadi" className="w-16 h-16 mb-2 dark:filter dark:invert" /> */}
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

            {/* "Shakllantirish" tugmasini qo'shish */}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
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

            {/* Modal komponenti */}
            <AddClassHourModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddClassHour}
            />
        </div>
    );
};

export default ClassHoursPage;