import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../api/api';
import Loader from '../components/Loader';
import { Table, Button, message } from 'antd';

const LessonDistributionPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [lessonDistributionData, setLessonDistributionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSemester, setCurrentSemester] = useState(1);

    useEffect(() => {
        const loadLessonDistribution = async () => {
            setLoading(true);
            setError(null);
            try {
                const groupResponse = await fetchData(`edu-groups/${groupId}/`);

                if (groupResponse.success && groupResponse.result) {
                    const groupResult = groupResponse.result;
                    setCurrentSemester(groupResult.current_semester || 1);

                    if (groupResult.finance_curriculum_template && Array.isArray(groupResult.finance_curriculum_template.edu_subjects)) {
                        const rawEduSubjects = groupResult.finance_curriculum_template.edu_subjects;

                        const processedSubjects = await Promise.all(
                            rawEduSubjects.map(async (subject) => {
                                let eduSubjectName = 'N/A';
                                if (subject.edu_subject_id) {
                                    try {
                                        const eduSubjectRes = await fetchData(`edu-subjects/${subject.edu_subject_id}/`);
                                        if (eduSubjectRes.success && eduSubjectRes.result && eduSubjectRes.result.name) {
                                            eduSubjectName = eduSubjectRes.result.name;
                                        }
                                    } catch (fetchErr) {
                                        console.warn(`Fan nomi yuklashda xato (ID: ${subject.edu_subject_id}):`, fetchErr);
                                    }
                                }

                                let eduSubjectTypeName = 'N/A';
                                if (subject.edu_subject_type_id) {
                                    try {
                                        const eduSubjectTypeRes = await fetchData(`edu-subject-types/${subject.edu_subject_type_id}/`);
                                        if (eduSubjectTypeRes.success && eduSubjectTypeRes.result && eduSubjectTypeRes.result.name) {
                                            eduSubjectTypeName = eduSubjectTypeRes.result.name;
                                        }
                                    } catch (fetchErr) {
                                        console.warn(`Fan turi nomi yuklashda xato (ID: ${subject.edu_subject_type_id}):`, fetchErr);
                                    }
                                }

                                const semesterIndex = (groupResult.current_semester - 1) >= 0 ? (groupResult.current_semester - 1) : 0;
                                const currentSemesterWeeklyLoad = subject.semester_weekly_loads[semesterIndex] || 0;

                                return {
                                    ...subject,
                                    edu_subject: { name: eduSubjectName },
                                    edu_subject_type: { name: eduSubjectTypeName },
                                    current_semester_weekly_load: currentSemesterWeeklyLoad,
                                };
                            })
                        );
                        setLessonDistributionData(processedSubjects);
                    } else {
                        setLessonDistributionData([]);
                        message.info("Joriy semestr uchun o'quv soatlari taqsimoti ma'lumotlari topilmadi.");
                    }
                } else {
                    setLessonDistributionData([]);
                    const errorMessage = groupResponse.error
                        ? (typeof groupResponse.error === 'string' ? groupResponse.error : JSON.stringify(groupResponse.error))
                        : 'Kutilmagan javob formati';
                    setError(`Guruh ma'lumotlarini yuklashda xato: ${errorMessage}`);
                    message.error(`Guruh ma'lumotlarini yuklashda xato: ${errorMessage}`);
                    console.error("Guruh ma'lumotlari yuklashda xato:", groupResponse);
                }
            } catch (err) {
                console.error("O'quv soatlari taqsimotini yuklashda xatolik:", err);
                setError("O'quv soatlari taqsimotini yuklashda tarmoq xatoligi yuz berdi.");
                message.error("O'quv soatlari taqsimotini yuklashda tarmoq xatoligi yuz berdi.");
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            loadLessonDistribution();
        }
    }, [groupId]);

    const lessonDistributionColumns = [
        {
            title: 'N#',
            key: 'index',
            render: (text, record, index) => index + 1,
            width: 50
        },
        {
            title: 'Fan',
            dataIndex: ['edu_subject', 'name'],
            key: 'edu_subject_name',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Fan turi',
            dataIndex: ['edu_subject_type', 'name'],
            key: 'edu_subject_type_name',
            render: (text) => text || 'N/A',
        },
        {
            title: "Umumiy yuklama hajmi (Jami + Mustaqil ish)",
            dataIndex: 'total_hours',
            key: 'total_hours',
            render: (text) => text || 0
        },
        {
            title: `Jami o'quv soati (${currentSemester}-semestr)`,
            dataIndex: 'study_hours',
            key: 'study_hours',
            render: (text) => text || 0
        },
        {
            title: `Mustaqil ish (${currentSemester}-semestr)`,
            dataIndex: 'independent_work_hours',
            key: 'independent_work_hours',
            render: (text) => text || 0
        },
        {
            title: `Haftalik yuklama (${currentSemester}-semestr)`,
            dataIndex: 'current_semester_weekly_load',
            key: 'current_semester_weekly_load',
            render: (text) => text || 0
        },
    ];

    if (loading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 dark:text-red-400">
                <p>Xato: {error}</p>
                <Button onClick={() => navigate(-1)} className="mt-4">Ortga qaytish</Button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">O'quv soatlari taqsimoti (Guruh ID: {groupId})</h1>
                <Button type="default" onClick={() => navigate(-1)}>Ortga</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Table
                    columns={lessonDistributionColumns}
                    dataSource={lessonDistributionData}
                    pagination={false}
                    rowKey={(record, index) => record.id || index}
                    summary={(pageData) => {
                        let totalOverallLoad = 0;
                        let totalStudyHours = 0;
                        let totalIndependentHours = 0;
                        let totalWeeklyLoad = 0;

                        pageData.forEach((record) => {
                            totalOverallLoad += record.total_hours || 0;
                            totalStudyHours += record.study_hours || 0;
                            totalIndependentHours += record.independent_work_hours || 0;
                            totalWeeklyLoad += record.current_semester_weekly_load || 0;
                        });

                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}>
                                    <span className="font-bold">Jami:</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>
                                    <span className="font-bold">{totalOverallLoad}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2}>
                                    <span className="font-bold">{totalStudyHours}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>
                                    <span className="font-bold">{totalIndependentHours}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <span className="font-bold">{totalWeeklyLoad}</span>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                    locale={{
                        emptyText: (
                            <div className="text-center text-gray-400 py-10">
                                <img
                                    src="https://arm.sammoi.uz/bootstrap/images/not-found.png"
                                    alt="Empty"
                                    className="mx-auto w-16 h-16 mb-2"
                                />
                                <p>O'quv soatlari taqsimoti ma'lumotlari topilmadi.</p>
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
};

export default LessonDistributionPage;