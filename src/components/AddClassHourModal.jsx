import React, { useState } from 'react';

const AddClassHourModal = ({ isOpen, onClose, onSubmit }) => {
    const [para, setPara] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!para || !startTime || !endTime) {
            alert("Barcha maydonlar to'ldirilishi shart!");
            return;
        }
        onSubmit({ para, start_time: startTime, end_time: endTime });
        // Formani tozalash
        setPara('');
        setStartTime('');
        setEndTime('');
        onClose(); // Modalni yopish
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative text-gray-900 dark:text-gray-100">
                <h2 className="text-xl font-bold mb-4">Dars soati kiritish</h2>

                {/* Yopish tugmasi */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="para" className="block text-sm font-medium mb-2">Para:</label>
                        <input
                            type="number"
                            id="para"
                            value={para}
                            onChange={(e) => setPara(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                            min="1"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="startTime" className="block text-sm font-medium mb-2">Boshlanish vaqti:</label>
                        <input
                            type="time"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="endTime" className="block text-sm font-medium mb-2">Tugash vaqti:</label>
                        <input
                            type="time"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-150"
                        >
                            Orqaga
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-150"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassHourModal;