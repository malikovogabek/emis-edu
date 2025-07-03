import React, { useEffect, useState, useCallback } from 'react';
import { fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Loader from "../components/Loader";

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const loadPageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `students/?page=${currentPage}&limit=${pageSize}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }

            const studentsResponse = await fetchData(url);

            if (studentsResponse && studentsResponse.success && Array.isArray(studentsResponse.results)) {
                setStudents(studentsResponse.results);
                setTotalCount(
                    studentsResponse.count ||
                    studentsResponse.total_results ||
                    studentsResponse.results.length
                );
            } else if (studentsResponse && studentsResponse.success && studentsResponse.results === null) {
                setStudents([]);
                setTotalCount(0);
                console.warn("Talabalar ma'lumoti topilmadi (results: null):", studentsResponse);
            } else {
                setError(
                    "Talabalar API dan kutilgan ma'lumot formati kelmadi yoki xato: " +
                    JSON.stringify(studentsResponse)
                );
                setStudents([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
            setError(
                "Ma'lumotlarni yuklashda xatolik yuz berdi: " +
                (err.response?.data?.error || err.message)
            );
            setStudents([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStudentStatusClick = (studentId) => {
        navigate(`/study-process/students/${studentId}`);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const maxPageNumbersToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
        startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleAddNewStudentClick = () => {
        navigate('/study-process/students/add');
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Talabalar Ro'yxati</h1>
            <div className="flex justify-between items-center mb-4">
                <div className=''>
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div className=''>
                    <button
                        onClick={handleAddNewStudentClick}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        + Yangi kiritish
                    </button>
                </div>
            </div>

            {loading && <Loader />}

            {!loading && error && (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            )}

            {!loading && !error && students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-h-[700px] shadow-md overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">F.I.O.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruh nomi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kurs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">JSHSHIR</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Talaba holati</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {students.map((student, index) => (
                                <tr key={student.id}
                                    onClick={() => handleStudentStatusClick(student.id)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out" >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {`${student.citizen?.last_name || ''} ${student.citizen?.first_name || ''} ${student.citizen?.middle_name || ''}`.trim() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.edu_group?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.edu_group?.current_semester || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.citizen?.pinfl || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                                        >
                                            O'qimoqda
                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && students.length === 0 && (
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
                        Jami {totalCount} ta talaba / {totalPages} ta sahifa
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

export default StudentsPage;