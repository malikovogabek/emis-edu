import React, { useEffect, useState, useCallback } from 'react';
import { fetchData, deleteData } from '../api/api';
import Loader from "../components/Loader";
import { useNavigate } from 'react-router-dom';

const ReportsTeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const loadPageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setPostSuccess(null);
        try {
            let url = `users/profile/?page=${currentPage}&size=${pageSize}`;
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const teachersResponse = await fetchData(url);

            if (teachersResponse && teachersResponse.success) {
                let processedTeachers = [];
                let total = 0;

                if (teachersResponse.result) {
                    const teacherData = teachersResponse.result;
                    const fullNameParts = teacherData.name ? teacherData.name.split(' ') : [];
                    const lastName = fullNameParts[0] || '';
                    const firstName = fullNameParts[1] || '';
                    const middleName = fullNameParts.slice(2).join(' ') || '';

                    processedTeachers = [{
                        id: teacherData.id,
                        first_name: firstName,
                        last_name: lastName,
                        middle_name: middleName,
                        phone_number: teacherData.cell_phone || teacherData.work_phone || teacherData.tg_phone || 'N/A',
                        passport_serial_number: teacherData.pinfl || 'N/A',
                    }];
                    total = 1;
                } else if (Array.isArray(teachersResponse.results)) {
                    processedTeachers = teachersResponse.results.map(teacher => {
                        const fullNameParts = teacher.name ? teacher.name.split(' ') : [];
                        const lastName = fullNameParts[0] || '';
                        const firstName = fullNameParts[1] || '';
                        const middleName = fullNameParts.slice(2).join(' ') || '';
                        return {
                            ...teacher,
                            first_name: firstName,
                            last_name: lastName,
                            middle_name: middleName,
                            phone_number: teacher.cell_phone || teacher.work_phone || teacher.tg_phone || 'N/A',
                            passport_serial_number: teacher.pinfl || 'N/A',
                        };
                    });
                    total = teachersResponse.count || 0;
                } else {
                    setTeachers([]);
                    setTotalCount(0);
                    console.warn("O'qituvchilar ma'lumoti topilmadi (result yoki results mavjud emas):", teachersResponse);
                }

                setTeachers(processedTeachers);
                setTotalCount(total);

            } else {
                setError("O'qituvchilar API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(teachersResponse));
                setTeachers([]);
                setTotalCount(0);
                console.error("O'qituvchilar API dan kutilgan ma'lumot formati kelmadi yoki xato:", teachersResponse);
            }

        } catch (err) {
            console.error("O'qituvchilar ma'lumotlarini yuklashda xatolik:", err);
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setTeachers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);


    const handleDeleteTeacher = async (teacherId) => {
        if (!window.confirm("Haqiqatan ham ushbu o'qituvchini o'chirmoqchimisiz?")) return;
        setLoading(true);
        setError(null);
        setPostSuccess(null);
        try {
            const response = await deleteData(`users/profile/${teacherId}/`);
            if (response.success && (response.status === 204 || response.status === 200)) {
                setPostSuccess("O'qituvchi muvaffaqiyatli o'chirildi!");
                loadPageData();
            } else {
                throw new Error(response.error || 'O‘chirishda nomaʼlum xatolik');
            }
        } catch (err) {
            console.error("O'qituvchini o'chirishda xatolik:", err);
            setError("O'qituvchini o'chirishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };


    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
        startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">O'qituvchilar Ro'yxati (Reportlar)</h1>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div>
                    <button
                        onClick={() => navigate('/reports/teachers/add')}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        + Yangi kiritish
                    </button>
                </div>
            </div>

            {postSuccess && <p className="text-green-600 mb-4">{postSuccess}</p>}

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : teachers.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-h-[600px] shadow-md overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Familiyasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ismi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Otasining ismi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefon raqami</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pasport</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {teachers.map((teacher, index) => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.last_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.first_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.middle_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.phone_number || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.passport_serial_number || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                        <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">O'chirish</button>
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
                    <p className="text-gray-500 dark:text-gray-400">Ma'lumot topilmadi</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-end items-center mt-4 space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Jami {totalCount} ta yozuv / {totalPages} ta sahifa
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Oldingi
                    </button>

                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`px-3 py-1 border rounded-md ${currentPage === number
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Keyingi
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportsTeachersPage;