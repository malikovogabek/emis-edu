import React, { useEffect, useState, useCallback } from 'react';
import { fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Loader from "../components/Loader";

const StudyGroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const loadGroupsData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = 'edu-groups/';
            if (searchQuery) {
                url += `?search=${encodeURIComponent(searchQuery)}`;
            }
            const groupsResponse = await fetchData(url);
            if (groupsResponse.success && Array.isArray(groupsResponse.results)) {
                setGroups(groupsResponse.results);
            } else if (groupsResponse.success && groupsResponse.results === null) {
                setGroups([]);
                console.warn("Guruhlar ma'lumoti topilmadi (results: null):", groupsResponse);
            } else {
                setError(`Guruhlar API dan kutilgan ma'lumot formati kelmadi yoki xato: ${groupsResponse.error || JSON.stringify(groupsResponse)}`);
                setGroups([]);
            }
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi: " + (err.message || 'Nomaʼlum xato'));
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        loadGroupsData();
    }, [loadGroupsData]);

    const handleAddNewGroupClick = () => {
        navigate('/study-process/groups/add');
    };

    // Guruh tafsilotlari sahifasiga o'tish funksiyasi
    const handleViewGroupDetails = (groupId) => {
        navigate(`/study-process/groups/${groupId}`);
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Guruhlar Ro'yxati</h1>
            <div className="flex justify-between items-center mb-4">
                <div className=''>
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                <div>
                    <button
                        onClick={handleAddNewGroupClick}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition duration-200"
                    >
                        + Yangi kiritish
                    </button>
                </div>
            </div>

            {loading ? <Loader />
                : error ? (
                    <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
                ) : groups.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-x-auto max-h-[700px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guruh nomi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">O'quv rejasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ta'lim yo'nalishi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kurs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joriy semestr</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ochilgan o'quv yili</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th> {/* Bu "ACTIVE" ustuni */}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {groups.filter(group =>
                                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    group.curriculum?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    group.curriculum?.edu_direction?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    group.start_year?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    group.status.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((group, index) => (
                                    <tr key={group.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.curriculum?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.curriculum?.edu_direction?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.current_semester || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.current_semester || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.start_year?.name || 'N/A'}</td>

                                        <td
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                                                onClick={() => handleViewGroupDetails(group.id)} // Shu yerda ID ni berib yuboramiz>
                                            >
                                                Aktiv

                                            </span>
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
                        <p className="text-gray-500 dark:text-gray-400">Hozircha guruhlar topilmadi.</p>
                    </div>
                )}
        </div>
    );
};

export default StudyGroupsPage;