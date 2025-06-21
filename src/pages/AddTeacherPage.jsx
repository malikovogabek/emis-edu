import React, { useState } from "react";
import { postData } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddTeacherPage = () => {
    const [newTeacher, setNewTeacher] = useState({
        full_name: "",
        position: { name: "" },
        status: { name: "ACTIVE" }
    });
    const [loading, setLoading] = useState(false);
    const [postSuccess, setPostSuccess] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "position") {
            setNewTeacher(prev => ({ ...prev, position: { name: value } }));
        } else if (name === "status") {
            setNewTeacher(prev => ({ ...prev, status: { name: value } }));
        } else {
            setNewTeacher(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);
        setPostSuccess(null);

        const payload = {
            full_name: newTeacher.full_name,
            position: { name: newTeacher.position.name },
            status: { name: newTeacher.status.name }
        };

        try {
            const response = await postData("staffs/teachers/", payload);

            if (response.success) {
                setPostSuccess("O'qituvchi muvaffaqiyatli qo‘shildi!");
                setNewTeacher({ full_name: "", position: { name: "" }, status: { name: "ACTIVE" } });
                setTimeout(() => {
                    navigate('/admin-process/teachers');
                }, 1500);
            } else {
                let errorMessage = "Noma'lum xato";
                if (response.error) {
                    errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                    if (response.error.detail) errorMessage = response.error.detail;
                    else if (response.error.message) errorMessage = response.error.message;
                    else if (response.error.non_field_errors) errorMessage = response.error.non_field_errors.join(', ');
                    else errorMessage = JSON.stringify(response.error);
                }
                setSubmitError("O'qituvchi qo‘shishda xatolik: " + errorMessage);
                console.error("O'qituvchi qo‘shishda xatolik javobi:", response);
            }
        } catch (err) {
            console.error("O'qituvchi qo‘shishda tarmoq xatolik:", err);
            setSubmitError("O'qituvchi qo‘shishda tarmoq xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi O'qituvchi Qo‘shish</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">F.I.O.</label>
                        <input
                            type="text"
                            name="full_name"
                            value={newTeacher.full_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lavozimi</label>
                        <input
                            type="text"
                            name="position"
                            value={newTeacher.position.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Holati</label>
                        <select
                            name="status"
                            value={newTeacher.status.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                    {postSuccess && <p className="text-green-600 dark:text-green-400 mt-4">{postSuccess}</p>}
                    {submitError && <p className="text-red-600 dark:text-red-400 mt-4">{submitError}</p>}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? "Yuklanmoqda..." : "Qo‘shish"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin-process/teachers')}
                            className="ml-4 px-4 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 transition duration-200"
                        >
                            Orqaga
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeacherPage;