import React, { useState } from 'react';
import { postData } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AddStudentPage = () => {
    const [newStudent, setNewStudent] = useState({
        citizen: { last_name: '', first_name: '', middle_name: '', pinfl: '' },
        edu_group: { name: '', current_semester: '' },
        status: ''
    });
    const [loading, setLoading] = useState(false);
    const [postSuccess, setPostSuccess] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPostSuccess(null);

        try {
            const response = await postData('students/', {
                citizen: {
                    last_name: newStudent.citizen.last_name,
                    first_name: newStudent.citizen.first_name,
                    middle_name: newStudent.citizen.middle_name,
                    pinfl: newStudent.citizen.pinfl
                },
                edu_group: {
                    name: newStudent.edu_group.name,
                    current_semester: parseInt(newStudent.edu_group.current_semester) || 1
                },
                status: newStudent.status
            });

            if (response.success) {
                setNewStudent({
                    citizen: { last_name: '', first_name: '', middle_name: '', pinfl: '' },
                    edu_group: { name: '', current_semester: '' },
                    status: ''
                });
                setPostSuccess('Talaba muvaffaqiyatli qo‘shildi!');
                setTimeout(() => {
                    navigate('/study-process/students');
                }, 1500);
            } else {
                let errorMessage = 'Noma’lum xato';
                if (response.error) {
                    errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                    if (response.error.detail) errorMessage = response.error.detail;
                    else if (response.error.message) errorMessage = response.error.message;
                    else if (response.error.non_field_errors) errorMessage = response.error.non_field_errors.join(', ');
                    else errorMessage = JSON.stringify(response.error);
                }
                setError('Talaba qo‘shishda xatolik: ' + errorMessage);
            }
        } catch (err) {
            console.error("Talaba qo‘shishda xatolik:", err);
            setError("Talaba qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('citizen.')) {
            setNewStudent(prev => ({
                ...prev,
                citizen: { ...prev.citizen, [name.split('.')[1]]: value }
            }));
        } else if (name.startsWith('edu_group.')) {
            setNewStudent(prev => ({
                ...prev,
                edu_group: { ...prev.edu_group, [name.split('.')[1]]: value }
            }));
        } else {
            setNewStudent(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi Talaba Qo‘shish</h1>

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Familya</label>
                        <input
                            type="text"
                            name="citizen.last_name"
                            value={newStudent.citizen.last_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ism</label>
                        <input
                            type="text"
                            name="citizen.first_name"
                            value={newStudent.citizen.first_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Otasining ismi</label>
                        <input
                            type="text"
                            name="citizen.middle_name"
                            value={newStudent.citizen.middle_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PINFL</label>
                        <input
                            type="text"
                            name="citizen.pinfl"
                            value={newStudent.citizen.pinfl}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guruh nomi</label>
                        <input
                            type="text"
                            name="edu_group.name"
                            value={newStudent.edu_group.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kurs</label>
                        <input
                            type="number"
                            name="edu_group.current_semester"
                            value={newStudent.edu_group.current_semester}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Holati</label>
                        <input
                            type="text"
                            name="status"
                            value={newStudent.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
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
                        <button
                            type="button"
                            onClick={() => navigate('/study-process/students')}
                            className="px-4 py-2 ml-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200"
                        >
                            Orqaga
                        </button>
                    </div>
                    {postSuccess && <p className="text-green-600 col-span-full">{postSuccess}</p>}
                    {error && <p className="text-red-600 col-span-full">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AddStudentPage;