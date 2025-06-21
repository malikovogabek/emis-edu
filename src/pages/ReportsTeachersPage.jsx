import React, { useEffect, useState, useCallback } from 'react';
import { fetchData, postData } from '../api/api';
import Loader from "../components/Loader";

const ReportsTeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const [newTeacher, setNewTeacher] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        phone_number: '',
        passport_serial_number: '',
    });
    const [postSuccess, setPostSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadPageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `users/profile/?page=${currentPage}&size=${pageSize}`;
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const teachersResponse = await fetchData(url);

            if (teachersResponse && teachersResponse.success) {
                if (teachersResponse.result) {
                    const teacherData = teachersResponse.result;

                    const fullNameParts = teacherData.name ? teacherData.name.split(' ') : [];
                    const lastName = fullNameParts[0] || '';
                    const firstName = fullNameParts[1] || '';
                    const middleName = fullNameParts.slice(2).join(' ') || '';

                    setTeachers([{
                        id: teacherData.id,
                        first_name: firstName,
                        last_name: lastName,
                        middle_name: middleName,
                        phone_number: teacherData.cell_phone || teacherData.work_phone || teacherData.tg_phone || 'N/A',
                        passport_serial_number: teacherData.pinfl || 'N/A', // Pinfl ni passport_serial_number ga moslashtiramiz
                        //Agar backendda passport_serial_number maydoni bo'lsa, shuni ishlating: teacherData.passport_serial_number || 'N/A'
                    }]);
                    setTotalCount(1);
                }
                else if (Array.isArray(teachersResponse.results)) {
                    const processedTeachers = teachersResponse.results.map(teacher => {
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
                            passport_serial_number: teacher.pinfl || 'N/A', // Pinfl ni passport_serial_number ga moslashtiramiz
                            //Agar backendda passport_serial_number maydoni bo'lsa, shuni ishlating: teacher.passport_serial_number || 'N/A'
                        };
                    });
                    setTeachers(processedTeachers);
                    setTotalCount(teachersResponse.count || 0);
                }
                else {
                    setTeachers([]);
                    setTotalCount(0);
                    console.warn("O'qituvchilar ma'lumoti topilmadi (result yoki results mavjud emas):", teachersResponse);
                }
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

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPostSuccess(null);

        try {
            const dataToSend = {
                first_name: newTeacher.first_name,
                last_name: newTeacher.last_name,
                middle_name: newTeacher.middle_name,
                phone_number: newTeacher.phone_number,
                passport_serial_number: newTeacher.passport_serial_number,
            };

            const response = await postData('users/profile/', dataToSend);

            if (response.success) {
                setCurrentPage(1);
                setNewTeacher({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    phone_number: '',
                    passport_serial_number: '',
                });
                setPostSuccess("O'qituvchi muvaffaqiyatli qo‘shildi!");
                setShowForm(false);
            } else {
                setError("O'qituvchi qo‘shishda xatolik: " + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            console.error("O'qituvchi qo‘shishda xatolik:", err);
            setError("O'qituvchi qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            loadPageData();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeacher(prev => ({ ...prev, [name]: value }));
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
            <h1 className="text-2xl font-bold mb-4">O'qituvchilar Ro'yxati</h1>
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
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        {showForm ? "Formani yashirish" : "+ Yangi kiritish"}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Yangi O'qituvchi Qo‘shish</h2>
                    <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Familiyasi</label>
                            <input
                                type="text"
                                name="last_name"
                                value={newTeacher.last_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ismi</label>
                            <input
                                type="text"
                                name="first_name"
                                value={newTeacher.first_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Otasining ismi</label>
                            <input
                                type="text"
                                name="middle_name"
                                value={newTeacher.middle_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon raqami</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={newTeacher.phone_number}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pasport seriya va raqami</label>
                            <input
                                type="text"
                                name="passport_serial_number"
                                value={newTeacher.passport_serial_number}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? 'Yuklanmoqda...' : 'Qo‘shish'}
                            </button>
                        </div>
                        {postSuccess && <p className="text-green-600 col-span-full">{postSuccess}</p>}
                        {error && <p className="text-red-600 col-span-full">{error}</p>}
                    </form>
                </div>
            )}

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