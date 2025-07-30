import { Card, DatePicker, Table, Button, Empty, Checkbox } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Select, Input } from "antd";
import React from "react";


const { Option } = Select;

const SemesterSubjectsSection = ({
    semesterNumber,
    data,
    columns,
    onAddRow,
    onDateChange,
    dates,
    onInputChange,
    onDeleteRow,
    subjects,
}) => {

    const getModifiedColumns = (cols) => {
        return cols.map(col => {
            if (col.dataIndex === "edu_subject_id") {
                return {
                    ...col,
                    render: (value, record) => (
                        <Select
                            placeholder="Fan tanlang"
                            showSearch
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                            value={value}
                            onChange={(val) => onInputChange(semesterNumber, val, record.key, "edu_subject_id")}
                        >
                            {subjects.map((subject) => (
                                <Option key={subject.id} value={subject.id}>
                                    {`${subject.name.uz} (${subject.edu_subject_type?.name?.uz || 'N/A'})`}
                                </Option>
                            ))}
                        </Select>
                    ),
                };
            }
            if (col.dataIndex === "can_be_divided") {
                return {
                    ...col,
                    render: (value, record) => (
                        <Checkbox
                            checked={value}
                            onChange={(e) => onInputChange(semesterNumber, e.target.checked, record.key, "can_be_divided")}
                        />
                    ),
                };
            }
            if (col.dataIndex === "lecture_hours" || col.dataIndex === "independent_hours") {
                return {
                    ...col,
                    render: (value, record) => (
                        <Input
                            type="number"
                            min={0}
                            value={value}
                            onChange={(e) => onInputChange(semesterNumber, e.target.value, record.key, col.dataIndex)}
                        />
                    ),
                };
            }
            if (col.dataIndex === "study_hours") {
                return {
                    ...col,
                    render: (value, record) => (
                        <Input disabled value={parseFloat(record.lecture_hours || 0) + parseFloat(record.independent_hours || 0)} />
                    ),
                };
            }
            if (col.dataIndex === "actions") {
                return {
                    ...col,
                    render: (_, record) => (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDeleteRow(semesterNumber, record.key)}
                        />
                    ),
                };
            }
            return col;
        });
    };

    const modifiedColumns = getModifiedColumns(columns);

    return (
        <Card className="w-full mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {semesterNumber}-semestr
            </h2>

            <div className="flex flex-wrap gap-4 items-center mb-4">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                    * {semesterNumber} semestr oraliq sanasi:
                </label>
                <DatePicker
                    placeholder="Boshlanish sanasi"
                    value={dates?.start}
                    onChange={(date) => onDateChange(semesterNumber, "start", date)}
                    format="YYYY-MM-DD"
                />
                <span className="mx-2">→</span>
                <DatePicker
                    placeholder="Tugash sanasi"
                    value={dates?.end}
                    onChange={(date) => onDateChange(semesterNumber, "end", date)}
                    format="YYYY-MM-DD"
                />
            </div>

            {data && data.length > 0 ? (
                <Table
                    dataSource={data}
                    columns={modifiedColumns}
                    pagination={false}
                    rowKey="key"
                    bordered
                    scroll={{ x: "100%" }}
                    className="bg-white dark:bg-gray-800"
                />
            ) : (
                <div className="flex justify-center py-6">
                    <Empty description="Ma'lumot topilmadi" />
                </div>
            )}

            <div className="flex justify-center mt-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => onAddRow(semesterNumber)}
                    className="w-full md:w-full lg:w-full"
                >
                    Yana fan qo‘shish
                </Button>
            </div>
        </Card>
    );
};

export default SemesterSubjectsSection;