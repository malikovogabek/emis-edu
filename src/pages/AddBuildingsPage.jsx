import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../api/api';
import { Form, Input, InputNumber, Button, Card, message, Spin } from 'antd';

const AddBuildingsPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAddBuilding = async (values) => {
        setLoading(true);
        try {
            const response = await postData('buildings/', {
                name: values.name,
                floor_count: values.floor_count
            });

            if (response.success) {
                message.success('Bino korpusi muvaffaqiyatli qo‘shildi!');
                setTimeout(() => {
                    navigate('/tm-info/buildings');
                }, 1500);
            } else {
                message.error('Bino korpusi qo‘shishda xatolik: ' + (response.error || 'Noma’lum xato'));
            }
        } catch (err) {
            console.error("Bino korpusi qo‘shishda xatolik:", err);
            message.error("Bino korpusi qo‘shishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">Yangi Bino Korpusini Qo‘shish</h1>

            <Card className="dark:bg-gray-800">
                <Form
                    layout="vertical"
                    onFinish={handleAddBuilding}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <Form.Item
                        label="Bino nomi"
                        name="name"
                        rules={[{ required: true, message: 'Bino nomini kiriting!' }]}
                    >
                        <Input className="dark:bg-gray-700 dark:text-gray-100" />
                    </Form.Item>

                    <Form.Item
                        label="Qavatlar soni"
                        name="floor_count"
                        rules={[{ required: true, message: 'Qavatlar sonini kiriting!' }]}
                    >
                        <InputNumber min={1} className="w-full dark:bg-gray-700 dark:text-gray-100" />
                    </Form.Item>

                    <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Qo‘shish
                        </Button>
                        <Button
                            danger
                            onClick={() => navigate('/tm-info/buildings')}
                        >
                            Orqaga
                        </Button>
                    </div>
                </Form>

                {loading && <div className="mt-4 text-center"><Spin /></div>}
            </Card>
        </div>
    );
};

export default AddBuildingsPage;
