import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Table,
    Empty,
    Divider,
    Upload,
    message
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchData } from '../api/api';
import { AiOutlineRollback } from "react-icons/ai";
import { LiaSave } from "react-icons/lia";
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const AddTopicPage = () => {
    const [form] = Form.useForm();
    const [eduYears, setEduYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const { t } = useTranslation();
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [yearsData, subjectsData] = await Promise.all([
                    fetchData('edu-years/'),
                    fetchData('teachers/edu-subjects/')
                ]);
                setEduYears(yearsData?.results || []);
                setSubjects(subjectsData?.results || []);
            } catch (err) {
                message.error("Dastlabki ma'lumotlarni olishda xatolik");
                console.error(err);
            }
        };

        fetchInitialData();
    }, []);

    const addTopicRow = () => {
        setTopics(prev => [
            ...prev,
            {
                key: Date.now(),
                name: '',
                load: null,
                homework: null,
                video_link: '',
                description: ''
            }
        ]);
    };

    const removeTopicRow = (key) => {
        setTopics(prev => prev.filter(item => item.key !== key));
    };

    const handleChange = (key, field, value) => {
        setTopics(prev =>
            prev.map(item => item.key === key ? { ...item, [field]: value } : item)
        );
    };

    const columns = [
        {
            title: '№',
            dataIndex: 'index',
            render: (_, __, index) => index + 1,
            width: 50
        },
        {
            title: t("topicNameLabel"),
            dataIndex: 'name',
            render: (_, record) => (
                <Input
                    placeholder={t("topicNameLabel")}
                    value={record.name}
                    onChange={(e) => handleChange(record.key, 'name', e.target.value)}
                />
            )
        },
        {
            title: t("fileUploadLabel"),
            dataIndex: 'load',
            render: (_, record) => (
                <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    onChange={({ file }) => handleChange(record.key, 'load', file)}
                    showUploadList={{ showRemoveIcon: false }}
                >
                    <Button icon={<UploadOutlined />}>{t("uploadButton")}</Button>
                </Upload>
            )
        },
        {
            title: t("homeworkLabel"),
            dataIndex: 'homework',
            render: (_, record) => (
                <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    onChange={({ file }) => handleChange(record.key, 'homework', file)}
                    showUploadList={{ showRemoveIcon: false }}
                >
                    <Button icon={<UploadOutlined />}>{t("uploadButton")}</Button>
                </Upload>
            )
        },
        {
            title: t("videoLinkLabel"),
            dataIndex: 'video_link',
            render: (_, record) => (
                <Input
                    placeholder={t("videoLinkLabel")}
                    value={record.video_link}
                    onChange={(e) => handleChange(record.key, 'video_link', e.target.value)}
                />
            )
        },
        {
            title: t("commentLabel"),
            dataIndex: 'description',
            render: (_, record) => (
                <Input
                    placeholder={t("commentLabel")}
                    value={record.description}
                    onChange={(e) => handleChange(record.key, 'description', e.target.value)}
                />
            )
        },
        {
            title: '',
            dataIndex: 'action',
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeTopicRow(record.key)}
                />
            )
        }
    ];

    const handleSave = () => {
        const formValues = form.getFieldsValue();
        console.log('Umumiy forma:', formValues);
        console.log('Mavzular:', topics);

    };

    return (
        <div className="w-full p-6">
            <Card>
                <div className='flex justify-between items-center'>
                    <h2 className="text-xl font-semibold mb-4">{t("addTopicTitle")}</h2>
                    <div className="flex justify-end  gap-3">
                        <Button className=' text-red-500' onClick={() => window.history.back()} icon={<AiOutlineRollback />} >{t("backButton")}</Button>
                        <Button type="primary" onClick={handleSave} icon={<LiaSave />}> {t("saveButton")}</Button>
                    </div>
                </div>
                <Form form={form} layout="vertical">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item name="title" label={t("topicTitleLabel")} rules={[{ required: true, message: t("topicTitleRequired") }]}>
                            <Input placeholder={t("topicTitleLabel")} />
                        </Form.Item>

                        <Form.Item name="subject" label={t("subjectNameLabel")} rules={[{ required: true, message: t("selectSubjectPlaceholder") }]}>
                            <Select placeholder={t("selectLabel")} allowClear showSearch optionFilterProp="children">
                                {subjects.map((item) => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="edu_year" label={t("academicYearLabel")} rules={[{ required: true, message: t("selectAcademicYearPlaceholder") }]}>
                            <Select placeholder={t("selectLabel")} allowClear showSearch optionFilterProp="children">
                                {eduYears.map((item) => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="semester" label={t("semesterLabel")} rules={[{ required: true, message: t("selectSemesterPlaceholder") }]}>
                            <Select placeholder={t("selectLabel")}>
                                <Option value={1}>1</Option>
                                <Option value={2}>2</Option>
                                <Option value={3}>3</Option>
                                <Option value={4}>4</Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>

                <Divider />

                {topics.length === 0 ? (
                    <Empty description={t("noDataFound")} className="my-6" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={topics}
                        rowKey="key"
                        pagination={false}
                        bordered
                    />
                )}

                <Button
                    type="primary"
                    block
                    className="mt-4"
                    onClick={addTopicRow}
                >
                    {t("addTopicButton")}
                </Button>


            </Card>
        </div>
    );
};

export default AddTopicPage;
