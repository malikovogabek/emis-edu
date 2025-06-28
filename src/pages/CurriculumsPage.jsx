import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "../api/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const CurriculumsPage = () => {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();

    const loadCurriculums = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await fetchData("curriculums/");
            if (responseData && responseData.success && Array.isArray(responseData.results)) {
                setCurriculums(responseData.results);
            } else if (responseData && responseData.success && responseData.results === null) {
                setCurriculums([]);
                console.warn("O'quv rejalar ma'lumoti topilmadi (results: null):", responseData);
            } else {
                setError("API dan kutilgan ma'lumot formati kelmadi yoki xato: " + JSON.stringify(responseData));
                setCurriculums([]);
                console.error("API dan kutilgan ma'lumot formati kelmadi yoki xato:", responseData);
            }
        } catch (err) {
            console.error("O'quv rejalarni yuklashda xatolik:", err);
            setError("O'quv rejalarni yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setCurriculums([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCurriculums();
    }, [loadCurriculums]);

    const handleAddNewCurriculumClick = () => {
        navigate('/study-process/plans/add');
    };

    const filteredCurriculums = curriculums.filter(curriculum =>
        curriculum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curriculum.edu_direction?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curriculum.start_year?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalItems = filteredCurriculums.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCurriculums.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">O'quv Rejalar Ro'yxati</h1>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div>
                    <button
                        onClick={handleAddNewCurriculumClick}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        + Yangi kiritish
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : currentItems.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">O'quv rejasi nomi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ta'lim yo'nalishi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">O'quv yili</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktiv semestrlar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentItems.map((curriculum, index) => (
                                <tr key={curriculum.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{curriculum.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{curriculum.edu_direction ? curriculum.edu_direction.name : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{curriculum.start_year ? curriculum.start_year.name : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{curriculum.curriculum_template ? curriculum.curriculum_template.number_of_semesters : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-500 cursor-pointer hover:bg-blue-200"

                                        >
                                            Tastiqlangan
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalItems > itemsPerPage && (
                        <div className="flex justify-between items-center mt-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-300">
                            <span className="text-sm">Jami {totalItems} ta</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Oldingi
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded-md border ${currentPage === pageNumber
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Keyingi
                                </button>
                            </div>
                            <span className="text-sm">
                                {currentPage} / {totalPages} sahifa
                            </span>
                        </div>
                    )}
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
        </div>
    );
};

export default CurriculumsPage;