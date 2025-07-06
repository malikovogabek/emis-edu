import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData, fetchData } from '../api/api';
import { Form, Input, InputNumber, Select, Button, Card, message, Spin } from 'antd';

const { Option } = Select;

const AddRoomsPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [buildingsLoading, setBuildingsLoading] = useState(true);
    const navigate = useNavigate();

    const loadBuildingsList = useCallback(async () => {
        setBuildingsLoading(true);
        try {
            const response = await fetchData('buildings/');
            if (response.success && Array.isArray(response.results)) {
                setBuildings(response.results);
            } else {
                message.error("Binolar ro'yxatini yuklashda xatolik.");
            }
        } catch (err) {
            message.error("Binolar ro'yxatini yuklashda tarmoq xatosi: " + (err.response?.data?.error || err.message));
        } finally {
            setBuildingsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBuildingsList();
    }, [loadBuildingsList]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                room_name: values.room_name,
                building: values.building,
                capacity: values.capacity,
                floor_number: values.floor_number
            };

            const response = await postData('rooms/', payload);
            if (response.success) {
                message.success("Xona muvaffaqiyatli qo‘shildi!");
                form.resetFields();
                setTimeout(() => navigate('/tm-info/rooms'), 1500);
            } else {
                message.error("Xona qo‘shishda xatolik: " + (response.error || 'Nomaʼlum xato'));
            }
        } catch (err) {
            message.error("Xona qo‘shishda tarmoq xatolik yuz berdi: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4  bg-gray-100 dark:bg-gray-900 flex-1">

            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Yangi Xona Qo‘shish
            </h1>
            <Card>
                {buildingsLoading ? (
                    <Spin tip="Binolar yuklanmoqda..." />
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        disabled={loading}
                    >
                        <Form.Item
                            label="Xona nomi"
                            name="room_name"
                            rules={[{ required: true, message: 'Iltimos, xona nomini kiriting' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Bino"
                            name="building"
                            rules={[{ required: true, message: 'Iltimos, bino tanlang' }]}
                        >
                            <Select placeholder="Bino tanlang">
                                {buildings.map((bino) => (
                                    <Option key={bino.id} value={bino.id}>{bino.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Xona sigʻimi"
                            name="capacity"
                            rules={[{ required: true, message: 'Iltimos, xona sigʻimini kiriting' }]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>

                        <Form.Item
                            label="Qavat raqami"
                            name="floor_number"
                            rules={[{ required: true, message: 'Iltimos, qavat raqamini kiriting' }]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>

                        <Form.Item className="flex justify-end space-x-2">
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Qo‘shish
                            </Button>
                            <Button danger onClick={() => navigate('/tm-info/rooms')}>
                                Orqaga
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>

    );
};

export default AddRoomsPage;
