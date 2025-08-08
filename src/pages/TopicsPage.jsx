import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Empty, Spin } from 'antd';
import { fetchData } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const TopicsPage = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchTopics = async () => {
        try {
            const response = await fetchData(`teachers/topics/?page=1&limit=10000`);
            setTopics(response?.results || []);
        } catch (error) {
            console.error("Mavzularni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    return (
        <div className="w-full  bg-white border dark:bg-gray-800 p-6">
            <Card>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{t("topicss")}</h2>
                    <Button type="primary" onClick={() => navigate("/learning/topics/add")}>{t("staffsAdd.yangi_kiritsh")}</Button>
                </div>

                <Divider className="my-4" />

                {loading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <Spin size="large" />
                    </div>
                ) : topics.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <Empty description={t("Addstaffs.malumot_topilmadi")} />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {topics.map((topic, index) => (
                            <Card key={index} type="inner" title={`${index + 1}. ${topic.title || "Nomsiz mavzu"}`} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TopicsPage;
