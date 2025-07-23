import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Select, Card, Spin, message } from 'antd';
import { fetchData, putData } from '../api/api';
const { Option } = Select;

const EditBuildingsPage = () => {
    const [form] = Form.useForm();
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const navigate = useNavigate();
    const { buildingId } = useParams();
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [regionsData, buildingData] = await Promise.all([
                fetchData('regions/'),
                fetchData(`buildings/${buildingId}/`)
            ]);

            if (regionsData.success) setRegions(regionsData.results);

            if (buildingData.success) {
                const data = buildingData.result;

                form.setFieldsValue({
                    name: data.name,
                    description: data.description,
                    region: data.region?.id,
                    district: data.district?.name,
                    floor_count: data.storeys
                });

                if (data.region?.id) handleRegionChange(data.region.id);
            }
        } catch {
            message.error("Malumotlarni yuklashda xatolik");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleRegionChange = async (regionId) => {
        setDistricts([]);
        const response = await fetchData(`districts/?region_id=${regionId}`);
        if (response.success) {
            setDistricts(response.results);
        }
    };


    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description,
                region_id: values.region,
                district_id: values.district,
                storeys: values.floor_count,
                location: { lat: 0, lon: 0 }
            };

            const response = await putData(`buildings/${buildingId}/`, payload);
            if (response.success) {
                message.success('Bino muvaffaqiyatli yangilandi!');
                navigate('/tm-info/buildings');
            } else {
                message.error(response.error || 'Yangilashda xatolik yuz berdi');
            }
        } catch {
            message.error('Tarmoq xatolik');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Spin tip="Yuklanmoqda..." className="mt-10 mx-auto flex justify-center" />;

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4">Bino Korpusini Tahrirlash</h1>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={loading}
                >
                    <Form.Item
                        label="Bino nomi"
                        name="name"
                        rules={[{ required: true, message: 'Bino nomini kiriting' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Viloyat"
                        name="region"
                        rules={[{ required: true, message: 'Viloyatni tanlang' }]}
                    >
                        <Select onChange={handleRegionChange}>
                            {regions.map(region => (
                                <Option key={region.id} value={region.id}>{region.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Tuman"
                        name="district"
                        rules={[{ required: true, message: 'Tumanni tanlang' }]}
                    >
                        <Select>
                            {districts.map(d => (
                                <Option key={d.id} value={d.id}>{d.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Bino haqida ma'lumot"
                        name="description"
                        rules={[{ required: true, message: 'Ma’lumot kiriting' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        label="Bino nechta qavatdan iborat"
                        name="floor_count"
                        rules={[{ required: true, message: 'Qavat sonini kiriting' }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item className="flex justify-end space-x-2">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Yangilash
                        </Button>
                        <Button danger onClick={() => navigate('/tm-info/buildings')}>
                            Orqaga
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditBuildingsPage;
