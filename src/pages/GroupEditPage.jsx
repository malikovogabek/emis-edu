import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchData, putData } from '../api/api';
import Loader from '../components/Loader';

const EditGroupPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [groupData, setGroupData] = useState(null);

    const [curriculums, setCurriculums] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const [loadingGroupData, setLoadingGroupData] = useState(true);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchGroupDetails = useCallback(async () => {
        setLoadingGroupData(true);
        setError(null);
        try {
            if (location.state && location.state.groupData) {
                setGroupData(location.state.groupData);
            } else {
                const response = await fetchData(`edu-groups/${id}/`);
                if (response.success) {
                    setGroupData(response.result || response);
                } else {
                    const errorMessage = response.error ? JSON.stringify(response.error) : 'Noma\'lum xato';
                    setError(`Guruh ma'lumotlarini yuklashda xato: ${errorMessage}`);
                }
            }
        } catch (err) {
            console.error("Guruh tafsilotlarini yuklashda kutilmagan xatolik:", err);
            setError("Guruh tafsilotlarini yuklashda kutilmagan xatolik yuz berdi: " + err.message);
        } finally {
            setLoadingGroupData(false);
        }
    }, [id, location.state]);

    const fetchDropdownData = useCallback(async () => {
        setLoadingDropdowns(true);
        setError(null);
        try {
            const [curriculumsResponse, yearsResponse] = await Promise.all([
                fetchData('curriculums/'),
                fetchData('edu-years/')
            ]);

            if (curriculumsResponse.success && Array.isArray(curriculumsResponse.results)) {
                setCurriculums(curriculumsResponse.results);
            } else {
                const errorDetail = curriculumsResponse.error?.detail || curriculumsResponse.error || 'Noma\'lum xato';
                setError(prev => (prev ? prev + "\n" : "") + `O'quv rejalari yuklashda xato: ${errorDetail}`);
            }

            if (yearsResponse.success && Array.isArray(yearsResponse.results)) {
                setAcademicYears(yearsResponse.results);
            } else {
                const errorDetail = yearsResponse.error?.detail || yearsResponse.error || 'Noma\'lum xato';
                setError(prev => (prev ? prev + "\n" : "") + `O'quv yillari yuklashda xato: ${errorDetail}`);
            }

        } catch (err) {
            console.error("Dropdown ma'lumotlarini yuklashda umumiy kutilmagan xatolik:", err);
            setError(prev => (prev ? prev + "\n" : "") + "Dropdown ma'lumotlarini yuklashda kutilmagan xatolik: " + err.message);
        } finally {
            setLoadingDropdowns(false);
        }
    }, []);

    useEffect(() => {
        fetchGroupDetails();
        fetchDropdownData();
    }, [fetchGroupDetails, fetchDropdownData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupData(prevData => {
            if (!prevData) return null;

            if (name === "curriculum" || name === "start_year" || name === "end_year") {
                return {
                    ...prevData,
                    [name]: value
                };
            }
            return {
                ...prevData,
                [name]: value
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        if (!groupData) {
            setError("Saqlash uchun guruh ma'lumotlari mavjud emas.");
            setIsSaving(false);
            return;
        }

        try {
            const dataToUpdate = {
                name: groupData.name,
                curriculum: groupData.curriculum,
                start_year: groupData.start_year,
                end_year: groupData.end_year,
                student_count: parseInt(groupData.student_count, 10),
                current_semester: parseInt(groupData.current_semester, 10),
                status: groupData.status,
            };

            Object.keys(dataToUpdate).forEach(key => {
                if (dataToUpdate[key] === undefined || dataToUpdate[key] === null || dataToUpdate[key] === '') {
                    delete dataToUpdate[key];
                }
            });

            const response = await putData(`edu-groups/${id}/`, dataToUpdate);

            if (response.success) {
                setSaveSuccess(true);
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                const errorMessage = response.error ? JSON.stringify(response.error) : 'Noma\'lum xato';
                setError(`Guruhni saqlashda xato: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Guruhni saqlashda kutilmagan xatolik:", err);
            setError("Guruhni saqlashda kutilmagan xatolik yuz berdi: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loadingGroupData || loadingDropdowns) {
        return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 dark:text-red-400">
                <p>Xato: {error}</p>
                <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md">Ortga qaytish</button>
            </div>
        );
    }

    if (!groupData) {
        return <div className="p-4 text-red-600 dark:text-red-400">Guruh ma'lumotlari topilmadi.</div>;
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Guruhni Tahrirlash</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        className={`px-6 py-2 rounded-md transition duration-200 ${isSaving ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                        disabled={isSaving}
                    >
                        Ortga
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">Guruh Nomi</label>
                        <input
                            type="text"
                            id="groupName"
                            name="name"
                            value={groupData.name || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">O'quv reja nomi</label>
                        <select
                            id="curriculum"
                            name="curriculum"
                            value={groupData.curriculum?.id || groupData.curriculum || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        >
                            <option value="">O'quv rejasini tanlang</option>
                            {curriculums.map(curr => (
                                <option key={curr.id} value={curr.id}>
                                    {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">Birinchi o'quv yili</label>
                        <select
                            id="startYear"
                            name="start_year"
                            value={groupData.start_year?.id || groupData.start_year || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        >
                            <option value="">O'quv yilini tanlang</option>
                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>
                                    {year.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">Oxirgi o'quv yili</label>
                        <select
                            id="endYear"
                            name="end_year"
                            value={groupData.end_year?.id || groupData.end_year || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        >
                            <option value="">O'quv yilini tanlang</option>
                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>
                                    {year.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">Guruhga kiritilishi kerak bo'lgan talabalar soni</label>
                        <input
                            type="number"
                            id="studentCount"
                            name="student_count"
                            value={groupData.student_count || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="currentSemester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-field">Joriy semestr</label>
                        <input
                            type="number"
                            id="currentSemester"
                            name="current_semester"
                            value={groupData.current_semester || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>

            {saveSuccess && (
                <p className="mt-4 text-green-600 dark:text-green-400 text-center">Ma'lumotlar muvaffaqiyatli saqlandi!</p>
            )}
        </div>
    );
};

export default EditGroupPage;