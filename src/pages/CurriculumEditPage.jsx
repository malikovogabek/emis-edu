import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../api/api';
import Loader from '../components/Loader';

const CurriculumEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curriculumData, setCurriculumData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const getUzName = (obj) => {
        return obj && obj.uz ? obj.uz : '';
    };
    const fetchCurriculumForEdit = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await fetchData(`curriculums/${id}/`);
            if (responseData && responseData.success && responseData.result) {
                setCurriculumData({
                    id: responseData.result.id,
                    name: responseData.result.name,
                    edu_direction_id: responseData.result.edu_direction_id,
                    start_year_code: responseData.result.start_year_code,
                    end_year_code: responseData.result.end_year_code,
                    edu_form_id: responseData.result.edu_form_id,
                    edu_language_id: responseData.result.edu_language_id,
                    rating_type_id: responseData.result.rating_type_id,
                    speciality: getUzName(responseData.result.speciality),
                });
            } else {
                setError("O'quv rejasi ma'lumotlarini yuklashda xato: " + JSON.stringify(responseData));
            }
        } catch (err) {
            console.error("O'quv rejasini tahrirlash uchun ma'lumot yuklashda xatolik:", err);
            setError("O'quv rejasini tahrirlash uchun ma'lumot yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCurriculumForEdit();
    }, [fetchCurriculumForEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurriculumData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            console.log("Ma'lumotlar saqlanmoqda:", curriculumData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("O'quv rejasi muvaffaqiyatli tahrirlandi!");
            navigate(`/study-process/plans/details/${id}`);
        } catch (err) {
            console.error("Ma'lumotlarni saqlashda xatolik:", err);
            setError("Ma'lumotlarni saqlashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-red-600 dark:text-red-400">
                <p>Xato: {error}</p>
                <button
                    onClick={() => navigate(`/study-process/plans/details/${id}`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Orqaga qaytish
                </button>
            </div>
        );
    }

    if (!curriculumData) {
        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
                <p>Tahrirlash uchun ma'lumotlar mavjud emas.</p>
                <button
                    onClick={() => navigate(`/study-process/plans/details/${id}`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Orqaga qaytish
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100 max-h-screen overflow-y-auto">
            <div className='p-3'>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200 mr-2"
                >
                    Saqlash
                </button>
                <button
                    onClick={() => navigate(`/study-process/plans/details/${id}`)}
                    className="px-4 py-2 bg-white text-red-600 text-sm rounded-md  transition duration-200"
                >
                    &larr; Orqaga
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">O'quv rejasini tahrirlash</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">O'quv reja nomi:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={curriculumData.name || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="edu_direction_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ta'lim yo'nalishi:</label>
                            <select
                                id="edu_direction_id"
                                name="edu_direction_id"
                                value={curriculumData.edu_direction_id || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="2">Aniq fanlar-1</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="start_year_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birinchi o'quv yili:</label>
                            <select
                                id="start_year_code"
                                name="start_year_code"
                                value={curriculumData.start_year_code || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="2022">2022-2023-o‘quv yili</option>
                                <option value="2023">2023-2024-o‘quv yili</option>

                            </select>
                        </div>


                        <div>
                            <label htmlFor="end_year_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oxirgi o'quv yili:</label>
                            <select
                                id="end_year_code"
                                name="end_year_code"
                                value={curriculumData.end_year_code || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="2023">2023-2024-o‘quv yili</option>
                                <option value="2024">2024-2025-o‘quv yili</option>

                            </select>
                        </div>


                        <div>
                            <label htmlFor="edu_form_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ta'lim shakli:</label>
                            <select
                                id="edu_form_id"
                                name="edu_form_id"
                                value={curriculumData.edu_form_id || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="1">Kunduzgi</option>


                            </select>
                        </div>

                        <div>
                            <label htmlFor="edu_language_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ta'lim tili:</label>
                            <select
                                id="edu_language_id"
                                name="edu_language_id"
                                value={curriculumData.edu_language_id || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="1">O'zbek tili</option>
                                <option value="2">Rus tili</option>

                            </select>
                        </div>


                        <div>
                            <label htmlFor="rating_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Baholash tizimi:</label>
                            <select
                                id="rating_type_id"
                                name="rating_type_id"
                                value={curriculumData.rating_type_id || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tanlang</option>
                                <option value="1">Baholik</option>

                            </select>
                        </div>

                        <div>
                            <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mutaxassislik:</label>
                            <input
                                type="text"
                                id="speciality"
                                name="speciality"
                                value={curriculumData.speciality || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CurriculumEditPage;