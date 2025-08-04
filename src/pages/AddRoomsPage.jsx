import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postData, fetchData, putData } from '../api/api';
import { Form, Input, InputNumber, Select, Button, Card, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { TextArea } = Input;

const AddRoomsPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [buildingsLoading, setBuildingsLoading] = useState(true);
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { t } = useTranslation();


    const isEditing = !!roomId;


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

    const loadRoomDataForEdit = useCallback(async () => {
        if (!roomId) return;

        setLoading(true);
        try {
            const response = await fetchData(`rooms/${roomId}/`);
            if (response.success && response.result) {
                form.setFieldsValue({
                    room_name: response.result.name,
                    building: response.result.building?.id,
                    capacity: response.result.capacity,
                    floor_number: response.result.storey,
                    description: response.result?.description || ''
                });
            } else {
                message.error("Xona ma'lumotini yuklashda xatolik: " + (response.error || 'Nomaʼlum xato'));
                navigate('/tm-info/rooms');
            }
        } catch (err) {
            message.error("Xona ma'lumotini yuklashda tarmoq xatosi: " + (err.response?.data?.error || err.message));
            navigate('/tm-info/rooms');
        } finally {
            setLoading(false);
        }
    }, [roomId, form, navigate]);

    useEffect(() => {
        loadBuildingsList();
        if (isEditing) {
            loadRoomDataForEdit();
        } else {
            form.resetFields();
        }
    }, [loadBuildingsList, loadRoomDataForEdit, isEditing, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.room_name,
                building_id: values.building,
                capacity: values.capacity,
                storey: values.floor_number,
                description: values.description,
            };

            let response;
            if (isEditing) {
                response = await putData(`rooms/${roomId}/`, payload);
                if (response.success) {
                    message.success("Xona muvaffaqiyatli tahrirlandi!");
                    setTimeout(() => navigate('/tm-info/rooms'), 1500);
                } else {
                    message.error("Xonani tahrirlashda xatolik: " + (response.error || 'Nomaʼlum xato'));
                }
            } else {
                response = await postData('rooms/', payload);
                if (response.success) {
                    message.success("Xona muvaffaqiyatli qo‘shildi!");
                    form.resetFields();
                    setTimeout(() => navigate('/tm-info/rooms'), 1500);
                } else {
                    message.error("Xona qo‘shishda xatolik: " + (response.error || 'Nomaʼlum xato'));
                }
            }
        } catch (err) {
            message.error(`${isEditing ? 'Xonani tahrirlashda' : 'Xona qo‘shishda'} tarmoq xatolik yuz berdi: ` + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4  bg-gray-100 dark:bg-gray-900 flex-1">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                {isEditing ? t("editTitle") : t("addTitle")}
            </h1>
            <Card>
                {buildingsLoading || (loading && isEditing) ? (
                    <Spin tip={buildingsLoading ? t("loadingBuildings") : t("loadingRoomData")} />
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        disabled={loading && !buildingsLoading}
                    >
                        <Form.Item
                            label={t("buildingLabel")}
                            name="building"
                            rules={[{ required: true, message: t("buildingRequired") }]}
                        >
                            <Select placeholder={t("selectBuildingPlaceholder")}>
                                {buildings.map((bino) => (
                                    <Option key={bino.id} value={bino.id}>{bino.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>


                        <Form.Item
                            label={t("roomNameLabel")}
                            name="room_name"
                            rules={[{ required: true, message: t("roomNameRequired") }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label={t("capacityLabel")}
                            name="capacity"
                            rules={[{ required: true, message: t("capacityRequired") }]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>

                        <Form.Item
                            label={t("floorNumberLabel")}
                            name="floor_number"
                            rules={[{ required: true, message: t("floorNumberRequired") }]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>


                        <Form.Item
                            label={t("descriptionLabelR")}
                            name="description"
                        >
                            <TextArea rows={2} />
                        </Form.Item>

                        <Form.Item className="col-span-full">
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    {isEditing ? t("saveButton") : t("addButton")}
                                </Button>
                                <Button danger onClick={() => navigate('/tm-info/rooms')}>
                                    {t("backButton")}
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default AddRoomsPage;