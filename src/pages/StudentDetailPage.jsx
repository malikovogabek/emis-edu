import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../api/api';
import Loader from "../components/Loader";

const StudentDetailPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString;
    };

    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchData(`students/${studentId}/`);
                if (response && response.success && response.result) {
                    setStudentDetails(response.result);
                } else {
                    setError("Talaba ma'lumotlari topilmadi yoki xato yuz berdi.");
                }
            } catch (err) {
                console.error("Talaba ma'lumotlarini yuklashda xatolik:", err);
                setError("Talaba ma'lumotlarini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    if (loading) {
        return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;
    }

    if (error) {
        return <p className="text-red-600 dark:text-red-400 p-4">Xato: {error}</p>;
    }

    if (!studentDetails) {
        return <p className="p-4 text-gray-700 dark:text-gray-300">Ma'lumot topilmadi.</p>;
    }

    const citizen = studentDetails.citizen;
    const eduGroup = studentDetails.edu_group;
    const school = studentDetails.school;
    const region = studentDetails.region;
    const district = studentDetails.district;


    const getAddress = () => {
        const parts = [];
        if (region?.name) {
            parts.push(region.name);
        }
        if (district?.name) {
            parts.push(district.name);
        }
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Talaba ma'lumotlari</h1>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => navigate('/study-process/students/')}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-200 mr-2"
                    >
                        Orqaga
                    </button>
                    <button
                        onClick={() => navigate(`/study-process/students/${studentId}/edit`)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-200 mr-2"
                    >
                        Tahrirlash
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition duration-200">O'chirish</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">F.I.O.</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{`${citizen?.last_name || ''} ${citizen?.first_name || ''} ${citizen?.middle_name || ''}`.trim() || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">JSHSHIR</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{citizen?.pinfl || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pasport seriyasi raqami</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{citizen?.serial_number || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tug'ilgan sana</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{formatDate(citizen?.birth_date)}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tug'ilganlik haqida guvohnoma</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{`${citizen?.birth_cert_serial || ''} ${citizen?.birth_cert_number || ''}`.trim() || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuqarolik</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{citizen?.citizenship_type?.name || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Guruh nomi</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{eduGroup?.name || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">O'qishga kirgan yili</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{eduGroup?.start_year_code || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maktabni bitirgan yil</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{studentDetails.school_finished_year || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maktab anahdnomasi (attestat)</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{`${studentDetails.school_certificate_serial || ''}${studentDetails.school_certificate_number || ''}`.trim() || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bitirgan maktabi</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{school?.name?.uz || 'N/A'}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manzili</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{getAddress()}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Doimiy yashash manzili</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{getAddress()}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Talaba holati</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{studentDetails.status === 'ACTIVE' ? "O'qimoqda" : studentDetails.status || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;