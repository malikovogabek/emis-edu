import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData, fetchData } from '../api/api';
import Loader from '../components/Loader';

const AddRoomsPage = () => {
    const [newRoom, setNewRoom] = useState({
        room_name: '',
        building: '',
        capacity: '',
        floor_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);
    const [buildingsList, setBuildingsList] = useState([]);
    const [buildingsLoading, setBuildingsLoading] = useState(true);
    const [buildingsError, setBuildingsError] = useState(null);

    const navigate = useNavigate();


    const loadBuildingsList = useCallback(async () => {
        setBuildingsLoading(true);
        setBuildingsError(null);
        try {
            const response = await fetchData('buildings/');
            if (response.success && Array.isArray(response.results)) {
                setBuildingsList(response.results);
            } else {
                setBuildingsError("Binolar ro'yxatini yuklashda xatolik: " + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            setBuildingsError("Binolar ro'yxatini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setBuildingsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBuildingsList();
    }, [loadBuildingsList]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom(prev => ({ ...prev, [name]: value }));
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPostSuccess(null);

        try {
            const response = await postData('rooms/', {
                room_name: newRoom.room_name,
                building: parseInt(newRoom.building),
                capacity: parseInt(newRoom.capacity),
                floor_number: parseInt(newRoom.floor_number)
            });

            if (response.success) {
                setPostSuccess('Xona muvaffaqiyatli qo‘shildi!');
                setTimeout(() => {
                    navigate('/tm-info/rooms');
                }, 1500);
            } else {
                setError('Xona qo‘shishda xatolik: ' + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            console.error("Xona qo‘shishda xatolik:", err);
            setError("Xona qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi Xona Qo‘shish</h1>

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xona nomi</label>
                        <input
                            type="text"
                            name="room_name"
                            value={newRoom.room_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bino nomi</label>
                        {buildingsLoading ? (
                            <p>Binolar yuklanmoqda...</p>
                        ) : buildingsError ? (
                            <p className="text-red-600">{buildingsError}</p>
                        ) : (
                            <select
                                name="building"
                                value={newRoom.building}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                                required
                            >
                                <option value="">Tanlang...</option>
                                {buildingsList.map(building => (
                                    <option key={building.id} value={building.id}>{building.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xona sig'imi</label>
                        <input
                            type="number"
                            name="capacity"
                            value={newRoom.capacity}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xona nechanchi etajda</label>
                        <input
                            type="number"
                            name="floor_number"
                            value={newRoom.floor_number}
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
                            disabled={loading || buildingsLoading}
                        >
                            {loading ? 'Yuklanmoqda...' : 'Qo‘shish'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/tm-info/rooms')}
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

export default AddRoomsPage;