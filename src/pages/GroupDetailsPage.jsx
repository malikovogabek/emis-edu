import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../api/api';
import Loader from "../components/Loader";

const GroupDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();



    const [groupData, setGroupData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('students');

    const loadGroupDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const groupResponse = await fetchData(`edu-groups/${id}/`);
            if (groupResponse.success) {
                if (groupResponse.result) {
                    setGroupData(groupResponse.result);
                } else {
                    console.warn("Guruh ma'lumotlari 'result' kaliti ichida topilmadi, to'g'ridan-to'g'ri obyekt sifatida ishlatiladi:", groupResponse);
                    setGroupData(groupResponse);
                }
            } else {
                const errorMessage = groupResponse.error
                    ? (typeof groupResponse.error === 'string' ? groupResponse.error : JSON.stringify(groupResponse.error))
                    : 'Noma\'lum xato';
                setError(`Guruh ma'lumotlarini yuklashda xato: ${errorMessage}`);
                setGroupData(null);
            }

            const studentsResponse = await fetchData(`edu-groups/${id}/students/?page=1&limit=20`);
            if (studentsResponse.success && Array.isArray(studentsResponse.results)) {
                setStudents(studentsResponse.results);
            } else if (studentsResponse.success && studentsResponse.results === null) {
                setStudents([]);
                console.warn("Talabalar ma'lumoti topilmadi (results: null):", studentsResponse);
            } else {
                const errorMessage = studentsResponse.error
                    ? (typeof studentsResponse.error === 'string' ? studentsResponse.error : JSON.stringify(studentsResponse.error))
                    : 'Kutilmagan javob formati';
                console.warn(`Talabalar ma'lumotlarini yuklashda muammo: ${errorMessage}`);
                setStudents([]);
            }

        } catch (err) {
            console.error("Guruh tafsilotlarini yuklashda xatolik:", err);
            const errorMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
            setError("Guruh tafsilotlarini yuklashda xatolik yuz berdi: " + errorMessage);
            setGroupData(null);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadGroupDetails();
    }, [loadGroupDetails]);

    if (loading) {
        return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 dark:text-red-400">
                <p>Xato: {error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md">Ortga qaytish</button>
            </div>
        );
    }

    const groupName = groupData?.name || 'N/A';
    const groupIdDisplay = groupData?.id || 'N/A';
    const currentAcademicYear = groupData?.opened_academic_year || groupData?.start_year?.name || 'N/A';
    const studentCount = groupData?.student_count || students.length || 'N/A';
    const curriculumName = groupData?.curriculum_name || groupData?.curriculum?.name || 'N/A';
    const currentSemester = groupData?.current_semester || 'N/A';
    const status = groupData?.status || 'N/A';
    const handleEditGroup = () => {
        navigate(`/study-process/groups/${id}/edit`);
    };
    const handleNavigateToRatingsPage = () => {
        navigate(`/study-process/groups/${id}/ratings`);
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-4">

                <div className="flex space-x-2">
                    <button
                        onClick={handleEditGroup}
                        className="px-4 py-2 bg-blue-500 dark:bg-gray-700 text-gray-50 dark:text-gray-200 rounded-md hover:bg-blue-400 dark:hover:bg-gray-600 transition duration-200 text-sm">
                        Tahrirlash

                    </button>
                    <button
                        onClick={handleNavigateToRatingsPage}
                        className="px-4 py-2 bg-green-500 dark:bg-gray-700 text-gray-50 dark:text-gray-200 rounded-md hover:bg-green-400 dark:hover:bg-gray-600 transition duration-200 text-sm">
                        Guruhdagi talabalarning baholarini kiritish
                    </button>
                    <button className="px-4 py-2 bg-amber-400 dark:bg-gray-700 text-gray-50 dark:text-gray-200 rounded-md hover:bg-amber-300 dark:hover:bg-gray-600 transition duration-200 text-sm">
                        Keyingi semestrga o'tkazish
                    </button>
                    <button
                        onClick={() => navigate(`/study-process/students/add`)}
                        className="px-4 py-2 bg-fuchsia-500 dark:bg-gray-700 text-gray-50 dark:text-gray-200 rounded-md hover:bg-fuchsia-400 dark:hover:bg-gray-600 transition duration-200 text-sm"

                    >
                        Talaba qoshish
                    </button>
                    <button
                        onClick={() => navigate('/study-process/groups')}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-700 transition duration-200"
                    >
                        Ortga
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">ID</p>
                        <p className="font-medium text-lg">{groupIdDisplay}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Guruh Nomi</p>
                        <p className="font-medium text-lg">{groupName}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Ochilgan O'quv Yili</p>
                        <p className="font-medium text-lg">{currentAcademicYear}</p>
                    </div>
                </div>

                <div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
                        <p className={`font-medium text-lg ${status === 'Active' ? 'text-green-500' : 'text-green-500'}`}>{status}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Guruhga kiritiladigan talabalar soni</p>
                        <p className="font-medium text-lg">{studentCount}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">O'quv reja</p>
                        <p className="font-medium text-lg">{curriculumName}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Guruhning joriy semestri</p>
                        <p className="font-medium text-lg">{currentSemester}</p>
                    </div>
                </div>
                <div>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'students' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('students')}
                >
                    Guruh o'quvchilari
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    Dars jadvali
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'grouping' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('grouping')}
                >
                    Guruhlash
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'control' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('control')}
                >
                    Nazorat
                </button>
            </div>

            {activeTab === 'students' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm overflow-x-auto">
                    {students.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Talaba</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PINFL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ta'lim Olgan Maktabi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Attestat Seriya Raqami</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Maktabdan O'qigan Fanlari Soni Va Ballari</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map((student, index) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {`${student.citizen?.last_name || ''} ${student.citizen?.first_name || ''} ${student.citizen?.middle_name || ''}`.trim() || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.citizen?.pinfl || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.school?.name?.uz || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {`${student.school_certificate_serial || ''} ${student.school_certificate_number || ''}`.trim() || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {Object.keys(student.subjects || {}).length > 0 ? JSON.stringify(student.subjects) : '-'} <br />

                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                title="Talaba tafsilotlari"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Bu guruhda hozircha talabalar yo'q.</p>
                    )}
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
                    Dars jadvali ma'lumotlari bu yerda ko'rsatiladi.
                </div>
            )}
            {activeTab === 'grouping' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
                    Guruhlash ma'lumotlari bu yerda ko'rsatiladi.
                </div>
            )}
            {activeTab === 'control' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-400">
                    Nazorat ma'lumotlari bu yerda ko'rsatiladi.
                </div>
            )}
        </div>
    );
};

export default GroupDetailsPage;