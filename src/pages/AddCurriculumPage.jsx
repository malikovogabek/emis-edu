import React, { useState } from "react";
import { postData } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddCurriculumPage = () => {
    const [newCurriculum, setNewCurriculum] = useState({
        name: "",
        edu_direction: { name: "" },
        start_year: { name: "" },
        curriculum_template: { number_of_semesters: "" }
    });
    const [loading, setLoading] = useState(false);
    const [postSuccess, setPostSuccess] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "edu_direction") {
            setNewCurriculum(prev => ({ ...prev, edu_direction: { name: value } }));
        } else if (name === "start_year") {
            setNewCurriculum(prev => ({ ...prev, start_year: { name: value } }));
        } else if (name === "number_of_semesters") {
            setNewCurriculum(prev => ({ ...prev, curriculum_template: { number_of_semesters: parseInt(value) || '' } }));
        } else {
            setNewCurriculum(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddCurriculum = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);
        setPostSuccess(null);

        const payload = {
            name: newCurriculum.name,
            edu_direction: { name: newCurriculum.edu_direction.name },
            start_year: { name: newCurriculum.start_year.name },
            curriculum_template: { number_of_semesters: parseInt(newCurriculum.curriculum_template.number_of_semesters) }
        };

        try {
            const response = await postData("curriculums/", payload);

            if (response.success) {
                setPostSuccess("O'quv rejasi muvaffaqiyatli qo‘shildi!");
                setNewCurriculum({
                    name: "",
                    edu_direction: { name: "" },
                    start_year: { name: "" },
                    curriculum_template: { number_of_semesters: "" }
                });
                setTimeout(() => {
                    navigate('/study-process/plans');
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
                setSubmitError("O'quv rejasi qo‘shishda xatolik: " + errorMessage);
                console.error("O'quv rejasi qo‘shishda xatolik javobi:", response);
            }
        } catch (err) {
            console.error("O'quv rejasi qo‘shishda tarmoq xatolik:", err);
            setSubmitError("O'quv rejasi qo‘shishda tarmoq xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi O'quv Rejasi Qo‘shish</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleAddCurriculum} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">O'quv rejasi nomi</label>
                        <input
                            type="text"
                            name="name"
                            value={newCurriculum.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ta'lim yo'nalishi (nomi)</label>
                        <input
                            type="text"
                            name="edu_direction"
                            value={newCurriculum.edu_direction.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">O'quv yili (nomi)</label>
                        <input
                            type="text"
                            name="start_year"
                            value={newCurriculum.start_year.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aktiv semestrlar soni</label>
                        <input
                            type="number"
                            name="number_of_semesters"
                            value={newCurriculum.curriculum_template.number_of_semesters}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            required
                            min="1"
                        />
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
                            onClick={() => navigate('/study-process/plans')}
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

export default AddCurriculumPage;