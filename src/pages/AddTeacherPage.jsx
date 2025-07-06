import React, { useState } from "react";
import { Form, Input, Select, Button, message, Card } from "antd";
import { postData } from "../api/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AddTeacherPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAddTeacher = async (values) => {
        setLoading(true);
        try {
            const payload = {
                full_name: values.full_name,
                position: { name: values.position },
                status: { name: values.status },
            };

            const response = await postData("staffs/teachers/", payload);

            if (response.success) {
                message.success("O‘qituvchi muvaffaqiyatli qo‘shildi!");
                form.resetFields();
                setTimeout(() => {
                    navigate("/admin-process/teachers");
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
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Yangi O‘qituvchi Qo‘shish</h1>

            <Card className="shadow-md">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddTeacher}
                    initialValues={{ status: "ACTIVE" }}
                >
                    <Form.Item
                        label="F.I.O."
                        name="full_name"
                        rules={[{ required: true, message: "F.I.O. majburiy" }]}
                    >
                        <Input placeholder="O‘qituvchining to‘liq ismi" />
                    </Form.Item>

                    <Form.Item
                        label="Lavozimi"
                        name="position"
                        rules={[{ required: true, message: "Lavozimi majburiy" }]}
                    >
                        <Input placeholder="Masalan: Katta o‘qituvchi" />
                    </Form.Item>

                    <Form.Item
                        label="Holati"
                        name="status"
                        rules={[{ required: true, message: "Holat tanlang" }]}
                    >
                        <Select>
                            <Option value="ACTIVE">ACTIVE</Option>
                            <Option value="INACTIVE">INACTIVE</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="default"
                                danger
                                onClick={() => navigate("/admin-process/teachers")}
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

export default AddTeacherPage;
