import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';


const AddClassHourModal = ({ isOpen, onClose, onSubmit, existingClassHours = [] }) => {
    const [lessons, setLessons] = useState([]);
    const { t } = useTranslation();


    useEffect(() => {
        if (isOpen) {
            if (existingClassHours.length > 0) {
                const sortedHours = [...existingClassHours].sort((a, b) => a.pair_number - b.pair_number);

                const formattedHours = sortedHours.map(hour => ({
                    para: hour.pair_number + 1,
                    start_time: hour.begin_time ? hour.begin_time.substring(0, 5) : "",
                    end_time: hour.end_time ? hour.end_time.substring(0, 5) : "",
                }));
                setLessons(formattedHours);
            } else {

                setLessons([{ para: 1, start_time: "", end_time: "" }]);
            }
        }
    }, [isOpen, existingClassHours]);

    const handleAddLesson = () => {
        const lastPara = lessons.length > 0 ? lessons[lessons.length - 1].para : 0;
        setLessons((prev) => [
            ...prev,
            { para: lastPara + 1, start_time: "", end_time: "" },
        ]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...lessons];
        updated[index][field] = value;
        setLessons(updated);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const isValid = lessons.every(
            (l) => l.start_time && l.end_time
        );
        if (!isValid) {
            alert("Barcha paralar uchun vaqt to‘ldirilishi kerak!");
            return;
        }
        const payloadForApi = lessons.map(lesson => ({
            para: lesson.para - 1,
            start_time: lesson.start_time,
            end_time: lesson.end_time,
        }));

        onSubmit(payloadForApi);
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t("titled1")}</h2>
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                <form onSubmit={handleSave}>
                    {lessons.map((lesson, index) => (
                        <div key={index} className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="text-base font-medium text-gray-700 dark:text-gray-200">{lesson.para} {t("paraNumber")}</span>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 dark:text-gray-400">{t("startTimeLabel")}</label>
                                <input
                                    type="time"
                                    value={lesson.start_time}
                                    onChange={(e) => handleChange(index, "start_time", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 dark:text-gray-400">{t("endTimeLabel")}</label>
                                <input
                                    type="time"
                                    value={lesson.end_time}
                                    onChange={(e) => handleChange(index, "end_time", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                        </div>
                    ))}


                    <button
                        type="button"
                        onClick={handleAddLesson}
                        className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-150 mb-4"
                    >
                        {t("addPairButton")}
                    </button>


                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
                        >
                            {t("backButton")}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            {t("saveButton")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassHourModal;
