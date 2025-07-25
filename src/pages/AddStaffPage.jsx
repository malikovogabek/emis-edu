import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Card, DatePicker, Modal, InputNumber, Table, Alert } from "antd";
import { postData, fetchData } from "../api/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AddStaffPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [positionModalOpen, setPositionModalOpen] = useState(false);
    const [positions, setPositions] = useState([]);
    const [positionForm] = Form.useForm();
    const [citizenships, setCitizenships] = useState([]);


    const navigate = useNavigate();

    useEffect(() => {
        const loadCitizenships = async () => {
            const response = await fetchData("students/citizenships/");
            if (response.success) {
                setCitizenships(response.results);
            } else {
                console.error("Fuqaroliklar olinmadi:", response.error);
            }
        };

        loadCitizenships();
    }, []);


    const handleAddStaff = async (values) => {
        if (positions.length === 0) {
            message.warning("Iltimos, avval lavozim qo‘shing");
            setPositionModalOpen(true);
            return;
        }

        const payload = {
            ...values,
            staff_positions: positions,
        };

        setLoading(true);
        try {
            const response = await postData("staffs/", payload);

            if (response.error) {
                let errMsg = "Tizimda nimadir xato bo‘ldi. Iltimos, keyinroq urinib ko‘ring.";

                alert(errMsg)
                // message.error({
                //     content: errMsg,
                //     duration: 3000,
                // })
            }

            if (response.success) {
                message.success("Xodim muvaffaqiyatli qo'shildi!");
                form.resetFields();
                setPositions([]);
                setTimeout(() => {
                    navigate("/admin-process/staffs");
                }, 1500);
            } else {
                let errorMessage = response.error?.message || "Noma'lum xatolik";
                message.error("Xatolik: " + errorMessage);
            }
        } catch (err) {

            let errMsg = "Tizimda nimadir xato bo‘ldi. Iltimos, keyinroq urinib ko‘ring.";

            if (err.response?.data?.error?.messages) {
                errMsg = err.response.data.error.messages;
            }

            message.error({
                content: errMsg,
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPassport = async () => {
        const values = form.getFieldsValue();
        const { jshshir, birth_date, passport } = values;

        if (!jshshir || !birth_date || !passport) {
            message.warning("Iltimos, barcha maydonlarni to‘ldiring");
            return;
        }

        try {
            const response = await postData("students/info/by-passport/", {
                pinfl: jshshir,
                serial_number: passport,
                birth_date: birth_date.format("DD.MM.YYYY"),
            });

            if (response?.result) {
                const { first_name, last_name, middle_name, id } = response.result;
                form.setFieldsValue({
                    first_name,
                    last_name,
                    father_name: middle_name,
                    citizen_id: id,
                });
                message.success("Ma'lumotlar muvaffaqiyatli topildi");
            } else {
                message.error("Ma'lumot topilmadi");
            }
        } catch (error) {
            console.error("Xato:", error);
            message.error("Server bilan bog‘lanishda xatolik");
        }
    };




    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 space-y-6 overflow-y-auto">
            <div>
                <Card className="shadow-md">
                    <p className="text-lg  mb-4 text-gray-800 dark:text-white">O'qituvchi qidirish</p>
                    <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        <Form.Item
                            label="JSHSHIR"
                            name="jshshir"
                            rules={[{ required: true, message: "JSHSHIR kiritilishi shart" }]}
                        >
                            <Input placeholder="12345678901234" />
                        </Form.Item>

                        <Form.Item
                            label="Tug'ilgan sana"
                            name="birth_date"
                            rules={[{ required: true, message: "Sana kiritilishi shart" }]}
                        >
                            <DatePicker format="DD.MM.YYYY" className="w-full" />
                        </Form.Item>

                        <Form.Item
                            label="Pasport seriyasi va raqami"
                            name="passport"
                            rules={[{ required: true, message: "Pasport ma'lumotlari kiritilishi shart" }]}
                        >
                            <Input placeholder="AA1234567" />
                        </Form.Item>

                        <Form.Item label="">
                            <Button type="primary" className="mt-7 w-24 " onClick={handleCheckPassport}>Tekshirish</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <div>
                <Card className="shadow-md">
                    <p className="text-lg  mb-4 text-gray-800 dark:text-white">Xodimni qo'shish</p>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAddStaff}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <Form.Item name="citizen_id" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Ismi"
                            name="first_name"
                            rules={[{ required: true, message: "Ism majburiy" }]}
                        >
                            <Input readOnly disabled />
                        </Form.Item>

                        <Form.Item
                            label="Familiyasi"
                            name="last_name"
                            rules={[{ required: true, message: "Familiya majburiy" }]}
                        >
                            <Input readOnly disabled />
                        </Form.Item>

                        <Form.Item
                            label="Otasining ismi"
                            name="father_name"
                            rules={[{ required: true, message: "Otasining ismi majburiy" }]}
                        >
                            <Input readOnly disabled />
                        </Form.Item>

                        <Form.Item
                            label="Fuqaroligi"
                            name="citizenship"
                            rules={[{ required: true, message: "Fuqarolik tanlang" }]}
                        >
                            <Select placeholder="Tanlang">
                                {citizenships.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>


                        <Form.Item className="md:col-span-2 flex justify-end m-3 gap-2">
                            <Button type="primary" htmlType="submit" loading={loading}>Saqlash</Button>
                            <Button type="default" danger onClick={() => navigate("/admin-process/staffs")}>Orqaga</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>

            <div>
                <Card className="shadow-md">
                    <p className="text-lg  mb-4 text-gray-800 dark:text-white">O'qituvchi lavozimlari</p>
                    <div className="flex justify-end m-3 mb-2">
                        <Button type="primary" onClick={() => setPositionModalOpen(true)}>Lavozim qo'shish</Button>
                    </div>
                    <Table
                        columns={[
                            { title: "Lavozimi", dataIndex: "title" },
                            { title: "Mehnat shakli", dataIndex: "work_type" },
                            { title: "Stavka", dataIndex: "rate" }
                        ]}
                        dataSource={positions}
                        pagination={false}
                        locale={{
                            emptyText: (
                                <div className="text-center text-gray-400 py-10">
                                    <img
                                        src="https://arm.sammoi.uz/bootstrap/images/not-found.png"
                                        alt="Empty"
                                        className="mx-auto w-16 h-16 mb-2"
                                    />
                                    <p>Ma'lumot topilmadi</p>
                                </div>
                            )
                        }}
                        rowKey={(record, index) => index}
                    />
                </Card>
            </div>

            <Modal
                title="Lavozim qo‘shish"
                open={positionModalOpen}
                onCancel={() => setPositionModalOpen(false)}
                footer={null}
            >
                <Form
                    form={positionForm}
                    layout="vertical"
                    onFinish={(values) => {
                        setPositions((prev) => [...prev, values]);
                        setPositionModalOpen(false);
                        positionForm.resetFields();
                        message.success("Lavozim qo‘shildi");
                    }}
                >
                    <Form.Item
                        label="Lavozimi"
                        name="title"
                        rules={[{ required: true, message: "Lavozimni kiriting" }]}
                    >
                        <Select placeholder="Tanlash">
                            <Option value="direktor">Direktor</Option>
                            <Option value="o'rinbosar">O'quv ishlari buyicha o'rinbosar</Option>
                            <Option value="o'qituvchi">O'qituvchi</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Mehnat shakli"
                        name="work_type"
                        rules={[{ required: true, message: "Mehnat shaklini tanlang" }]}
                    >
                        <Select>
                            <Option value="To'liq stavka">Asosiy ish joyi</Option>
                            <Option value="qoshimcha">O'rindoshlik(ichki-qo'shimcha)</Option>
                            <Option value="asosiy">O'rindoshlik(ichki-asosiy)</Option>
                            <Option value="stavka">O'rindoshlik(tashqi)</Option>
                            <Option value="soatbay">Soatbay</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ishchi oylik stavkasi (0.05-1.5)"
                        name="rate"
                        rules={[{ required: true, message: "Stavkani kiriting" }]}
                    >
                        <InputNumber min={0.05} max={1.5} step={0.01} className="w-full" />
                    </Form.Item>

                    <Form.Item className="flex justify-end gap-2">
                        <Button onClick={() => setPositionModalOpen(false)}>Orqaga</Button>
                        <Button type="primary" htmlType="submit">Saqlash</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AddStaffPage;