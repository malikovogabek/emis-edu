import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { postData, fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AddStudyGroupPage = () => {
    const [form] = Form.useForm();
    const [curriculumsOptions, setCurriculumsOptions] = useState([]);
    const [startYearsOptions, setStartYearsOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                curriculum: parseInt(values.curriculum),
                start_year_code: parseInt(values.start_year_code),
                edu_form_id: 1,
                edu_language_id: 1,
                current_semester: parseInt(values.current_semester),
                institution_id: 10778,
                speciality: { uz: " ", ru: " ", en: " " },
                status: "APPROVED"
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
            message.error("Tarmoq xatolik: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Yangi Guruh Qo‘shish</h1>
            <Card className="shadow-md">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Guruh nomi"
                        name="name"
                        rules={[{ required: true, message: 'Guruh nomi majburiy' }]}
                    >
                        <Input placeholder="Masalan: 931-23" />
                    </Form.Item>

                    <Form.Item
                        label="O‘quv rejasi"
                        name="curriculum"
                        rules={[{ required: true, message: "O‘quv rejasi tanlanishi kerak" }]}
                    >
                        <Select placeholder="Tanlang">
                            {curriculumsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ochilgan o‘quv yili"
                        name="start_year_code"
                        rules={[{ required: true, message: "O‘quv yili tanlanishi kerak" }]}
                    >
                        <Select placeholder="Tanlang">
                            {startYearsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Joriy semestr"
                        name="current_semester"
                        rules={[{ required: true, type: 'number', min: 1, message: 'Semestr raqami 1 dan katta bo‘lishi kerak' }]}
                    >
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="default"
                                danger
                                onClick={() => navigate('/study-process/groups')}
                            >
                                Orqaga
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Qo‘shish
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddStudyGroupPage;
