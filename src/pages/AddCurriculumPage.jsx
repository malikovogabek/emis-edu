import React, { useState } from "react";
import { Form, Input, InputNumber, Button, message, Card } from "antd";
import { postData } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddCurriculumPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Yangi O‘quv Rejasi Qo‘shish</h1>

            <Card className="shadow-md">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddCurriculum}
                >
                    <Form.Item
                        label="O‘quv rejasi nomi"
                        name="name"
                        rules={[{ required: true, message: "Nomi majburiy" }]}
                    >
                        <Input placeholder="Masalan: 2024-2027 uchun axborot texnologiyalari" />
                    </Form.Item>

                    <Form.Item
                        label="Ta’lim yo‘nalishi (nomi)"
                        name="edu_direction"
                        rules={[{ required: true, message: "Yo‘nalish nomi kerak" }]}
                    >
                        <Input placeholder="Masalan: Dasturiy injiniring" />
                    </Form.Item>

                    <Form.Item
                        label="O‘quv yili (nomi)"
                        name="start_year"
                        rules={[{ required: true, message: "Boshlanish yili kerak" }]}
                    >
                        <Input placeholder="Masalan: 2024-2025" />
                    </Form.Item>

                    <Form.Item
                        label="Aktiv semestrlar soni"
                        name="number_of_semesters"
                        rules={[{ required: true, type: 'number', message: "Semestrlar soni majburiy" }]}
                    >
                        <InputNumber
                            min={1}
                            placeholder="Masalan: 6"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item>
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
                                Qo‘shish
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddCurriculumPage;
