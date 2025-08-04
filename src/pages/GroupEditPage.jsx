import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { fetchData, putData } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const EditGroupPage = () => {
    const [form] = Form.useForm();
    const [curriculumsOptions, setCurriculumsOptions] = useState([]);
    const [startYearsOptions, setStartYearsOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();


    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [curriculumsRes, yearsRes, groupRes] = await Promise.all([
                    fetchData('curriculums/'),
                    fetchData('edu-years/'),
                    fetchData(`edu-groups/${id}/`)
                ]);

                if (curriculumsRes.success) setCurriculumsOptions(curriculumsRes.results);
                else message.error("O'quv rejalarini yuklashda xatolik");

                if (yearsRes.success) setStartYearsOptions(yearsRes.results);
                else message.error("O'quv yillarini yuklashda xatolik");

                if (groupRes.success) {
                    const res = groupRes.result;
                    form.setFieldsValue({
                        name: res.name,
                        curriculum: res.curriculum_id,
                        start_year_code: res.start_year_code,
                        start_year_code2: res.end_year_code,
                        soni: res.number_of_students,
                        current_semester: res.current_semester
                    });
                } else {
                    message.error("Guruh ma'lumotlarini yuklashda xatolik");
                }
            } catch (err) {
                message.error("Ma'lumotlarni yuklashda tarmoq xatolik: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, [id, form]);

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
                description: "",
            };

            const response = await putData(`edu-groups/${id}/`, payload);

            if (response.success) {
                message.success("Guruh ma'lumotlari yangilandi!");
                navigate('/study-process/groups');
            } else {
                message.error("Xatolik: " + (response.error?.detail || 'Nomalum xato'));
            }
        } catch (err) {
            console.error("Tarmoq xatolik:", err);
            message.error("Tarmoq xatolik: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartYearsChange = (value) => {
        const currentIndex = startYearsOptions.findIndex(option => option.id === value);
        const nextItem = startYearsOptions[currentIndex + 1];
        form.setFieldsValue({ start_year_code2: nextItem ? nextItem.id : null });
    };


    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t("groupEdit")}</h1>
            <Card className="shadow-md dark:bg-gray-900">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                    <Form.Item label={t("groupName")} name="name" rules={[{ required: true, message: 'Guruh nomi majburiy' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label={t("curriculum")} name="curriculum" rules={[{ required: true }]}>
                        <Select>
                            {curriculumsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("startYear")} name="start_year_code" rules={[{ required: true }]}>
                        <Select onChange={handleStartYearsChange}>
                            {startYearsOptions.map((option, idx) => (
                                <Select.Option key={option.id} value={option.id} disabled={idx === startYearsOptions.length - 1}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("endYear")} name="start_year_code2" rules={[{ required: true }]}>
                        <Select disabled>
                            {startYearsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={t("groupnamber")} name="soni" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label={t("currentSemester")} name="current_semester" rules={[{ required: true, type: 'number', min: 1 }]}>
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>

                    <Form.Item className="col-span-full">
                        <div className="flex justify-end gap-2">
                            <Button danger onClick={() => navigate('/study-process/groups')}> {t("backButton")}</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>{t("Addstaffs.saqlash")}</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditGroupPage;
