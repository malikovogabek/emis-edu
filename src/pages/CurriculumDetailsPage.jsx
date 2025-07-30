import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData, postData } from '../api/api';
import Loader from '../components/Loader';
import { message } from 'antd';

const CurriculumDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curriculumDetails, setCurriculumDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCurriculumDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await fetchData(`curriculums/${id}/`);
            if (responseData && responseData.success && responseData.result) {
                setCurriculumDetails(responseData.result);
            } else {
                setError("O'quv rejasi ma'lumotlari topilmadi yoki xato: " + JSON.stringify(responseData));
                setCurriculumDetails(null);
            }
        } catch (err) {
            console.error("O'quv rejasi ma'lumotlarini yuklashda xatolik:", err);
            setError("O'quv rejasi ma'lumotlarini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setCurriculumDetails(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCurriculumDetails();
    }, [loadCurriculumDetails]);

    const handleDeclineCurriculum = async () => {
        setLoading(true);
        try {
            const response = await postData(`curriculums/${id}/cancel/`, { status: 'ACTIVE' }, 'PATCH');
            if (response.success) {
                message.success("O'quv reja bekor qilindi va status ACTIVE ga o'zgartirildi!");
                loadCurriculumDetails();
            } else {
                message.error("O'quv rejani bekor qilishda xatolik yuz berdi: " + (response.error || "Noma'lum xato"));
            }
        } catch (err) {
            console.error("O'quv rejani bekor qilishda xatolik:", err);
            message.error("O'quv rejani bekor qilishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleApproveCurriculum = async () => {
        setLoading(true);
        try {
            const response = await postData(`curriculums/${id}/approve/`);
            if (response.success) {
                message.success("O'quv reja tasdiqlandi!");
                loadCurriculumDetails();
            } else {
                message.error("O'quv rejani tasdiqlashda xatolik yuz berdi: " + (response.error || "Noma'lum xato"));
            }
        } catch (err) {
            console.error("O'quv rejani tasdiqlashda xatolik:", err);
            message.error("O'quv rejani tasdiqlashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
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
                    onClick={() => navigate('/study-process/plans')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Ro'yxatga qaytish
                </button>
            </div>
        );
    }

    if (!curriculumDetails) {
        return (
            <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
                <p>O'quv rejasi ma'lumotlari mavjud emas.</p>
                <button
                    onClick={() => navigate('/study-process/plans')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Ro'yxatga qaytish
                </button>
            </div>
        );
    }
    const getUzName = (obj) => {
        return obj && obj.uz ? obj.uz : 'N/A';
    };
    const showActionButtons = curriculumDetails.status === 'ACTIVE';
    const showApprovedButtons = curriculumDetails.status === "APPROVED";
    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100 max-h-screen overflow-y-auto">
            <div className='p-3 '>
                <button
                    onClick={() => navigate(`/study-process/plans/details/${id}/edit`)}
                    className='px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-200 mr-2'>
                    Tahrirlash
                </button>
                {showActionButtons && (
                    <>
                        <button
                            onClick={() => navigate(`/study-process/plans/details/${id}/distribute-subjects`)}
                            className='px-4 py-2 bg-amber-400 text-white text-sm rounded-md hover:bg-amber-300 transition duration-200 mr-2'>
                            O'quv reja fanlarini taqsimlash
                        </button>
                        <button
                            onClick={handleApproveCurriculum}
                            className='px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-400 transition duration-200 mr-2'>
                            O'quv rejani tasdiqlash
                        </button>
                    </>
                )}
                {showApprovedButtons && (
                    <button
                        onClick={handleDeclineCurriculum}
                        className='px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-500 transition duration-200 mr-2'>
                        O'quv rejani bekor qilish
                    </button>
                )}

                <button
                    onClick={() => navigate('/study-process/plans')}
                    className="px-4 py-2 bg-white text-red-600 text-sm rounded-md  transition duration-200"
                >
                    &larr; Orqaga
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <table className="w-full table-auto border border-gray-300 dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-gray-800 mb-6">
                    <tbody>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">ID:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.id}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">O'quv rejasi nomi:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">O'quv muassasasi:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{getUzName(curriculumDetails.institution?.name)}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Ta'lim yo'nalishi:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.edu_direction?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Birinchi o'quv yili:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.start_year?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Oxirgi o'quv yili:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.end_year?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Ta'lim shakli:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.edu_form?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Semestr soni:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{curriculumDetails.curriculum_template?.number_of_semesters || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Status:</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-500">
                                    {curriculumDetails.status || curriculumDetails.curriculum_template?.status || 'N/A'}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>


                <hr className="my-6 border-gray-200 dark:border-gray-700" />

                <h2 className="text-xl font-bold mb-4">Fanlar Ro'yxati</h2>

                {curriculumDetails.semester_edu_subjects && curriculumDetails.semester_edu_subjects.length > 0 ? (
                    curriculumDetails.semester_edu_subjects.map((semesterSubjects, semesterIndex) => (
                        <div key={semesterIndex} className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">
                                {semesterSubjects.length > 0 ? `${semesterSubjects[0].semester_number}-semestr` : `Semestr ${semesterIndex + 1}`}
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fan</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fan turi</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Umumiy soati</th>

                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {semesterSubjects.map((subjectItem, subjectIndex) => (
                                            <tr key={subjectItem.edu_subject_id || `subject-${semesterIndex}-${subjectIndex}`}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{getUzName(subjectItem.edu_subject.name)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{subjectItem.edu_subject.edu_subject_type ? subjectItem.edu_subject.edu_subject_type.name : 'N/A'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{subjectItem.study_hours || 0}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">Fanlar ma'lumotlari topilmadi.</p>
                )}
            </div>
        </div>
    );
};

export default CurriculumDetailsPage;