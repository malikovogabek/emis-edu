import React, { useEffect, useState } from 'react';
import { Card, Tabs, Spin, Button, Typography, Empty, Table, Tag, Calendar } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/uz-latn';
import { fetchData } from '../api/api';
import { useTranslation } from 'react-i18next';

dayjs.locale('uz-latn');
dayjs.extend(weekOfYear);

const { Title } = Typography;

const TeacherSchedulePage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [dailySchedule, setDailySchedule] = useState([]);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [loadingWeekly, setLoadingWeekly] = useState(false);
    const [activeTab, setActiveTab] = useState('daily');
    const [pairTimes, setPairTimes] = useState([]);
    const { t } = useTranslation();

    const fetchDailySchedule = async () => {
        setLoadingDaily(true);
        try {
            const response = await fetchData(`institutions/10778/class-hours/`);

            setDailySchedule(response?.results || []);
        } catch (error) {
            console.error("Kunlik dars jadvalini olishda xatolik:", error);
            setDailySchedule([]);
        } finally {
            setLoadingDaily(false);
        }
    };

    const fetchPairTimes = async () => {
        try {
            const response = await fetchData('teachers/pair-times/');
            setPairTimes(response?.results || []);
        } catch (error) {
            console.error("Dars vaqtlarini olishda xatolik:", error);
        }
    };

    const fetchWeeklySchedule = async (weekStart) => {
        setLoadingWeekly(true);
        try {
            const weekStartDate = weekStart.startOf('week').format('YYYY-MM-DD');
            const weekEndDate = weekStart.endOf('week').format('YYYY-MM-DD');

            const response = await fetchData(`teachers/class-schedule/?begin_date=${weekStartDate}&end_date=${weekEndDate}`);

            const processedSchedule = {};
            pairTimes.forEach(pair => {
                processedSchedule[pair.pair_number] = {
                    key: pair.pair_number,
                    time: `${pair.begin_time} - ${pair.end_time}`
                };
            });

            response?.results?.forEach(dayItem => {
                const dayOfWeek = dayjs(dayItem.date, "DD.MM.YYYY").day();
                if (dayItem.classes && Array.isArray(dayItem.classes)) {
                    dayItem.classes.forEach(classItem => {
                        const pairNumber = classItem.pair_number;
                        if (processedSchedule[pairNumber]) {
                            processedSchedule[pairNumber][dayOfWeek] = classItem;
                        }
                    });
                }
            });

            setWeeklySchedule(Object.values(processedSchedule));
        } catch (error) {
            console.error("Haftalik dars jadvalini olishda xatolik:", error);
            setWeeklySchedule([]);
        } finally {
            setLoadingWeekly(false);
        }
    };

    useEffect(() => {
        fetchPairTimes();
    }, []);

    useEffect(() => {
        if (activeTab === 'daily') {
            fetchDailySchedule(selectedDate);
        } else if (activeTab === 'weekly' && pairTimes.length > 0) {
            fetchWeeklySchedule(selectedDate);
        }
    }, [selectedDate, activeTab, pairTimes]);

    const onSelectDate = (date) => {
        setSelectedDate(date);
    };

    const goToPreviousWeek = () => setSelectedDate(selectedDate.subtract(1, 'week'));
    const goToNextWeek = () => setSelectedDate(selectedDate.add(1, 'week'));
    const goToCurrentWeek = () => setSelectedDate(dayjs());

    const weeklyColumns = [
        {
            title: '',
            dataIndex: 'time',
            key: 'time',
            width: 100,
        },
        ...['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Yak'].map((day, index) => {
            const dayIndex = index === 6 ? 0 : index + 1;
            const isToday = dayjs().isSame(selectedDate, 'week') && dayjs().day() === dayIndex;
            return {
                title: (
                    <div className={isToday ? "text-blue-600 font-bold" : ""}>
                        {day} <br /> {selectedDate.startOf('week').add(index, 'day').format('DD')}
                    </div>
                ),
                dataIndex: dayIndex,
                key: dayIndex,
                render: (classInfo) => {
                    if (!classInfo) {
                        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />;
                    }
                    return (
                        <div className="p-2 border rounded-md bg-blue-100">
                            <Title level={5} className="!mb-0">{classInfo.subject_name}</Title>
                            <p className="!mb-0 text-xs text-gray-500">{classInfo.group_name}</p>
                            <p className="!mb-0 text-xs text-gray-500">{classInfo.room_name}</p>
                            <Tag color="blue">{classInfo.type_name}</Tag>
                        </div>
                    );
                }
            };
        }),
    ];

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const items = [
        {
            key: 'daily',
            label: t("daily"),
            children: (
                <div className="flex flex-col dark:text-white md:flex-row gap-6 mt-4">
                    <div className="md:w-1/3">
                        <h3 className="text-lg dark:text-white font-semibold mb-4">
                            {t("dayjs")} {dayjs().format('DD.MM.YYYY')}
                        </h3>
                        <Calendar
                            fullscreen={false}
                            value={selectedDate}
                            onSelect={onSelectDate}
                        />
                    </div>
                    <div className="md:w-2/3 p-4 border rounded-md shadow-sm">
                        {loadingDaily ? (
                            <div className="flex justify-center py-10">
                                <Spin />
                            </div>
                        ) : dailySchedule.length === 0 ? (
                            <Empty description={t("description")} />
                        ) : (
                            <div>
                                {dailySchedule.map((dars) => (
                                    <div key={dars.id} className="mb-4 p-4 border rounded-md">
                                        <p><strong>Fan:</strong> {dars.subject_name}</p>
                                        <p><strong>Guruh:</strong> {dars.group_name}</p>
                                        <p><strong>Auditoriya:</strong> {dars.room_name}</p>
                                        <p><strong>Vaqt:</strong> {dars.start_time} - {dars.end_time}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },

        {
            key: 'weekly',
            label: t("weekly"),
            children: (
                <div>
                    <div className="flex dark:text-white justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Title level={4} className="!mb-0 dark:text-white">
                                {selectedDate.startOf('week').format('DD.MM.YYYY')} - {selectedDate.endOf('week').format('DD.MM.YYYY')}
                            </Title>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <Button icon={<LeftOutlined />} onClick={goToPreviousWeek} />
                            <Button onClick={goToCurrentWeek}>{t("currentweek")}</Button>
                            <Button icon={<RightOutlined />} onClick={goToNextWeek} />
                        </div>
                    </div>
                    {loadingWeekly ? (
                        <div className="flex justify-center py-10"><Spin /></div>
                    ) : (
                        <Table
                            columns={weeklyColumns}
                            dataSource={weeklySchedule}
                            pagination={false}
                            bordered
                            rowKey="key"
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="w-full  bg-white border dark:bg-gray-800 p-6">
            <Card title={t("classSchedulee")}>
                <Tabs defaultActiveKey="daily" items={items} onChange={handleTabChange} />
            </Card>
        </div>
    );
};

export default TeacherSchedulePage;