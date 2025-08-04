import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { postData, fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const AddStudyGroupPage = () => {
    const [form] = Form.useForm();
    const [curriculumsOptions, setCurriculumsOptions] = useState([]);
    const [startYearsOptions, setStartYearsOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();


    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [curriculumsRes, yearsRes] = await Promise.all([
                    fetchData('curriculums/'),
                    fetchData('edu-years/')
                ]);

                if (curriculumsRes.success) setCurriculumsOptions(curriculumsRes.results);
                else message.error("O'quv rejalarini yuklashda xatolik");

                if (yearsRes.success) setStartYearsOptions(yearsRes.results);
                else message.error("O'quv yillarini yuklashda xatolik");
            } catch (err) {
                message.error("Ma'lumotlarni yuklashda tarmoq xatolik: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, []);

    const onFinish = async (values) => {

        setLoading(true);
        try {
            const payload = {
                name: values.name,
                curriculum_id: parseInt(values.curriculum),
                start_year_code: parseInt(values.start_year_code),
                end_year_code: parseInt(values.start_year_code2),
                current_semester: parseInt(values.current_semester),
                number_of_students: parseInt(values.soni),
                description: " ",
            };




            const response = await postData('edu-groups/', payload);

            if (response.success) {
                message.success("Guruh muvaffaqiyatli qo'shildi!");
                form.resetFields();
                setTimeout(() => navigate('/study-process/groups'), 1500);
            } else {
                const err = response.error;
                let errorMessage = 'Noma`lum xatolik';
                if (err?.detail) errorMessage = err.detail;
                else if (err?.message) errorMessage = err.message;
                else if (err?.non_field_errors) errorMessage = err.non_field_errors.join(', ');
                message.error("Xatolik: " + errorMessage);
            }
        } catch (err) {
            console.error("Tarmoq xatolik:", err.response?.data || err.message);
            message.error("Tarmoq xatolik: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleStartYearsChange = (value) => {
        const currentIndex = startYearsOptions.findIndex(option => option.id === value);
        const nextItem = startYearsOptions[currentIndex + 1];
        if (nextItem) {
            form.setFieldsValue({ start_year_code2: nextItem.id });
        } else {
            form.setFieldsValue({ start_year_code2: null });
        }
    };


    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t("newGroupAdd")}</h1>
            <Card className="shadow-md  dark:bg-gray-900">
                <Form className="grid grid-cols-1 md:grid-cols-2  gap-3"
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label={t("groupName")}
                        name="name"
                        rules={[{ required: true, message: 'Guruh nomi majburiy' }]}
                    >
                        <Input placeholder="Masalan: 931-23" />
                    </Form.Item>

                    <Form.Item
                        label={t("curriculum")}
                        name="curriculum"
                        rules={[{ required: true, message: "O‘quv rejasi tanlanishi kerak" }]}
                    >
                        <Select placeholder={t("selectPlaceholder")}>
                            {curriculumsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("startYear")}
                        name="start_year_code"
                        rules={[{ required: true, message: "O‘quv yili tanlanishi kerak" }]}
                    >
                        <Select placeholder={t("selectPlaceholder")} onChange={handleStartYearsChange}>
                            {startYearsOptions.map((option, idx) => (
                                <Select.Option key={option.id} value={option.id} disabled={idx === startYearsOptions.length - 1}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("endYear")}
                        name="start_year_code2"
                        rules={[{ required: true, message: "Boshlanish yili kerak" }]}
                    >
                        <Select disabled>
                            {startYearsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>
                                    {option.name}
                                </Select.Option>
                            ))}
                        </Select>


                    </Form.Item>

                    <Form.Item
                        label={t("groupnamber")}
                        name="soni"
                        rules={[{ required: true, type: Number, message: "Boshlanish yili kerak" }]}
                    >
                        <Input placeholder="" />
                    </Form.Item>

                    <Form.Item
                        label={t("currentSemester")}
                        name="current_semester"
                        rules={[{ required: true, type: 'number', min: 1, message: 'Semestr raqami 1 dan katta bo‘lishi kerak' }]}
                    >
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>

                    <Form.Item className="col-span-full">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="default"
                                danger
                                onClick={() => navigate('/study-process/groups')}
                            >
                                {t("backButton")}
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {t("addButton")}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddStudyGroupPage;
