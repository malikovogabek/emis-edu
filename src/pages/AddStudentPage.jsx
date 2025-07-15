import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, DatePicker, Card, message } from "antd";
import { fetchData, postData } from "../api/api";
import { Await, useNavigate } from "react-router-dom";

const { Option } = Select;

const StudentEditPage = () => {
    const [form] = Form.useForm();
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighbourhoods, setNeighbourhoods] = useState([]);
    const [citizenships, setCitizenships] = useState([]);
    const [schoolDistricts, setSchoolDistricts] = useState([]);
    const [schools, setSchools] = useState([]);
    const [socialStatuses, setSocialStatuses] = useState([]);
    const [eduGroups, setEduGroups] = useState([]);
    const [profile, setProfile] = useState(null);

    const [citizenId, setCitizenId] = useState(null);
    const [userInstitutionName, setUserInstitutionName] = useState("");



    const navigate = useNavigate();

    useEffect(() => {
        loadInitialData();
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const profileData = await fetchData("users/profile/");
        if (profileData?.result?.institution?.name?.uz) {
            setUserInstitutionName(profileData.result.institution.name.uz);
        }
    };

    const loadInitialData = async () => {
        const regionsData = await fetchData("regions/?country_id=1");
        if (regionsData.success) setRegions(regionsData.results);

        const citizenshipsData = await fetchData("students/citizenships/");
        if (citizenshipsData.success) setCitizenships(citizenshipsData.results);
        const socialStatusesData = await fetchData(`social-statuses/`);
        if (socialStatusesData.success) setSocialStatuses(socialStatusesData.results);
        const eduGroupsData = await fetchData("edu-groups/?page=1&limit=100");
        if (eduGroupsData.success) setEduGroups(eduGroupsData.results);
        const profileData = await fetchData("users/profile/");
        if (profileData.success) setProfile(profileData.result);

    };

    const onRegionChange = async (regionId) => {
        form.setFieldsValue({ permanent_district: undefined, permanent_mahalla: undefined });
        const districtData = await fetchData(`districts/?region_id=${regionId}`);
        if (districtData.success) setDistricts(districtData.results);
    };

    const onDistrictChange = async (districtId) => {
        form.setFieldsValue({ permanent_mahalla: undefined });
        const neighbourhoodData = await fetchData(`neighbourhoods/?district_id=${districtId}`);
        if (neighbourhoodData.success) setNeighbourhoods(neighbourhoodData.results);
    };

    const onSchoolRegionChange = async (regionId) => {
        form.setFieldsValue({ school_district: undefined, school: undefined });
        const districtData = await fetchData(`districts/?region_id=${regionId}`);
        if (districtData.success) setSchoolDistricts(districtData.results);
    };

    const onSchoolDistrictChange = async (districtId) => {
        const regionId = form.getFieldValue("school_region");
        if (!regionId) {
            message.warning("Iltimos, avval maktab viloyatini tanlang");
            return;
        }
        form.setFieldsValue({ school: undefined });
        const schoolsData = await fetchData(`schools/?region_id=${regionId}&district_id=${districtId}`);
        if (schoolsData.success) setSchools(schoolsData.results);
    };
    const handleCheckCitizen = async () => {
        const { jshshir: pinfl, birth_date, passport } = form.getFieldsValue();

        if (!pinfl || !birth_date || !passport) {
            message.warning("Iltimos barcha maydonlarni to‘ldiring");
            return;
        }

        const response = await postData("students/info/by-passport/", {
            pinfl,
            serial_number: passport,
            birth_date: birth_date.format("DD.MM.YYYY"),
        });

        if (response?.result) {
            const {
                first_name, last_name, middle_name, gender_id, citizenship_type,
                permanent_region_id, permanent_district_id, id
            } = response.result;
            setCitizenId(id);

            const gender = gender_id === 1 ? 'M' : gender_id === 2 ? 'F' : null;

            form.setFieldsValue({
                first_name,
                last_name,
                middle_name,
                gender,
                citizenship_type,
                permanent_region: permanent_region_id,

            });

            if (permanent_region_id) {
                const districtData = await fetchData(`districts/?region_id=${permanent_region_id}`);
                if (districtData.success) {
                    setDistricts(districtData.results);
                    form.setFieldsValue({ permanent_district: permanent_district_id });
                }
            }

            message.success("Foydalanuvchi ma'lumoti topildi");
        } else {
            message.error("Ma'lumot topilmadi");
            setCitizenId(null);
        }
    };



    const handleCheckByBirthCertificate = async () => {
        const { birth_cert_serial, birth_cert_number, birth_cert_birth_date } = form.getFieldsValue();

        if (!birth_cert_serial || !birth_cert_number || !birth_cert_birth_date) {
            message.warning("Iltimos, guvohnoma malumotlarini to‘liq kiriting");
            return;
        }

        try {
            const response = await postData("students/info/by-passport/", {
                birth_cert_serial,
                birth_cert_number,
                birth_date: birth_cert_birth_date.format("DD.MM.YYYY"),
            });

            if (response?.result) {
                const { first_name, last_name, middle_name, gender_id, citizenship_type } = response.result;
                setCitizenId(response.result.id);
                const gender = gender_id === 1 ? 'M' : gender_id === 2 ? 'F' : null;

                form.setFieldsValue({
                    first_name,
                    last_name,
                    middle_name,
                    gender,
                    citizenship_type
                });

                message.success("Foydalanuvchi ma'lumoti topildi");
            } else {
                message.error("Ma'lumot topilmadi");
            }
        } catch (err) {
            console.error("Xato:", err);
            message.error("Server bilan bog‘lanishda xatolik");
        }
    };

    const handleSaveStudent = async () => {
        try {
            const formData = form.getFieldsValue();
            const payload = {
                citizen: {
                    permanent_region_id: formData.permanent_region,
                    permanent_district_id: formData.permanent_district,
                    permanent_neighbourhood_id: formData.permanent_mahalla,
                    citizenship_type_id: formData.citizenship_type,
                },
                citizen_id: citizenId,
                region_id: formData.permanent_region,
                district_id: formData.permanent_district,
                school_id: formData.school,
                school_finished_year: Number(formData.school_finished_year),
                school_certificate_serial: formData.school_certificate_serial,
                school_certificate_number: formData.school_certificate_number,
                is_finished_local_school: true,
                social_status_id: formData.social_status_id,
                edu_group_id: formData.edu_group_id,
                status: formData.status,
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_name: formData.middle_name,
                gender_id: formData.gender === "M" ? 1 : 2,
                user_institution: userInstitutionName || ""
            };

            const response = await postData("students/", payload);

            if (response.error) {
                let errMsg = "Tizimda bu ma'lumotlar avval saqlangan.";

                alert(errMsg)
            }

            if (response?.success) {
                message.success("Talaba muvaffaqiyatli saqlandi");
                navigate("/study-process/students");
            } else {
                if (response?.code === 409 || response?.error?.code === "CONFLICT") {
                    message.error("Tizimda bu ma'lumotlar avval saqlangan.");
                } else if (response?.error?.messages) {
                    message.error(response.error.messages);
                } else {
                    message.error("Talabani saqlashda xatolik yuz berdi");
                }
            }

        } catch (err) {
            console.error("Validation yoki POST error:", err);
            message.error("Ma'lumotlarni to‘liq kiriting");
        }
    };




    return (
        <div className="h-screen w-full overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 space-y-6">
            <Card className="shadow-md">
                <p className="text-lg mb-4 text-gray-800 dark:text-white">Talaba shaxsiy ma‘lumotlarini tekshirish</p>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Form.Item
                        label="JSHSHIR"
                        name="jshshir"
                        rules={[{ required: true, message: "JSHSHIR kiritilishi shart" }]}
                    >
                        <Input placeholder="12345678901234" />
                    </Form.Item>

                    <Form.Item
                        label="Tug'ilgan sana (JSHSHIR bilan)"
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
                        <Button type="primary" className="mt-7 w-24" onClick={handleCheckCitizen}>Tekshirish</Button>
                    </Form.Item>

                    <Form.Item
                        label="Tug'ilganlik guvohnomasi seriyasi"
                        name="birth_cert_serial"
                    >
                        <Input placeholder="Guvohnoma seriyasi" />
                    </Form.Item>

                    <Form.Item
                        label="Tug'ilganlik guvohnomasi raqami"
                        name="birth_cert_number"
                    >
                        <Input placeholder="Guvohnoma raqami" />
                    </Form.Item>

                    <Form.Item
                        label="Tug'ilgan sana (guvohnoma bilan)"
                        name="birth_cert_birth_date"
                    >
                        <DatePicker format="DD.MM.YYYY" className="w-full" />
                    </Form.Item>

                    <Form.Item label="">
                        <Button type="primary" className="mt-7 w-24" onClick={handleCheckByBirthCertificate}>
                            Tekshirish
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <div className="flex justify-between items-center my-3 mx-3">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Talaba kiritish</h2>
                <div className="space-x-2">
                    <Button type="primary" onClick={handleSaveStudent}>Saqlash</Button>

                    <Button danger onClick={() => navigate("/study-process/students")}>Orqaga</Button>
                </div>
            </div>

            <Card title="Talaba shaxsiy ma'lumotlari">
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Ismi" name="first_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Familiyasi" name="last_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Sharifi" name="middle_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Jinsi" name="gender">
                        <Select disabled>
                            <Option value="M">Erkak</Option>
                            <Option value="F">Ayol</Option>
                        </Select>
                    </Form.Item>

                </Form>
            </Card>

            <Card title="Talabaning doimiy yashash ma'lumotlari">
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Viloyat" name="permanent_region">
                        <Select onChange={onRegionChange}>
                            {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Tuman" name="permanent_district">
                        <Select onChange={onDistrictChange}>
                            {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Mahalla" name="permanent_mahalla">
                        <Select>
                            {neighbourhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Fuqarolik turi" name="citizenship_type">
                        <Select>
                            {citizenships.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Talabaning oldingi talimi ma'lumotlari">
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item label="Maktab viloyati" name="school_region">
                        <Select onChange={onSchoolRegionChange}>
                            {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Maktab tumani" name="school_district">
                        <Select onChange={onSchoolDistrictChange}>
                            {schoolDistricts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Maktab" name="school">
                        <Select>
                            {schools.map(s => <Option key={s.id} value={s.id}>{s.name?.uz}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Bitirgan yil" name="school_finished_year">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Attestat seriyasi" name="school_certificate_serial">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Attestat raqami" name="school_certificate_number">
                        <Input />
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Talabaning hozirgi talimi ma'lumotlari">
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Hozirda ta'lim olayotgan litsey">
                        <Input value={profile?.institution?.name?.uz || ''} disabled />
                    </Form.Item>

                    <Form.Item label="Ta'lim guruhi" name="edu_group_id">
                        <Select>
                            {eduGroups.map(group => (
                                <Option key={group.id} value={group.id}>
                                    {group.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Holati" name="status">

                        <Select>
                            <Option value="ACTIVE">O'qimoqda</Option>
                            <Option value="INACTIVE">Bitirgan</Option>
                            <Option value="GRADUATED">Chetlashgan</Option>
                            <Option value="EXPELLED">Akademik ta'til</Option>
                        </Select>

                    </Form.Item>
                    <Form.Item label="Ijtimoiy holati" name="social_status_id">
                        <Select>
                            {socialStatuses.map(status => (
                                <Option key={status.id} value={status.id}>
                                    {status.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                </Form>

            </Card> <br /><br />
        </div>
    );
};

export default StudentEditPage;
