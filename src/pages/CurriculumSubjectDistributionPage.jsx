import {
    DeleteOutlined,
    PlusOutlined,
    RollbackOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Table, message, DatePicker, Checkbox, Modal } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchData, postData } from "../api/api";
import dayjs from "dayjs";

const { Option } = Select;

const CurriculumSubjectDistributionPage = () => {
    const [allCurriculumSubjects, setAllCurriculumSubjects] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();


    const [professionalSubjects, setProfessionalSubjects] = useState([]);
    const [dakSubjects, setDakSubjects] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentSubjectType, setCurrentSubjectType] = useState(null);
    const [newSubjectData, setNewSubjectData] = useState({
        name_uz: "",
        name_ru: "",
        name_en: "",
        allocated_hours: "",
    });

    const [semesterSubjects, setSemesterSubjects] = useState({
        1: [],
        2: [],
        3: [],
        4: [],
    });

    const [semesterDates, setSemesterDates] = useState({
        1: { start: null, end: null },
        2: { start: null, end: null },
        3: { start: null, end: null },
        4: { start: null, end: null },
    });

    useEffect(() => {
        const loadSubjects = async () => {
            const response = await fetchData("edu-subjects/");
            if (response.success && response.results) {
                setSubjects(response.results);
            } else {
                message.error("Fanlar ro'yxatini yuklashda xatolik yuz berdi.");
            }
        };
        loadSubjects();
    }, []);

    const loadCurriculumDetails = useCallback(async () => {
        setLoading(true);
        try {
            const responseData = await fetchData(`curriculums/${id}/`);
            if (responseData.success && responseData.result) {
                const curriculum = responseData.result;

                const loadedAllCurriculumSubjects = curriculum.edu_subject.map(item => {
                    const subjectDetails = item.edu_subject || {};
                    const totalHours = (
                        (parseFloat(item.lecture_hours || 0)) +
                        (parseFloat(item.seminar_hours || 0)) +
                        (parseFloat(item.practice_hours || 0)) +
                        (parseFloat(item.laboratory_hours || 0)) +
                        (parseFloat(item.independent_hours || 0))
                    );

                    return {
                        key: item.id || `${subjectDetails.id}-${Math.random()}`,
                        edu_subject_id: subjectDetails.id,
                        subject_name: subjectDetails.name?.uz,
                        subject_type_name: subjectDetails.edu_subject_type?.name,
                        lecture_hours: item.lecture_hours > 0 ? item.lecture_hours : "",
                        seminar_hours: item.seminar_hours > 0 ? item.seminar_hours : "",
                        practice_hours: item.practice_hours > 0 ? item.practice_hours : "",
                        laboratory_hours: item.laboratory_hours > 0 ? item.laboratory_hours : "",
                        independent_hours: item.independent_hours > 0 ? item.independent_hours : "",
                        study_hours: totalHours > 0 ? totalHours : "",
                    };
                });
                setAllCurriculumSubjects(loadedAllCurriculumSubjects);


                const loadedSemesterSubjects = { 1: [], 2: [], 3: [], 4: [] };
                const loadedSemesterDates = { 1: { start: null, end: null }, 2: { start: null, end: null }, 3: { start: null, end: null }, 4: { start: null, end: null } };

                if (curriculum.semester_edu_subjects && Array.isArray(curriculum.semester_edu_subjects)) {
                    curriculum.semester_edu_subjects.forEach(semesterBlock => {
                        if (Array.isArray(semesterBlock) && semesterBlock.length > 0) {
                            const semesterNumber = semesterBlock[0].semester_number;

                            loadedSemesterSubjects[semesterNumber] = semesterBlock.map(item => {
                                const totalSemesterHours = (parseFloat(item.lecture_hours || 0) + parseFloat(item.independent_hours || 0));
                                return {
                                    key: item.id || `${item.edu_subject.id}-${semesterNumber}-${Math.random()}`,
                                    edu_subject_id: item.edu_subject.id,
                                    subject_name: item.edu_subject.name.uz,
                                    subject_type_name: item.edu_subject.edu_subject_type?.name,
                                    lecture_hours: item.lecture_hours > 0 ? item.lecture_hours : "",
                                    independent_hours: item.independent_hours > 0 ? item.independent_hours : "",
                                    study_hours: totalSemesterHours > 0 ? totalSemesterHours : "",
                                    can_be_divided: item.can_be_divided,
                                    is_required: item.is_required,
                                    semester_number: item.semester_number,
                                };
                            });
                        }
                    });
                }

                if (curriculum.semester_dates && Array.isArray(curriculum.semester_dates)) {
                    curriculum.semester_dates.forEach(dateItem => {
                        if (dateItem.semester_number) {
                            loadedSemesterDates[dateItem.semester_number] = {
                                start: dateItem.start_date ? dayjs(dateItem.start_date) : null,
                                end: dateItem.end_date ? dayjs(dateItem.end_date) : null,
                            };
                        }
                    });
                }

                setSemesterSubjects(loadedSemesterSubjects);
                setSemesterDates(loadedSemesterDates);

            } else {
                message.error("O'quv rejasi ma'lumotlari topilmadi yoki xato: " + JSON.stringify(responseData));
                setAllCurriculumSubjects([]);
                setSemesterSubjects({ 1: [], 2: [], 3: [], 4: [] });
                setSemesterDates({ 1: { start: null, end: null }, 2: { start: null, end: null }, 3: { start: null, end: null }, 4: { start: null, end: null } });
            }
        } catch (err) {
            console.error("O'quv rejasi ma'lumotlarini yuklashda xatolik:", err);
            message.error("O'quv rejasi ma'lumotlarini yuklashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setAllCurriculumSubjects([]);
            setSemesterSubjects({ 1: [], 2: [], 3: [], 4: [] });
            setSemesterDates({ 1: { start: null, end: null }, 2: { start: null, end: null }, 3: { start: null, end: null }, 4: { start: null, end: null } });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadCurriculumDetails();
    }, [loadCurriculumDetails]);

    const handleAllSubjectsInputChange = (value, key, field) => {
        setAllCurriculumSubjects((prev) =>
            prev.map((item) => {
                if (item.key === key) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === "edu_subject_id") {
                        const selectedSubject = subjects.find(s => s.id === value);
                        if (selectedSubject) {
                            updatedItem.subject_name = selectedSubject.name?.uz;
                            updatedItem.subject_type_name = selectedSubject.edu_subject_type?.name;
                        }
                    }

                    const lecture = parseFloat(updatedItem.lecture_hours || 0);
                    const seminar = parseFloat(updatedItem.seminar_hours || 0);
                    const practice = parseFloat(updatedItem.practice_hours || 0);
                    const lab = parseFloat(updatedItem.laboratory_hours || 0);
                    const independent = parseFloat(updatedItem.independent_hours || 0);

                    const total = lecture + seminar + practice + lab + independent;
                    updatedItem.study_hours = total > 0 ? total : "";

                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleSemesterSubjectInputChange = (semesterNum, value, key, field) => {
        setSemesterSubjects(prev => {
            const updatedSemester = prev[semesterNum].map(item => {
                if (item.key === key) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === "edu_subject_id") {
                        const selectedSubject = subjects.find(s => s.id === value);
                        if (selectedSubject) {
                            updatedItem.subject_name = selectedSubject.name?.uz;
                            updatedItem.subject_type_name = selectedSubject.edu_subject_type?.name;
                        }
                    }
                    const lecture = parseFloat(updatedItem.lecture_hours || 0);
                    const independent = parseFloat(updatedItem.independent_hours || 0);
                    const total = lecture + independent;
                    updatedItem.study_hours = total > 0 ? total : "";
                    return updatedItem;
                }
                return item;
            });
            return {
                ...prev,
                [semesterNum]: updatedSemester
            };
        });
    };

    const showModal = (type) => {
        setCurrentSubjectType(type);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNewSubjectData({
            name_uz: "",
            name_ru: "",
            name_en: "",
            allocated_hours: "",
        });
        setCurrentSubjectType(null);
    };


    const handleNewSubjectInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubjectData(prev => ({ ...prev, [name]: value }));
    };

    const handleModalOk = async () => {
        const newSubject = {
            key: Date.now(),
            name_uz: newSubjectData.name_uz,
            name_ru: newSubjectData.name_ru,
            name_en: newSubjectData.name_en,
            allocated_hours: newSubjectData.allocated_hours > 0 ? newSubjectData.allocated_hours : "", // 0 bo'lsa bo'sh qoldirish
        };

        if (currentSubjectType === 'all') {
            message.warn("Ushbu modal orqali umumiy fanlar ro'yxatiga fan qo'shish funksiyasi hozircha mavjud emas.");
        } else if (currentSubjectType === 'professional') {
            setProfessionalSubjects(prev => [...prev, newSubject]);
            message.success("Kasbiy fan qo'shildi!");
        } else if (currentSubjectType === 'dak') {
            setDakSubjects(prev => [...prev, newSubject]);
            message.success("DAK fani qo'shildi!");
        }

        setIsModalVisible(false);
        setNewSubjectData({
            name_uz: "",
            name_ru: "",
            name_en: "",
            allocated_hours: "",
        });
        setCurrentSubjectType(null);
    };

    const handleAddAllSubjectsRow = () => {
        const newRow = {
            key: Date.now(),
            edu_subject_id: null,
            subject_name: "",
            subject_type_name: "",
            lecture_hours: "",
            seminar_hours: "",
            practice_hours: "",
            laboratory_hours: "",
            independent_hours: "",
            study_hours: "",
        };
        setAllCurriculumSubjects((prev) => [...prev, newRow]);
    };


    const handleDeleteAllSubjectsRow = (key) => {
        setAllCurriculumSubjects((prev) => prev.filter((item) => item.key !== key));
    };

    // Kasbiy fan yoki DAK fanini o'chirish
    const handleDeleteCustomSubject = (type, key) => {
        if (type === 'professional') {
            setProfessionalSubjects(prev => prev.filter(item => item.key !== key));
        } else if (type === 'dak') {
            setDakSubjects(prev => prev.filter(item => item.key !== key));
        }
    };


    const handleAddSemesterRow = (semesterNumber) => {
        const newRow = {
            key: Date.now(),
            edu_subject_id: null,
            subject_name: "",
            subject_type_name: "",
            lecture_hours: "",
            independent_hours: "",
            study_hours: "",
            can_be_divided: false,
            is_required: false,
            semester_number: semesterNumber,
        };
        setSemesterSubjects((prev) => ({
            ...prev,
            [semesterNumber]: [...prev[semesterNumber], newRow],
        }));
    };

    const handleDeleteSemesterRow = (semesterNumber, key) => {
        setSemesterSubjects((prev) => ({
            ...prev,
            [semesterNumber]: prev[semesterNumber].filter((item) => item.key !== key),
        }));
    };

    const handleSemesterDateChange = (semester, type, date) => {
        setSemesterDates((prev) => ({
            ...prev,
            [semester]: {
                ...prev[semester],
                [type]: date,
            },
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const semesterSubjectsPayload = [];
            for (const semNum in semesterSubjects) {
                semesterSubjects[semNum].forEach(item => {
                    if (item.edu_subject_id) {
                        semesterSubjectsPayload.push({
                            curriculum_id: parseInt(id),
                            edu_subject_id: item.edu_subject_id,
                            semester_number: parseInt(semNum),
                            lecture_hours: parseFloat(item.lecture_hours || 0),
                            seminar_hours: parseFloat(item.seminar_hours || 0),
                            practice_hours: parseFloat(item.practice_hours || 0),
                            laboratory_hours: parseFloat(item.laboratory_hours || 0),
                            independent_hours: parseFloat(item.independent_hours || 0),
                            study_hours: parseFloat(item.study_hours || 0),
                            can_be_divided: item.can_be_divided,
                            is_required: item.is_required,
                        });
                    }
                });
            }

            const datesPayload = [];
            for (const semNum in semesterDates) {
                const dateData = semesterDates[semNum];
                if (dateData.start && dateData.end) {
                    datesPayload.push({
                        curriculum_id: parseInt(id),
                        semester_number: parseInt(semNum),
                        start_date: dateData.start.format('YYYY-MM-DD'),
                        end_date: dateData.end.format('YYYY-MM-DD'),
                    });
                }
            }


            console.log("Kasbiy fanlar saqlash uchun:", professionalSubjects);
            console.log("DAK fanlari saqlash uchun:", dakSubjects);


            await postData(`curriculums/${id}/subjects/distribute/`, {
                subjects: semesterSubjectsPayload,
                semester_dates: datesPayload
            });

            message.success("Ma’lumotlar saqlandi!");
            loadCurriculumDetails();
        } catch (err) {
            console.error("Ma'lumotlarni saqlashda xatolik:", err);
            message.error("Ma'lumotlarni saqlashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const allSubjectsColumns = [
        {
            title: "Fan nomi",
            dataIndex: "edu_subject_id",
            render: (value, record) => {
                return (
                    <Select
                        placeholder="Fan tanlang"
                        showSearch
                        optionFilterProp="children"
                        style={{ width: "100%" }}
                        value={value}
                        onChange={(val) => handleAllSubjectsInputChange(val, record.key, "edu_subject_id")}
                    >
                        {subjects.map((subject) => (
                            <Option key={subject.id} value={subject.id}>
                                {`${subject.name.uz} (${subject.edu_subject_type?.name || 'N/A'})`}
                            </Option>
                        ))}
                    </Select>
                );
            },
            width: 300,
        },
        {
            title: "Nazariya",
            dataIndex: "lecture_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => handleAllSubjectsInputChange(e.target.value, record.key, "lecture_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Seminar",
            dataIndex: "seminar_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => handleAllSubjectsInputChange(e.target.value, record.key, "seminar_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Amaliyot",
            dataIndex: "practice_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => handleAllSubjectsInputChange(e.target.value, record.key, "practice_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Laboratoriya",
            dataIndex: "laboratory_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => handleAllSubjectsInputChange(e.target.value, record.key, "laboratory_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Mustaqil ish",
            dataIndex: "independent_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) =>
                        handleAllSubjectsInputChange(e.target.value, record.key, "independent_hours")
                    }
                    controls={false}
                />
            ),
        },
        {
            title: "Jami",
            dataIndex: "study_hours",
            render: (value) => <Input disabled value={value} />,
        },
        {
            title: "Amallar",
            dataIndex: "actions",
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAllSubjectsRow(record.key)}
                />
            ),
        },
    ];
    const handleCustomSubjectInputChange = (type, value, key, field) => {
        if (type === 'professional') {
            setProfessionalSubjects(prev =>
                prev.map(item => (item.key === key ? { ...item, [field]: value } : item))
            );
        } else if (type === 'dak') {
            setDakSubjects(prev =>
                prev.map(item => (item.key === key ? { ...item, [field]: value } : item))
            );
        }
    };

    const customSubjectColumns = (type) => [
        {
            title: "Fan nomi (uz)",
            dataIndex: "name_uz",
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleCustomSubjectInputChange(type, e.target.value, record.key, "name_uz")}
                />
            ),
        },
        {
            title: "Fan nomi (ru)",
            dataIndex: "name_ru",
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleCustomSubjectInputChange(type, e.target.value, record.key, "name_ru")}
                />
            ),
        },
        {
            title: "Fan nomi (en)",
            dataIndex: "name_en",
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleCustomSubjectInputChange(type, e.target.value, record.key, "name_en")}
                />
            ),
        },
        {
            title: "Ajratilgan Soati",
            dataIndex: "allocated_hours",
            render: (text, record) => (
                <Input
                    type="number"
                    min={0}
                    value={text}
                    onChange={(e) => handleCustomSubjectInputChange(type, e.target.value, record.key, "allocated_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Amallar",
            dataIndex: "actions",
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCustomSubject(type, record.key)}
                />
            ),
        },
    ];

    const TopButtons = () => (
        <div className="flex justify-between items-center mb-4 p-3 w-full">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">O‘quv rejadagi jami fanlar</h1>
            <div className="space-x-2">
                <Button type="primary" onClick={handleSave} loading={loading}>
                    <SaveOutlined /> Saqlash
                </Button>

                <Button className="bg-white text-red-600 border border-gray-300 dark:border-gray-700"
                    onClick={() => navigate(`/study-process/plans/details/${id}`)} >
                    <RollbackOutlined /> Orqaga
                </Button>
            </div>
        </div>
    );

    const semesterSubjectTableColumns = [
        {
            title: "Fan nomi",
            dataIndex: "edu_subject_id",
            render: (value, record) => {
                return (
                    <Select
                        placeholder="Fan tanlang"
                        showSearch
                        optionFilterProp="children"
                        style={{ width: "100%" }}
                        value={value}
                        onChange={(val) => handleSemesterSubjectInputChange(record.semester_number, val, record.key, "edu_subject_id")}
                    >
                        {subjects.map((subject) => (
                            <Option key={subject.id} value={subject.id}>
                                {`${subject.name.uz} (${subject.edu_subject_type?.name || 'N/A'})`}
                            </Option>
                        ))}
                    </Select>
                );
            },
            width: 300,
        },
        {
            title: "Fan bo'linishi",
            dataIndex: "can_be_divided",
            render: (value, record) => (
                <Checkbox
                    checked={value}
                    onChange={(e) => handleSemesterSubjectInputChange(record.semester_number, e.target.checked, record.key, "can_be_divided")}
                />
            ),
            width: 100,
        },
        {
            title: "O'quv soati",
            dataIndex: "lecture_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => handleSemesterSubjectInputChange(record.semester_number, e.target.value, record.key, "lecture_hours")}
                    controls={false}
                />
            ),
        },
        {
            title: "Mustaqil ish",
            dataIndex: "independent_hours",
            render: (value, record) => (
                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) =>
                        handleSemesterSubjectInputChange(record.semester_number, e.target.value, record.key, "independent_hours")
                    }
                    controls={false}
                />
            ),
        },
        {
            title: "Jami",
            dataIndex: "study_hours",
            render: (value) => (
                <Input disabled value={value} />
            ),
        },
        {
            title: "Amallar",
            dataIndex: "actions",
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteSemesterRow(record.semester_number, record.key)}
                />
            ),
        },
    ];

    const renderSemesterSection = (semesterNum) => (
        <Card className="w-full mb-8" key={`semester-section-${semesterNum}`}>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {semesterNum}-semestr
            </h2>

            <div className="flex flex-wrap gap-4 items-center mb-4">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                    * {semesterNum} semestr oraliq sanasi:
                </label>
                <DatePicker
                    placeholder="Boshlanish sanasi"
                    value={semesterDates[semesterNum]?.start}
                    onChange={(date) => handleSemesterDateChange(semesterNum, "start", date)}
                    format="YYYY-MM-DD"
                />
                <span className="mx-2">→</span>
                <DatePicker
                    placeholder="Tugash sanasi"
                    value={semesterDates[semesterNum]?.end}
                    onChange={(date) => handleSemesterDateChange(semesterNum, "end", date)}
                    format="YYYY-MM-DD"
                />
            </div>

            {semesterSubjects[semesterNum] && semesterSubjects[semesterNum].length > 0 ? (
                <Table
                    dataSource={semesterSubjects[semesterNum]}
                    columns={semesterSubjectTableColumns}
                    pagination={false}
                    rowKey="key"
                    bordered
                    scroll={{ x: "100%" }}
                    className="bg-white dark:bg-gray-800"
                />
            ) : (
                <div className="flex justify-center py-6">
                    <p className="text-gray-500">Ma'lumot topilmadi</p>
                </div>
            )}

            <div className="flex justify-center mt-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddSemesterRow(semesterNum)}
                    className="w-full md:w-full lg:w-full"
                >
                    Yana fan qo‘shish
                </Button>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen overflow-y-auto bg-slate-200 dark:bg-gray-900 p-6 flex flex-col flex-1">
            <Card >
                <TopButtons />
                <Card className="w-full mb-6 ">
                    <Table
                        columns={allSubjectsColumns}
                        dataSource={allCurriculumSubjects}
                        pagination={false}
                        bordered
                        scroll={{ x: "100%" }}
                        rowKey="key"
                        className="bg-white dark:bg-gray-800"
                    />
                    <div className="flex justify-center mt-4">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddAllSubjectsRow}
                            className="w-full md:w-full lg:w-full"
                        >
                            Fan qo‘shish
                        </Button>
                    </div>
                </Card>
            </Card>
            <br />
            <Card>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Semestrlar kesimida fanlarni taqsimlash</h1>
                {renderSemesterSection(1)}
                {renderSemesterSection(2)}
                {renderSemesterSection(3)}
                {renderSemesterSection(4)}
            </Card>
            <br />
            <Card className="w-full mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Kasbiy fanni kiritish</h1>
                <Table
                    columns={customSubjectColumns('professional')}
                    dataSource={professionalSubjects}
                    pagination={false}
                    bordered
                    rowKey="key"
                    className="bg-white dark:bg-gray-800"
                    locale={{ emptyText: "Ma'lumot topilmadi" }}
                />
                <div className="flex justify-center mt-4">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal('professional')}
                        className="w-full md:w-full lg:w-full"
                    >
                        Fan qo‘shish
                    </Button>
                </div>
            </Card>
            <Card className="w-full mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">DAK kiritish</h1>
                <Table
                    columns={customSubjectColumns('dak')}
                    dataSource={dakSubjects}
                    pagination={false}
                    bordered
                    rowKey="key"
                    className="bg-white dark:bg-gray-800"
                    locale={{ emptyText: "Ma'lumot topilmadi" }}
                />
                <div className="flex justify-center mt-4">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal('dak')}
                        className="w-full md:w-full lg:w-full"
                    >
                        Fan qo'shish
                    </Button>
                </div>
            </Card>
            <br /><br /> <br />


            <Modal
                title="Yangi fan qo'shish"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleCancel}
                okText="Saqlash"
                cancelText="Bekor qilish"
            >
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="name_uz">Fan nomi (uz)</label>
                    <Input
                        id="name_uz"
                        name="name_uz"
                        value={newSubjectData.name_uz}
                        onChange={handleNewSubjectInputChange}

                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="name_ru">Fan nomi (ru)</label>
                    <Input
                        id="name_ru"
                        name="name_ru"
                        value={newSubjectData.name_ru}
                        onChange={handleNewSubjectInputChange}

                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="name_en">Fan nomi (en)</label>
                    <Input
                        id="name_en"
                        name="name_en"
                        value={newSubjectData.name_en}
                        onChange={handleNewSubjectInputChange}

                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="allocated_hours">Ajratilgan Soati</label>
                    <Input
                        id="allocated_hours"
                        name="allocated_hours"
                        type="number"
                        min={0}
                        value={newSubjectData.allocated_hours}
                        onChange={handleNewSubjectInputChange}
                        controls={false}
                    />
                </div>
            </Modal>

        </div>
    );
};

export default CurriculumSubjectDistributionPage;