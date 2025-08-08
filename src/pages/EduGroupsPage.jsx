import React, { useEffect, useState } from 'react';
import { Table, Card, Empty, Spin } from 'antd';
import { fetchData } from '../api/api';
import { useTranslation } from 'react-i18next';
const EduGroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const getGroups = async () => {
        try {
            const response = await fetchData('teachers/edu-groups/?page=1&limit=10000');
            setGroups(response?.results || []);
        } catch (error) {
            console.error("Guruhlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getGroups();
    }, []);

    const columns = [
        {
            title: 'Semestr',
            dataIndex: 'semester',
            key: 'semester',
            width: 100,
        },
        {
            title: 'Guruh nomi',
            dataIndex: 'group_name',
            key: 'group_name',
        },
        {
            title: 'Guruh raqami',
            dataIndex: 'group_code',
            key: 'group_code',
        },
        {
            title: 'O‘quv reja nomi',
            dataIndex: ['edu_plan', 'name'],
            key: 'edu_plan_name',
            render: (_, record) => record?.edu_plan?.name || '-',
        },
        {
            title: 'Fan nomi',
            dataIndex: ['subject', 'name'],
            key: 'subject_name',
            render: (_, record) => record?.subject?.name || '-',
        },
        {
            title: 'Kurs',
            dataIndex: 'course',
            key: 'course',
            width: 80,
        },
        {
            title: 'Talaba soni',
            dataIndex: 'student_count',
            key: 'student_count',
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => status ? "Faol" : "Faol emas",
        },
    ];

    return (
        <div className="w-full  bg-white border dark:bg-gray-800 p-6">
            <Card title={t("groupss")}>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spin />
                    </div>
                ) : groups.length === 0 ? (
                    <Empty description={t("Addstaffs.malumot_topilmadi")} />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={groups}
                        rowKey={(record) => record.id}
                        bordered
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default EduGroupsPage;
