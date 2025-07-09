import React, { useState, useEffect } from "react";
import { Form, Select, Input, Button, message, Card } from "antd";
import { postData, fetchData } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddCurriculumPage = () => {
    const [form] = Form.useForm();
    const [curriculumOptions, setCurriculumOptions] = useState([]);
    const [startYearOptions, setStartYearOptions] = useState([]);
    const [directionsOptions, setDirectionsOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [curriculumRes, yearRes, directions] = await Promise.all([
                    fetchData('curriculums/'),
                    fetchData('edu-years/'),
                    fetchData(`edu-directions/`)
                ]);

                if (curriculumRes.success) setCurriculumOptions(curriculumRes.results);
                else message.error("O'quv rejalarini yuklashda xatolik");

                if (yearRes.success) setStartYearOptions(yearRes.results);
                else message.error("O'quv yillarini yuklashda xatolik");

                if (directions.success) setDirectionsOptions(directions.results);
                else message.error("talim yunalishini yuklashda xatolik");
            } catch (err) {
                message.error("Ma'lumotlarni yuklashda tarmoq xatolik: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, []);

    const handleAddCurriculum = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                edu_direction: { name: values.edu_direction },
                start_year: { name: values.start_year },
                curriculum_template: { number_of_semesters: parseInt(values.number_of_semesters) }
            };

            const response = await postData("curriculums/", payload);

            if (response.success) {
                message.success("O‘quv rejasi muvaffaqiyatli qo‘shildi!");
                form.resetFields();
                setTimeout(() => {
                    navigate("/study-process/plans");
                }, 1500);
            } else {
                let errorMessage = "Noma'lum xato";
                if (response.error) {
                    const err = response.error;
                    if (err.detail) errorMessage = err.detail;
                    else if (err.message) errorMessage = err.message;
                    else if (err.non_field_errors) errorMessage = err.non_field_errors.join(", ");
                    else errorMessage = JSON.stringify(err);
                }
                message.error("Xatolik: " + errorMessage);
            }
        } catch (err) {
            console.error("Tarmoq xatolik:", err);
            message.error("Tarmoq xatolik: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900  flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Yangi O‘quv Rejasi Qo‘shish</h1>

            <Card className="shadow-md">
                <Form className="grid grid-cols-1 md:grid-cols-2  gap-3"
                    form={form}
                    layout="vertical"
                    onFinish={handleAddCurriculum}
                >
                    <Form.Item
                        label="Vazirlik tomonidan berilgan namunaviy o'quv reja"
                        name="reja"
                        rules={[{ required: true, message: "Nomi majburiy" }]}
                    >
                        <Select placeholder="Tanlang">
                            {curriculumOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="O‘quv rejasi nomi"
                        name="name"
                        rules={[{ required: true, message: "Nomi majburiy" }]}
                    >
                        <Input placeholder="Masalan: 2024-2027 uchun axborot texnologiyalari" />
                    </Form.Item>

                    <Form.Item
                        label="Ta’lim shakli"
                        name="shakl"
                        rules={[{ required: true, message: "Nomi majburiy" }]}
                    >
                        <Select placeholder="Tanlang">
                            <Option value="shakl">Kunduzgi</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ta’lim yo‘nalishi (nomi)"
                        name="edu_direction"
                        rules={[{ required: true, message: "Yo‘nalish nomi kerak" }]}
                    >
                        <Select placeholder="Tanlang">
                            {directionsOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Birinchi o‘quv yili"
                        name="start_year"
                        rules={[{ required: true, message: "Boshlanish yili kerak" }]}
                    >
                        <Select placeholder="Tanlang">
                            {startYearOptions.map(option => (
                                <Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="kkinchi o‘quv yili"
                        name="start_year2"
                        rules={[{ required: true, message: "Boshlanish yili kerak" }]}
                    >
                        <Input placeholder="" />
                    </Form.Item>

                    <Form.Item
                        label="Talim tili"
                        name="uz"
                        rules={[{ required: true, message: "Tilni tanlang" }]}
                    >
                        <Select >
                            <Option value="uz">O'zbek tili</Option>
                            <Option value="ruz">Rus tili</Option>
                            <Option value="Qoraqolpoq">Qoraqolpoq tili</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Baholash turi"
                        name="ballik"
                        rules={[{ required: true, message: "Majburiy" }]}
                    >
                        <Select>
                            <option value="ballik">Ballik</option>
                            <option value="baholik">Baholik</option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="col-span-full">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="default"
                                danger
                                onClick={() => navigate("/study-process/plans")}
                            >
                                Orqaga
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Qo'shish
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddCurriculumPage;
