import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, DatePicker, Card, message } from "antd";
import { fetchData, putData } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';


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
    const { t } = useTranslation();


    const [citizenId, setCitizenId] = useState(null);
    const [userInstitutionName, setUserInstitutionName] = useState("");
    const { studentId } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        loadInitialData();
        loadStudentData();
    }, []);

    const loadInitialData = async () => {
        const [regionsData, citizenshipsData, socialStatusesData, eduGroupsData, profileData] = await Promise.all([
            fetchData("regions/?country_id=1"),
            fetchData("students/citizenships/"),
            fetchData("social-statuses/"),
            fetchData("edu-groups/?page=1&limit=100"),
            fetchData("users/profile/")
        ]);

        if (regionsData.success) setRegions(regionsData.results);
        if (citizenshipsData.success) setCitizenships(citizenshipsData.results);
        if (socialStatusesData.success) setSocialStatuses(socialStatusesData.results);
        if (eduGroupsData.success) setEduGroups(eduGroupsData.results);
        if (profileData.success) {
            setProfile(profileData.result);
            setUserInstitutionName(profileData.result.institution?.name?.uz || "");
        }
    };

    const loadStudentData = async () => {
        const response = await fetchData(`students/${studentId}/`);
        if (response?.success) {
            const student = response.result;
            setCitizenId(student.citizen_id);

            form.setFieldsValue({
                jshshir: student.citizen.pinfl,
                birth_date: student.citizen.birth_date ? dayjs(student.citizen.birth_date, "DD.MM.YYYY") : null,
                passport: student.citizen.serial_number,
                birth_cert_serial: student.citizen.birth_cert_serial,
                birth_cert_number: student.citizen.birth_cert_number,
                birth_cert_birth_date: student.citizen.birth_cert_birth_date ? dayjs(student.citizen.birth_cert_birth_date, "DD.MM.YYYY") : null,

                first_name: student.citizen.first_name,
                last_name: student.citizen.last_name,
                middle_name: student.citizen.middle_name,
                gender: student.citizen.gender_id === 1 ? 'M' : 'F',
                citizenship_type: student.citizen.citizenship_type_id,

                permanent_region: student.citizen.permanent_region_id,
                permanent_district: student.citizen.permanent_district_id,
                permanent_mahalla: student.citizen.permanent_neighbourhood_id,

                school_region: student.region_id,
                school_district: student.district_id,
                school: student.school_id,
                school_finished_year: student.school_finished_year?.toString(),
                school_certificate_serial: student.school_certificate_serial,
                school_certificate_number: student.school_certificate_number,

                edu_group_id: student.edu_group_id,
                status: student.status,
                social_status_id: student.social_status_id,
            });

            if (student.citizen.permanent_region_id) {
                await onRegionChange(student.citizen.permanent_region_id);
                await onDistrictChange(student.citizen.permanent_district_id);
            }

            if (student.region_id) {
                await onSchoolRegionChange(student.region_id);
            }
            if (student.district_id) {
                await onSchoolDistrictChange(student.district_id);
            }
        }
    };


    const onRegionChange = async (regionId) => {
        const districtData = await fetchData(`districts/?region_id=${regionId}`);
        if (districtData.success) setDistricts(districtData.results);
    };

    const onDistrictChange = async (districtId) => {
        const neighbourhoodData = await fetchData(`neighbourhoods/?district_id=${districtId}`);
        if (neighbourhoodData.success) setNeighbourhoods(neighbourhoodData.results);
    };

    const onSchoolRegionChange = async (regionId) => {
        const districtData = await fetchData(`districts/?region_id=${regionId}`);
        if (districtData.success) setSchoolDistricts(districtData.results);
    };

    const onSchoolDistrictChange = async (districtId) => {
        const regionId = form.getFieldValue("school_region");
        if (!regionId) {
            message.warning("Avval maktab viloyatini tanlang");
            return;
        }
        const schoolsData = await fetchData(`schools/?region_id=${regionId}&district_id=${districtId}`);
        if (schoolsData.success) setSchools(schoolsData.results);
    };

    const handleUpdateStudent = async () => {
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
                user_institution: userInstitutionName
            };

            const response = await putData(`students/${studentId}/`, payload);
            if (response?.success) {
                message.success("Talaba muvaffaqiyatli yangilandi");
                navigate("/study-process/students");
            } else {
                message.error("Yangilashda xatolik yuz berdi");
            }
        } catch (err) {
            console.error(err);
            message.error("Ma'lumotlarni to‘liq kiriting");
        }
    };
    const handleCheckCitizen = () => {
        message.info("Tekshirish funksiyasi hali qo'shilmagan");
    };

    const handleCheckByBirthCertificate = () => {
        message.info("Guvohnoma tekshirish hali qo'shilmagan");
    };



    return (
        <div className="h-screen w-full overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900 space-y-6">
            <Card className="shadow-md">
                <p className="text-lg mb-4 text-gray-800 dark:text-white">{t("title4")}</p>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Form.Item label={t("pinflLabel")} name="jshshir">
                        <Input placeholder="12345678901234" />
                    </Form.Item>

                    <Form.Item label={t("birthDateWithPinflLabel")} name="birth_date">
                        <DatePicker format="DD.MM.YYYY" className="w-full" />
                    </Form.Item>

                    <Form.Item label={t("passportLabel")} name="passport">
                        <Input placeholder="AA1234567" />
                    </Form.Item>

                    <Form.Item label="">
                        <Button type="primary" className="mt-7 w-24" onClick={handleCheckCitizen}>{t("checkButton")}</Button>
                    </Form.Item>

                    <Form.Item label={t("birthCertSerialLabel")} name="birth_cert_serial">
                        <Input placeholder={t("birthCertSerialPlaceholder")} />
                    </Form.Item>

                    <Form.Item label={t("birthCertNumberLabel")} name="birth_cert_number">
                        <Input placeholder={t("birthCertNumberPlaceholder")} />
                    </Form.Item>

                    <Form.Item label={t("birthDateWithCertLabel")} name="birth_cert_birth_date">
                        <DatePicker format="DD.MM.YYYY" className="w-full" />
                    </Form.Item>

                    <Form.Item label="">
                        <Button type="primary" className="mt-7 w-24" onClick={handleCheckByBirthCertificate}>{t("checkButton")}</Button>
                    </Form.Item>
                </Form>
            </Card>
            <div className="flex justify-end gap-3 mt-5">
                <Button type="primary" onClick={handleUpdateStudent}>{t("Addstaffs.saqlash")}</Button>
                <Button onClick={() => navigate("/study-process/students")}>{t("backButton")}</Button>
            </div>

            <Card title={t("title5")}>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label={t("firstNameLabel")} name="first_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label={t("lastNameLabel")} name="last_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label={t("middleNameLabel")} name="middle_name">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label={t("genderLabel")} name="gender">
                        <Select disabled>
                            <Option value="M">{t("maleOption")}</Option>
                            <Option value="F">{t("femaleOption")}</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Card>

            <Card title={t("title6")}>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label={t("regionLabel")} name="permanent_region">
                        <Select onChange={onRegionChange}>
                            {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("districtLabel")} name="permanent_district">
                        <Select onChange={onDistrictChange}>
                            {districts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("mahallaLabel")} name="permanent_mahalla">
                        <Select>
                            {neighbourhoods.map(n => <Option key={n.id} value={n.id}>{n.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("citizenshipTypeLabel")} name="citizenship_type">
                        <Select>
                            {citizenships.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Card>

            <Card title={t("title7")}>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item label={t("schoolRegionLabel")} name="school_region">
                        <Select onChange={onSchoolRegionChange}>
                            {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("schoolDistrictLabel")} name="school_district">
                        <Select onChange={onSchoolDistrictChange}>
                            {schoolDistricts.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("schoolLabel")} name="school">
                        <Select>
                            {schools.map(s => <Option key={s.id} value={s.id}>{s.name?.uz}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("graduationYearLabel")} name="school_finished_year">
                        <Input />
                    </Form.Item>
                    <Form.Item label={t("certificateSerialLabel")} name="school_certificate_serial">
                        <Input />
                    </Form.Item>
                    <Form.Item label={t("certificateNumberLabel")} name="school_certificate_number">
                        <Input />
                    </Form.Item>
                </Form>
            </Card>

            <Card title={t("title8")}>
                <Form layout="vertical" form={form} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label={t("currentLyceumLabel")}>
                        <Input value={profile?.institution?.name?.uz || ''} disabled />
                    </Form.Item>
                    <Form.Item label={t("educationGroupLabel")} name="edu_group_id">
                        <Select>
                            {eduGroups.map(group => (
                                <Option key={group.id} value={group.id}>{group.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("statusLabel")} name="status">
                        <Select>
                            <Option value="ACTIVE">{t("statusActive")}</Option>
                            <Option value="INACTIVE">{t("statusInactive")}</Option>
                            <Option value="GRADUATED">{t("statusGraduated")}</Option>
                            <Option value="EXPELLED">{t("statusExpelled")}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label={t("socialStatusLabel")} name="social_status_id">
                        <Select>
                            {socialStatuses.map(status => (
                                <Option key={status.id} value={status.id}>{status.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Card>
            <br /> <br />
        </div>
    );
};

export default StudentEditPage;
