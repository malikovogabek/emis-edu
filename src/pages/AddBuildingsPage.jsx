import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Select, Card, Spin, message } from 'antd';
import { fetchData, postData } from '../api/api';

const { Option } = Select;

const AddBuildingsPage = () => {
    const [form] = Form.useForm();
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [regionsLoading, setRegionsLoading] = useState(false);
    const [districtsLoading, setDistrictsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const loadRegions = async () => {
            setRegionsLoading(true);
            try {
                const response = await fetchData('regions/');
                if (response.success) {
                    setRegions(response.results);
                }
            }
            finally {
                setRegionsLoading(false);
            }
        };

        loadRegions();
    }, []);

    const handleRegionChange = async (regionId) => {
        form.setFieldsValue({ district: null });
        setDistricts([]);
        setDistrictsLoading(true);
        try {
            const response = await fetchData(`districts/?region_id=${regionId}`);
            if (response.success) {
                setDistricts(response.results);
            }
        }
        finally {
            setDistrictsLoading(false);
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

            const response = await postData('buildings/', payload);
            if (response.success) {
                message.success('Bino muvaffaqiyatli qo‘shildi!');
                setTimeout(() => navigate('/tm-info/buildings'), 1500);
            } else {
                message.error(response.error || 'Xatolik yuz berdi');
            }
        } catch (err) {
            message.error('Tarmoq xatolik: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4">Yangi Bino Korpusini Qo‘shish</h1>

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
                        <Select
                            placeholder="Viloyat tanlang"
                            loading={regionsLoading}
                            onChange={handleRegionChange}
                        >
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
                        <Select
                            placeholder="Tuman tanlang"
                            loading={districtsLoading}
                        >
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

                    {/* <Form.Item
                        label="Lokatsiya (Yandex xarita)"
                        name="location"
                    >
                        <iframe
                            title="Yandex Map"
                            src="https://yandex.uz/maps/10335/tashkent/?ll=69.279737%2C41.311151&z=12"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </Form.Item> */}

                    <Form.Item className="flex justify-end space-x-2">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Saqlash
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

export default AddBuildingsPage;
