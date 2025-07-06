import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/api';
import { Form, Input, Button, message, Row, Col, Card } from 'antd';
import Loader from '../components/Loader';

const AddReportsTeachersPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFinish = async (values) => {
        setLoading(true);

        const dataToSend = {
            first_name: values.first_name,
            last_name: values.last_name,
            middle_name: values.middle_name,
            cell_phone: values.phone_number,
            pinfl: values.passport_serial_number,
            name: `${values.last_name} ${values.first_name} ${values.middle_name}`.trim()
        };

        try {
            const response = await postData('users/profile/', dataToSend);
            if (response.success) {
                message.success("O'qituvchi muvaffaqiyatli qo‘shildi!");
                setTimeout(() => {
                    navigate('/reports/teachers');
                }, 1500);
            } else {
                message.error("Xatolik: " + (response.error || "Noma’lum xato"));
            }
        } catch (err) {
            console.error("Xatolik:", err);
            message.error("Tarmoq xatoligi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 p-6">
            <Card
                title="Yangi O'qituvchi (Profil) Qo‘shish"
                className="w-full"
                bodyStyle={{ backgroundColor: 'inherit' }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleFinish}
                    className="w-full"
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Familiyasi"
                                name="last_name"
                                rules={[{ required: true, message: "Familiyani kiriting!" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Ismi"
                                name="first_name"
                                rules={[{ required: true, message: "Ismni kiriting!" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Otasining ismi"
                                name="middle_name"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Telefon raqami"
                                name="phone_number"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Pasport seriya va raqami (PINFL)"
                                name="passport_serial_number"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24} className="flex justify-end gap-2">
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Qo‘shish
                            </Button>
                            <Button onClick={() => navigate('/reports/teachers')} danger>
                                Orqaga
                            </Button>
                        </Col>
                    </Row>
                </Form>
                {loading && <Loader />}
            </Card>
        </div>
    );
};

export default AddReportsTeachersPage;
