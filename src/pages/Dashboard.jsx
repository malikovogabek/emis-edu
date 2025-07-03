import React, { useEffect, useState } from 'react';
import { fetchData } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Loader from "../components/Loader";
import TokenInput from '../components/TokenInput';


function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {

        const getData = async () => {
            try {
                const result = await fetchData('users/profile/');
                setData(result);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
        getData();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-xl">Ma'lumotlarni yuklashda xato yuz berdi: {error.message}</div>;
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Asosiy Panel (Dashboard)</h1>

            <TokenInput />
            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Xato: {error}</p>
            ) : data ? (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {/* API'dan olingan ma'lumotlarni bu yerda ko'rsating */}
                    <p className="mb-2">Xush kelibsiz, <span className="font-semibold">{data.userName}</span>!</p>
                    <p className="mb-2">Bugungi foydalanuvchilar soni: <span className="font-semibold">{data.dailyUsers}</span></p>
                    <p className="mb-2">Jami talabalar: <span className="font-semibold">{data.totalStudents}</span></p>
                    <p className="mb-2">Aktiv guruhlar: <span className="font-semibold">{data.activeGroups}</span></p>
                    <p className="mb-2">Kutilayotgan vazifalar: <span className="font-semibold">{data.pendingTasks}</span></p>
                    <p className="mb-2">Oxirgi kirish: <span className="font-semibold">{data.lastLogin}</span></p>

                    {/* JSON ma'lumotini ko'rsatish bloki */}
                    <h2 className="text-xl font-bold mt-6 mb-3">Barcha ma'lumotlar (JSON):</h2>
                    <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto max-h-96">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            ) : (
                <p>Ma'lumotlar topilmadi.</p>
            )}
        </div>
    );
}

export default Dashboard;