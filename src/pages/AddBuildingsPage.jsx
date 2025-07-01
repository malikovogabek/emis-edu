import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/api';
import Loader from '../components/Loader';

const AddBuildingsPage = () => {
    const [newBuilding, setNewBuilding] = useState({
        name: '',
        floor_count: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBuilding(prev => ({ ...prev, [name]: value }));
    };

    const handleAddBuilding = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPostSuccess(null);

        try {
            const response = await postData('buildings/', {
                name: newBuilding.name,
                floor_count: parseInt(newBuilding.floor_count)
            });

            if (response.success) {
                setPostSuccess('Bino korpusi muvaffaqiyatli qo‘shildi!');
                setTimeout(() => {
                    navigate('/tm-info/buildings');
                }, 1500);
            } else {
                setError('Bino korpusi qo‘shishda xatolik: ' + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            console.error("Bino korpusi qo‘shishda xatolik:", err);
            setError("Bino korpusi qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi Bino Korpusini Qo‘shish</h1>

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleAddBuilding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bino nomi</label>
                        <input
                            type="text"
                            name="name"
                            value={newBuilding.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qavatlar soni</label>
                        <input
                            type="number"
                            name="floor_count"
                            value={newBuilding.floor_count}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                            min="1"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Yuklanmoqda...' : 'Qo‘shish'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/tm-info/buildings')}
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

export default AddBuildingsPage;