import React, { useState, useEffect } from 'react';
import { postData, fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AddStudyGroupPage = () => {
    const [newGroupData, setNewGroupData] = useState({
        name: '',
        curriculum: '',
        start_year_code: '',
        edu_form_id: 1,
        edu_language_id: 1,
        current_semester: 1,
        institution_id: 10778,
        speciality: { uz: " ", ru: " ", en: " " },
        status: "APPROVED"
    });

    const [curriculumsOptions, setCurriculumsOptions] = useState([]);
    const [startYearsOptions, setStartYearsOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadFormOptions = async () => {
            setLoading(true);
            try {
                const curriculumsResponse = await fetchData('curriculums/');
                if (curriculumsResponse.success && Array.isArray(curriculumsResponse.results)) {
                    setCurriculumsOptions(curriculumsResponse.results);
                } else {
                    console.error("O'quv rejalari yuklashda xato:", curriculumsResponse.error || JSON.stringify(curriculumsResponse));
                    setSubmitError("O'quv rejalarini yuklashda xatolik.");
                }

                const startYearsResponse = await fetchData('edu-years/');
                if (startYearsResponse.success && Array.isArray(startYearsResponse.results)) {
                    setStartYearsOptions(startYearsResponse.results);
                } else {
                    console.error("O'quv yillari yuklashda xato:", startYearsResponse.error || JSON.stringify(startYearsResponse));
                    setSubmitError("O'quv yillarini yuklashda xatolik.");
                }
            } catch (err) {
                console.error("Forma ma'lumotlarini yuklashda xatolik:", err);
                setSubmitError("Forma uchun ma'lumotlarni yuklashda xatolik yuz berdi: " + (err.message || 'Nomaʼlum xato'));
            } finally {
                setLoading(false);
            }
        };
        loadFormOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGroupData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setPostSuccess(null);
        setLoading(true);

        const payload = {
            name: newGroupData.name,
            curriculum: parseInt(newGroupData.curriculum),
            start_year_code: parseInt(newGroupData.start_year_code),
            edu_form_id: newGroupData.edu_form_id,
            edu_language_id: newGroupData.edu_language_id,
            current_semester: parseInt(newGroupData.current_semester),
            institution_id: newGroupData.institution_id,
            speciality: newGroupData.speciality,
            status: newGroupData.status,
        };

        try {
            const response = await postData('edu-groups/', payload);

            if (response.success) {
                setPostSuccess("Yangi guruh muvaffaqiyatli qo'shildi!");
                setNewGroupData({
                    name: '',
                    curriculum: '',
                    start_year_code: '',
                    edu_form_id: 1,
                    edu_language_id: 1,
                    current_semester: 1,
                    institution_id: 10778,
                    speciality: { uz: " ", ru: " ", en: " " },
                    status: "APPROVED"
                });
                setTimeout(() => {
                    navigate('/study-process/groups');
                }, 1500);
            } else {
                let errorMessage = "Noma'lum xato";
                if (response.error) {
                    errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                    if (response.error.detail) errorMessage = response.error.detail;
                    else if (response.error.message) errorMessage = response.error.message;
                    else if (response.error.non_field_errors) errorMessage = response.error.non_field_errors.join(', ');
                    else errorMessage = JSON.stringify(response.error);
                }
                setSubmitError("Guruh qo'shishda xato: " + errorMessage);
                console.error("Guruh qo'shishda xato javobi:", response);
            }
        } catch (err) {
            console.error("Guruh qo'shishda tarmoq xatosi:", err);
            setSubmitError("Guruh qo'shishda tarmoq xatosi yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">Yuklanmoqda...</p>;
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi Guruh Qo'shish</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guruh nomi</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newGroupData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700 dark:text-gray-300">O'quv rejasi</label>
                            <select
                                id="curriculum"
                                name="curriculum"
                                value={newGroupData.curriculum}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                required
                            >
                                <option value="">Tanlang...</option>
                                {curriculumsOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start_year_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ochilgan o'quv yili</label>
                            <select
                                id="start_year_code"
                                name="start_year_code"
                                value={newGroupData.start_year_code}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                required
                            >
                                <option value="">Tanlang...</option>
                                {startYearsOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="current_semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joriy semestr</label>
                            <input
                                type="number"
                                id="current_semester"
                                name="current_semester"
                                value={newGroupData.current_semester}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                required
                                min="1"
                            />
                        </div>
                    </div>
                    {postSuccess && <p className="text-green-600 dark:text-green-400 mt-4">{postSuccess}</p>}
                    {submitError && (
                        <p className="text-red-600 dark:text-red-400 mt-4">{submitError}</p>
                    )}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Yuklanmoqda...' : "Guruhni qo'shish"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/study-process/groups')}
                            className="ml-4 px-4 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 transition duration-200"
                        >
                            Orqaga
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudyGroupPage;