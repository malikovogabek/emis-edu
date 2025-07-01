import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/api';
import Loader from '../components/Loader';

const AddReportsTeachersPage = () => {
    const [newTeacher, setNewTeacher] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        phone_number: '',
        passport_serial_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeacher(prev => ({ ...prev, [name]: value }));
    };

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
                cell_phone: newTeacher.phone_number,
                pinfl: newTeacher.passport_serial_number,
            };

            const combinedName = `${newTeacher.last_name} ${newTeacher.first_name} ${newTeacher.middle_name}`.trim();
            if (combinedName) {
                dataToSend.name = combinedName;
            }

            const response = await postData('users/profile/', dataToSend);

            if (response.success) {
                setPostSuccess("O'qituvchi muvaffaqiyatli qo‘shildi!");
                setTimeout(() => {
                    navigate('/reports/teachers');
                }, 1500);
            } else {
                setError("O'qituvchi qo‘shishda xatolik: " + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            console.error("O'qituvchi qo‘shishda xatolik:", err);
            setError("O'qituvchi qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi O'qituvchi (Profil) Qo‘shish</h1>

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
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
                    <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? "Yuklanmoqda..." : "Qo‘shish"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/reports/teachers')}
                            className="ml-4 px-4 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 transition duration-200"
                        >
                            Orqaga
                        </button>
                    </div>
                    {postSuccess && <p className="text-green-600 col-span-full">{postSuccess}</p>}
                    {error && <p className="text-red-600 col-span-full">{error}</p>}
                </form>
                {loading && <Loader />}
            </div>
        </div>
    );
};

export default AddReportsTeachersPage;