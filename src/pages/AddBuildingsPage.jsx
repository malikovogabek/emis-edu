import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Select, Card, Spin, message } from 'antd';
import { fetchData, postData } from '../api/api';
import { useTranslation } from 'react-i18next';


const { Option } = Select;

const AddBuildingsPage = () => {
    const [form] = Form.useForm();
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [regionsLoading, setRegionsLoading] = useState(false);
    const [districtsLoading, setDistrictsLoading] = useState(false);
    const { t } = useTranslation();

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
            <h1 className="text-2xl font-bold mb-4">{t("titleAddB")}</h1>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={loading}
                >
                    <Form.Item
                        label={t("buildingNameLabel")}
                        name="name"
                        rules={[{ required: true, message: (t("buildingNameRequired")) }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={t("regionLabel")}
                        name="region"
                        rules={[{ required: true, message: t("regionRequired") }]}
                    >
                        <Select
                            placeholder={t("selectRegionPlaceholder")}
                            loading={regionsLoading}
                            onChange={handleRegionChange}
                        >
                            {regions.map(region => (
                                <Option key={region.id} value={region.id}>{region.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("districtLabel")}
                        name="district"
                        rules={[{ required: true, message: t("districtRequired") }]}
                    >
                        <Select
                            placeholder={t("selectDistrictPlaceholder")}
                            loading={districtsLoading}
                        >
                            {districts.map(d => (
                                <Option key={d.id} value={d.id}>{d.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("descriptionLabel")}
                        name="description"
                        rules={[{ required: true, message: t("descriptionRequired") }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        label={t("floorCountLabel")}
                        name="floor_count"
                        rules={[{ required: true, message: t("floorCountRequired") }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item className="flex justify-end space-x-2">
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {t("saveButton")}
                        </Button>
                        <Button danger onClick={() => navigate('/tm-info/buildings')}>
                            {t("backButton")}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddBuildingsPage;
