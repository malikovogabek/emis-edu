// GroupRatingsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData, putData } from '../api/api';
import Loader from "../components/Loader";

const HARDCODED_SEMESTERS = [
    { id: 1, name: "I semestr" },
    { id: 2, name: "II semestr" },
    { id: 3, name: "III semestr" },
    { id: 4, name: "IV semestr" }
];

const GroupRatingsPage = () => {
    const { id: groupId } = useParams();
    const navigate = useNavigate();

    const [allSemesterRatings, setAllSemesterRatings] = useState({});
    const [allSubjects, setAllSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => () => { isMounted.current = false }, []);

    const loadSubjects = useCallback(async () => {
        try {
            const response = await fetchData(`edu-groups/${groupId}/edu-subjects/`);

            const subjectData = response.results || [];

            // console.log("Fanlar API javobi:", subjectData);

            const semesterSubjects = {};
            HARDCODED_SEMESTERS.forEach((sem, index) => {
                const semesterArray = subjectData[index] || [];
                semesterSubjects[sem.id] = semesterArray

                    .map((sub) => ({
                        id: sub.id,
                        name:
                            sub.name?.uz ||
                            sub.name?.en ||
                            sub.name?.ru ||
                            `Noma'lum fan (${sub.id})`,
                    }));
            });

            setAllSubjects(semesterSubjects);
        } catch (err) {
            console.error("❌ Fanlarni yuklashda xato:", err);
            setError("Fanlarni yuklashda xatolik: " + (err.message || JSON.stringify(err)));
            setAllSubjects({});
        }
    }, [groupId]);


    const formatSemesterData = (studentsData) => {
        return studentsData.map((studentData) => {
            const student = studentData.student || {};
            const citizen = student.citizen || {};
            const eduSubjectRatings = studentData.edu_subject_ratings || [];

            return {
                id: student.id,
                first_name: citizen.first_name || "Ism yo'q",
                last_name: citizen.last_name || "Familiya yo'q",
                middle_name: citizen.middle_name || "",
                subjects_ratings: eduSubjectRatings.map((sr) => ({
                    subject_id: sr.edu_subject_id,
                    grade: sr.rating ?? "",
                })),
            };
        });
    };


    const loadAllStudentRatings = useCallback(async () => {
        let tempAllRatings = {};
        const response = await fetchData(`edu-groups/${groupId}/student-ratings/`);
        const studentsData = response.results || [];

        HARDCODED_SEMESTERS.map(async (semester, index) => {
            const formattedStudents = formatSemesterData(studentsData[index]);
            tempAllRatings[semester.id] = formattedStudents;

        });
        setAllSemesterRatings(tempAllRatings);
    }, [groupId]);



    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([
                    loadSubjects(),
                    loadAllStudentRatings()
                ]);
            } catch (err) {
                setError("Ma'lumotlarni yuklashda xatolik: " + (err.message || JSON.stringify(err)));
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [groupId, loadSubjects, loadAllStudentRatings]);

    const handleRatingChange = useCallback((semesterId, studentId, subjectId, newGrade) => {
        setAllSemesterRatings(prev => ({
            ...prev,
            [semesterId]: prev[semesterId].map(student =>
                student.id === studentId
                    ? {
                        ...student,
                        subjects_ratings: student.subjects_ratings.map(subject =>
                            subject.subject_id === subjectId
                                ? { ...subject, grade: newGrade }
                                : subject
                        )
                    }
                    : student
            )
        }));
    }, []);

    const handleSaveRatings = useCallback(async () => {
        setLoading(true);
        setError(null);
        let errorMessages = [];

        for (const semester of HARDCODED_SEMESTERS) {
            const currentRatings = allSemesterRatings[semester.id];
            if (!currentRatings || currentRatings.length === 0) continue;

            try {
                const payload = {
                    semester_id: semester.id,
                    student_ratings: currentRatings.map(student => ({
                        student_id: student.id,
                        ratings: student.subjects_ratings.map(s => ({
                            subject_id: s.subject_id,
                            grade: parseInt(s.grade) || 0
                        }))
                    }))
                };

                const response = await putData(`edu-groups/${groupId}/student-ratings/`, payload);
                if (!response.success) {
                    errorMessages.push(`Xato: ${semester.name}`);
                }
            } catch (err) {
                errorMessages.push(`Xato: ${semester.name} - ${err.message}`);
            }
        }

        if (errorMessages.length) {
            setError(errorMessages.join('\n'));
            alert("Xatoliklar:\n" + errorMessages.join('\n'));
        } else {
            alert("Baholar saqlandi!");
            navigate(-1);
        }
        setLoading(false);
    }, [allSemesterRatings, groupId, navigate]);

    if (loading) return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <div className="flex justify-between mb-4">
                <h1 className="text-3xl font-bold">Guruh baholari</h1>
                <div className="flex justify-end gap-3">
                    <button onClick={handleSaveRatings}
                        className="px-4 py-2 bg-green-500 text-white rounded">
                        Saqlash
                    </button>
                    <button onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-white text-red-600 text-sm rounded-md  transition duration-200">
                        Orqaga
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {HARDCODED_SEMESTERS.map(semester => {
                const students = allSemesterRatings[semester.id] || [];
                const subjects = allSubjects[semester.id] || [];
                const inputVisiblity = semester.id !== 1

                return (
                    <div key={semester.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4">{semester.name}</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 sticky left-0 bg-white dark:bg-gray-800 z-10">F.I.Sh.</th>
                                        {subjects.map(sub => (
                                            <th key={sub.id} className="px-4 py-2">{sub.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => {
                                        return (
                                            <tr key={student.id}>
                                                <td className="px-4 py-2 sticky left-0 bg-white dark:bg-gray-800">
                                                    {student.last_name || student.first_name || student.middle_name
                                                        ? `${student.last_name || ''} ${student.first_name || ''} ${student.middle_name || ''}`
                                                        : "Ism-familiya yo'q"}
                                                </td>
                                                {subjects.map(subject => {
                                                    const rating = student.subjects_ratings.find(r => r.subject_id === subject.id);
                                                    return (
                                                        <td key={subject.id} className="px-2 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="5"
                                                                disabled={inputVisiblity}
                                                                value={rating?.grade ?? ''}
                                                                onChange={(e) =>
                                                                    handleRatingChange(semester.id, student.id, subject.id, e.target.value)
                                                                }
                                                                className="w-20 border px-2 py-1 rounded"
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>
                        </div>
                        {subjects.length === 0 || students.length === 0 && (
                            <p className="text-gray-500 mt-4">Fanlar yoki baholar topilmadi.
                            </p>
                        )}
                    </div>
                );
            })}

            <div className="flex justify-end gap-3">
                <button onClick={handleSaveRatings} className="px-4 py-2 bg-indigo-600 text-white rounded">
                    Saqlash
                </button>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-300 text-black rounded">
                    Bekor qilish
                </button>
            </div>
        </div>
    );
};

export default GroupRatingsPage;
