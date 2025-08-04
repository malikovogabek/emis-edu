import React, { useState, useEffect } from "react";
import { Form, Select, Input, Button, message, Card } from "antd";
import { fetchData, putData } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';


const { Option } = Select;

const CurriculumEditPage = () => {
    const [form] = Form.useForm();
    const [curriculumOptions, setCurriculumOptions] = useState([]);
    const [startYearOptions, setStartYearOptions] = useState([]);
    const [directionsOptions, setDirectionsOptions] = useState([]);
    const [evaluationOptions, setEvaluationOptions] = useState([]);
    const [languagesOptions, setLanguagesOptions] = useState([]);
    const [formsOptions, setFormsOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();


    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        loadOptions();
        loadCurriculumData();
    }, []);

    const loadOptions = async () => {
        try {
            const [curriculumRes, yearRes, directions, evaluation, languages, forms] = await Promise.all([
                fetchData('curriculum-templates/'),
                fetchData('edu-years/'),
                fetchData('edu-directions/'),
                fetchData('rating-types/'),
                fetchData('edu-languages/'),
                fetchData('edu-forms/')
            ]);

            if (curriculumRes.success) setCurriculumOptions(curriculumRes.results);
            if (yearRes.success) setStartYearOptions(yearRes.results);
            if (directions.success) setDirectionsOptions(directions.results);
            if (evaluation.success) setEvaluationOptions(evaluation.results);
            if (languages.success) setLanguagesOptions(languages.results);
            if (forms.success) setFormsOptions(forms.results);
        } catch (err) {
            message.error("Opsiyalarni yuklashda xato: " + err.message);
        }
    };

    const loadCurriculumData = async () => {
        try {
            const res = await fetchData(`curriculums/${id}/`);
            if (res.success) {
                const data = res.result;
                form.setFieldsValue({
                    name: data.name,
                    reja: data.curriculum_template_id,
                    edu_direction: data.edu_direction_id,
                    shakl: data.edu_form_id,
                    edu_language_id: data.edu_language_id,
                    ballik: data.rating_type_id,
                    start_year: data.start_year_code,
                    start_year2: data.end_year_code,
                    description: data.speciality?.uz || ''
                });
            } else {
                message.error("O'quv reja ma'lumotlarini yuklashda xato");
            }
        } catch (err) {
            message.error("Tarmoq xatolik: " + err.message);
        }

    };

    const handleUpdateCurriculum = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                curriculum_template_id: values.reja,
                edu_direction_id: values.edu_direction,
                edu_form_id: values.shakl,
                edu_language_id: values.edu_language_id,
                rating_type_id: values.ballik,
                start_year_code: values.start_year,
                end_year_code: values.start_year2,
            };

            const response = await putData(`curriculums/${id}/`, payload);

            if (response.success) {
                message.success("O‘quv rejasi muvaffaqiyatli yangilandi!");
                navigate("/study-process/plans");
            } else {
                message.error("Yangilashda xato");
            }
        } catch (err) {
            message.error("Tarmoq xatolik: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartYearChange = (value) => {
        const currentIndex = startYearOptions.findIndex(option => option.id === value);
        const nextItem = startYearOptions[currentIndex + 1];
        if (nextItem) {
            form.setFieldValue("start_year2", nextItem.id);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t("titlee")}</h1>

            <Card className="shadow-md">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateCurriculum}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                    <Form.Item label={t("curriculumTemplate")} name="reja" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang">
                            {curriculumOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("curriculumName")} name="name" rules={[{ required: true, message: "Majburiy" }]}>
                        <Input placeholder="Reja nomini kiriting" />
                    </Form.Item>

                    <Form.Item label={t("eduForm")} name="shakl" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang">
                            {formsOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("eduDirection")} name="edu_direction" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang">
                            {directionsOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("startYear")} name="start_year" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang" onChange={handleStartYearChange}>
                            {startYearOptions.map((option, idx) => (
                                <Option key={option.id} value={option.id} disabled={idx === startYearOptions.length - 1}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("endYear2")} name="start_year2" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select disabled>
                            {startYearOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("eduLanguage")} name="edu_language_id" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang">
                            {languagesOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name.uz}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("evaluationType")} name="ballik" rules={[{ required: true, message: "Majburiy" }]}>
                        <Select placeholder="Tanlang">
                            {evaluationOptions.map(option => (
                                <Option key={option.id} value={option.id}>{option.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="col-span-full">
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => navigate("/study-process/plans")}>{t("backButton")}</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>{t("updateButton")}</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CurriculumEditPage;
