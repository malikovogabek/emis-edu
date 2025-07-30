import React, { useEffect, useState } from "react";
import { Table, Select, Input, Button, Space, Card } from "antd";
import { fetchData } from "../api/api";
const { Option } = Select;

const GraduatesPage = () => {
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [directions, setDirections] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [search, setSearch] = useState({
        name: "",
        direction_id: "",
        curriculum_id: ""
    });


    useEffect(() => {
        getInitialData();
    }, []);

    const getInitialData = async () => {
        try {
            const [groupRes, dirRes, curRes] = await Promise.all([
                fetchData(`/edu-groups/?status=GRADUATED&page=1&limit=1000`),
                fetchData(`/edu-directions/?page=1&limit=10000`),
                fetchData(`/curriculums/?page=1&limit=10000`),
            ]);

            setGroups(groupRes?.results || []);
            setFilteredGroups(groupRes?.results || []);
            setDirections(dirRes?.results || []);
            setCurriculums(curRes?.results || []);
        } catch (error) {
            console.error("Ma'lumotlarni yuklashda xatolik:", error);
        }
    };
    const handleFilter = () => {
        let filtered = [...groups];

        if (search.name) {
            filtered = filtered.filter(group =>
                group.name?.toLowerCase().includes(search.name.toLowerCase())
            );
        }

        if (search.direction_id) {
            filtered = filtered.filter(group => group.direction?.id === search.direction_id);
        }

        if (search.curriculum_id) {
            filtered = filtered.filter(group => group.curriculum?.id === search.curriculum_id);
        }

        setFilteredGroups(filtered);
    };

    const handleReset = () => {
        setSearch({
            name: "",
            direction_id: "",
            curriculum_id: "",
        });
        setFilteredGroups(groups);
    };


    const columns = [
        {
            title: "Guruh nomi",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "O'quv rejasi",
            dataIndex: ["curriculum", "name"],
            key: "curriculum",
        },
        {
            title: "O'quv yo'nalishi",
            dataIndex: ["direction", "name"],
            key: "direction",
        },
        {
            title: "Kurs",
            dataIndex: "course",
            key: "course",
        },
        {
            title: "Semestr",
            dataIndex: "semester",
            key: "semester",
        },
        {
            title: "Ochilgan O‘quv Yili",
            dataIndex: ["year", "name"],
            key: "year",
        },
        {
            title: "Status",
            dataIndex: ["status", "name"],
            key: "status",
        },
    ];

    return (
        <div className="w-full p-4 bg-gray-50 min-h-screen">
            <Card title="Bitirgan guruhlar">
                <Space style={{ marginBottom: 16 }} wrap>
                    <Input
                        placeholder="Guruh nomi"
                        value={search.name}
                        onChange={(e) => setSearch({ ...search, name: e.target.value })}
                    />
                    <Select
                        placeholder="Yo'nalishni tanlang"
                        style={{ width: 200 }}
                        allowClear
                        value={search.direction_id}
                        onChange={(value) => setSearch({ ...search, direction_id: value })}
                    >
                        {directions.map((dir) => (
                            <Option key={dir.id} value={dir.id}>
                                {dir.name}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="O‘quv rejasi"
                        style={{ width: 200 }}
                        allowClear
                        value={search.curriculum_id}
                        onChange={(value) => setSearch({ ...search, curriculum_id: value })}
                    >
                        {curriculums.map((cur) => (
                            <Option key={cur.id} value={cur.id}>
                                {cur.name}
                            </Option>
                        ))}
                    </Select>
                    <Button type="primary" onClick={handleFilter}>
                        Qidirish
                    </Button>
                    <Button onClick={handleReset}>Tozalash</Button>
                </Space>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredGroups}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default GraduatesPage;
