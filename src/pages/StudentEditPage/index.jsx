import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchData, putData } from "../../api/api";
import Loader from "../../components/Loader";
import { fetchDistricts, fetchNeighborhood, fetchRegions } from "./StudentEditPage.api";
import { InputSelect } from "../../components/InputSelect";

const StudentEditPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [studentDetails, setStudentDetails] = useState(null);
    const [formData, setFormData] = useState({});
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([])
    const [neighbourhoods, setNeighbourhoods] = useState([])
    const [searchFormData, setSearchFormData] = useState({
        pinfl: "",
        birth_date_check: "",
        passport_serial: "",
        passport_number: "",
        birth_cert_serial: "",
        birth_cert_number: "",
        birth_date_cert_check: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [checkError, setCheckError] = useState(null);

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateString;
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const parts = dateString.split(".");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchData(`students/${studentId}/`);
                if (response && response.success && response.result) {
                    setStudentDetails(response.result);
                    const citizen = response.result.citizen;

                    setFormData({
                        last_name: citizen?.last_name || "",
                        first_name: citizen?.first_name || "",
                        middle_name: citizen?.middle_name || "",
                        citizenship_type_name: citizen?.citizenship_type?.name || "",

                        permanent_region_name:
                            citizen?.address_permanent?.region?.name || "",
                        permanent_district_name:
                            citizen?.address_permanent?.district?.name || "",
                        permanent_mahalla_name:
                            citizen?.address_permanent?.mahalla?.name || "",

                        school_name: response.result.school?.name?.uz || "",
                        school_region_name: response.result.school?.region?.name || "",
                        school_district_name: response.result.school?.district?.name || "",
                        graduation_year: response.result.school_finished_year || "",
                        school_certificate_serial:
                            response.result.school_certificate_serial || "",
                        school_certificate_number:
                            response.result.school_certificate_number || "",

                        edu_group_name: response.result.edu_group?.name || "",
                        admission_year: response.result.edu_group?.start_year_code || "",
                        status: response.result.status || "",
                    });

                    setSearchFormData({
                        pinfl: citizen?.pinfl || "",
                        birth_date_check: formatDateForDisplay(citizen?.birth_date) || "",
                        passport_serial: citizen?.serial_number?.substring(0, 2) || "",
                        passport_number: citizen?.serial_number?.substring(2) || "",
                        birth_cert_serial: citizen?.birth_cert_serial || "",
                        birth_cert_number: citizen?.birth_cert_number || "",
                        birth_date_cert_check:
                            formatDateForDisplay(citizen?.birth_date) || "",
                    });
                } else {
                    setError("Talaba ma'lumotlari topilmadi yoki xato yuz berdi.");
                }
            } catch (err) {
                console.error("Talaba ma'lumotlarini yuklashda xatolik:", err);
                setError(
                    "Ma'lumotlarni yuklashda xatolik yuz berdi: " +
                    (err.response?.data?.error || err.message)
                );
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudentDetails();
            fetchRegions().then((response) => {
                if (response) {
                    setRegions(response);
                }
            });
        }
    }, [studentId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFormData((prev) => ({ ...prev, [name]: value }));
        setCheckError(null);
    };

    const handleCheckCitizen = async (type) => {
        setCheckError(null);
        setLoading(true);
        try {
            let apiUrl = "";
            let payload = {};

            if (type === "pinfl") {
                if (!searchFormData.pinfl || !searchFormData.birth_date_check) {
                    setCheckError("JSHSHIR va Tug'ilgan sana to'ldirilishi shart.");
                    setLoading(false);
                    return;
                }
                apiUrl = "students/info-by-pinfl/";
                payload = {
                    pinfl: searchFormData.pinfl,
                    birth_date: formatDateForAPI(searchFormData.birth_date_check),
                };
            } else if (type === "passport") {
                if (
                    !searchFormData.passport_serial ||
                    !searchFormData.passport_number ||
                    !searchFormData.birth_date_check
                ) {
                    setCheckError(
                        "Pasport seriyasi, raqami va Tug'ilgan sana to'ldirilishi shart."
                    );
                    setLoading(false);
                    return;
                }
                apiUrl = "students/info-by-passport/";
                payload = {
                    serial_number:
                        searchFormData.passport_serial + searchFormData.passport_number,
                    birth_date: formatDateForAPI(searchFormData.birth_date_check),
                };
            } else if (type === "birth_certificate") {
                if (
                    !searchFormData.birth_cert_serial ||
                    !searchFormData.birth_cert_number ||
                    !searchFormData.birth_date_cert_check
                ) {
                    setCheckError(
                        "Tug'ilganlik guvohnomasi seriyasi, raqami va Tug'ilgan sana to'ldirilishi shart."
                    );
                    setLoading(false);
                    return;
                }
                apiUrl = "students/info-by-birth-certificate/";
                payload = {
                    serial: searchFormData.birth_cert_serial,
                    number: searchFormData.birth_cert_number,
                    birth_date: formatDateForAPI(searchFormData.birth_date_cert_check),
                };
            }

            const response = await fetchData(apiUrl, payload);

            if (response && response.success && response.result) {
                const citizenData = response.result;
                setFormData((prev) => ({
                    ...prev,
                    first_name: citizenData.first_name || "",
                    last_name: citizenData.last_name || "",
                    middle_name: citizenData.middle_name || "",
                    pinfl: citizenData.pinfl || "",
                    serial_number: citizenData.serial_number || "",
                    birth_date: formatDateForDisplay(citizenData.birth_date) || "",
                    birth_cert_serial: citizenData.birth_cert_serial || "",
                    birth_cert_number: citizenData.birth_cert_number || "",
                    citizenship_type_name: citizenData.citizenship_type?.name || "",
                    permanent_region_name:
                        citizenData.address_permanent?.region?.name || "",
                    permanent_district_name:
                        citizenData.address_permanent?.district?.name || "",
                    permanent_mahalla_name:
                        citizenData.address_permanent?.mahalla?.name || "",
                }));
                setSuccessMessage("Fuqaro ma'lumotlari muvaffaqiyatli yuklandi!");
            } else {
                setCheckError(
                    "Ma'lumot topilmadi yoki xato yuz berdi: " +
                    (response.error || "Noma’lum xato")
                );
            }
        } catch (err) {
            console.error("Fuqaro ma'lumotlarini tekshirishda xatolik:", err);
            setCheckError(
                "Tekshirishda xatolik yuz berdi: " +
                (err.response?.data?.error || err.message)
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const dataToUpdate = {
                ...studentDetails,
                citizen: {
                    ...studentDetails.citizen,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    middle_name: formData.middle_name,
                },
                edu_group: {
                    ...studentDetails.edu_group,
                    start_year_code: parseInt(formData.admission_year),
                },
                school_finished_year: parseInt(formData.graduation_year),
                school_certificate_serial: formData.school_certificate_serial,
                school_certificate_number: formData.school_certificate_number,
                status: formData.status,
            };

            if (dataToUpdate.institution) delete dataToUpdate.institution;
            if (dataToUpdate.region) delete dataToUpdate.region;
            if (dataToUpdate.district) delete dataToUpdate.district;
            if (dataToUpdate.school) delete dataToUpdate.school;
            if (dataToUpdate.citizen?.citizenship_type)
                delete dataToUpdate.citizen.citizenship_type;
            if (dataToUpdate.edu_group?.institution)
                delete dataToUpdate.edu_group.institution;
            if (dataToUpdate.edu_group?.curriculum)
                delete dataToUpdate.edu_group.curriculum;
            if (dataToUpdate.citizen?.address_permanent?.region)
                delete dataToUpdate.citizen.address_permanent.region;
            if (dataToUpdate.citizen?.address_permanent?.district)
                delete dataToUpdate.citizen.address_permanent.district;
            if (dataToUpdate.citizen?.address_permanent?.mahalla)
                delete dataToUpdate.citizen.address_permanent.mahalla;

            const response = await putData(`students/${studentId}/`, dataToUpdate);

            if (response.success) {
                setSuccessMessage("Talaba ma'lumotlari muvaffaqiyatli yangilandi!");
                setTimeout(() => navigate(`/students/${studentId}`), 1500);
            } else {
                setError(
                    "Ma'lumotlarni yangilashda xatolik: " +
                    (response.error ||
                        JSON.stringify(response.error_message) ||
                        "Noma’lum xato")
                );
            }
        } catch (err) {
            console.error("Ma'lumotlarni yangilashda xatolik:", err);
            setError(
                "Ma'lumotlarni yangilashda xatolik yuz berdi: " +
                (err.response?.data?.error || err.message)
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && !studentDetails) {
        return <div className="fixed inset-0 flex justify-center items-center"> <Loader /> </div>;
    }

    if (error && !studentDetails) {
        return <p className="text-red-600 dark:text-red-400 p-4">Xato: {error}</p>;
    }

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex-1 overflow-y-auto text-gray-900 dark:text-gray-100">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                    Talaba shaxsiy ma'lumotlarini tekshirish
                </h2>
                {checkError && (
                    <p className="text-red-600 text-sm mb-4">{checkError}</p>
                )}
                <div className="grid grid-cols-1  md:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col ">
                        <label
                            htmlFor="pinfl_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            JSHSHIR
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                id="pinfl_check"
                                name="pinfl"
                                value={searchFormData.pinfl}
                                onChange={handleSearchInputChange}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                maxLength="14"
                            />
                        </div>
                        <div className=" flex flex-col">
                            <label
                                htmlFor="birth_cert_serial_check"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tug'ilgan sana
                            </label>
                            <input
                                type="text"
                                id="birth_date_check"
                                name="birth_date_check"
                                value={searchFormData.birth_date_check}
                                onChange={handleSearchInputChange}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="DD.MM.YYYY"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label
                            htmlFor="passport_serial_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pasport seriyasi raqami
                        </label>
                        <div className="flex ">
                            <input
                                type="text"
                                id="passport_serial_check"
                                name="passport_serial"
                                value={searchFormData.passport_serial}
                                onChange={handleSearchInputChange}
                                className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                maxLength="2"
                            />
                            <input
                                type="text"
                                id="passport_number_check"
                                name="passport_number"
                                value={searchFormData.passport_number}
                                onChange={handleSearchInputChange}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                maxLength="7"
                            />
                            <button
                                type="button"
                                onClick={() => handleCheckCitizen("passport")}
                                className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600  transition duration-200 text-sm"
                                disabled={loading}>
                                Tekshirish
                            </button>
                        </div>
                    </div>
                    <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label
                            htmlFor="birth_cert_serial_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tug'ilganlik guvohnomasi seriyasi
                        </label>
                        <input
                            type="text"
                            id="birth_cert_serial_check"
                            name="birth_cert_serial"
                            value={searchFormData.birth_cert_serial}
                            onChange={handleSearchInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="birth_cert_number_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tug'ilganlik guvohnomasi raqami
                        </label>
                        <input
                            type="text"
                            id="birth_cert_number_check"
                            name="birth_cert_number"
                            value={searchFormData.birth_cert_number}
                            onChange={handleSearchInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="birth_date_cert_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tug'ilgan sana
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                id="birth_date_cert_check"
                                name="birth_date_cert_check"
                                value={searchFormData.birth_date_cert_check}
                                onChange={handleSearchInputChange}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="DD.MM.YYYY"
                            />
                            <button
                                type="button"
                                onClick={() => handleCheckCitizen("birth_certificate")}
                                className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition duration-200 text-sm"
                                disabled={loading}>
                                Tekshirish
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Talaba ma'lumotlarini kiritish/tahrirlash
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(`/study-process/students/${studentId}`)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-200">
                            Orqaga
                        </button>
                        <button
                            type="submit"
                            form="editStudentForm"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            disabled={loading}>
                            {loading ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </div>
                {successMessage && (
                    <p className="text-green-600 text-sm mb-4">{successMessage}</p>
                )}
                {error && <p className="text-red-600 text-sm mb-4">Xato: {error}</p>}

                <form id="editStudentForm" onSubmit={handleSubmit}>
                    <h3 className="text-lg font-semibold mb-3 mt-6 border-b pb-1 border-gray-200 dark:border-gray-700">
                        Talaba shaxsiy ma'lumotlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-2">
                            <label
                                htmlFor="last_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Familiyasi
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="first_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ismi
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="middle_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Otasining ismi
                            </label>
                            <input
                                type="text"
                                id="middle_name"
                                name="middle_name"
                                value={formData.middle_name || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                // htmlFor="citizenship_type_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jinsi
                            </label>
                            <input

                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3 mt-6 border-b pb-1 border-gray-200 dark:border-gray-700">
                        Talabaning doimiy yashash ma'lumotlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-2">

                            <InputSelect
                                classes="mb-2"
                                data={regions}
                                label="Viloyatlar"
                                onSelect={val => {
                                    fetchDistricts(val.id).then(setDistricts)
                                }} />
                            {/* <label
                                htmlFor="permanent_region_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Viloyat
                            </label>
                            <input
                                type="text"
                                id="permanent_region_name"
                                name="permanent_region_name"
                                value={formData.permanent_region_name || ""}
                                onChange={handleInputChange}
                                // readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            /> */}
                        </div>
                        <div className="mb-2">

                            <InputSelect
                                classes="mb-2"
                                data={districts}
                                label="Tuman"
                                onSelect={val => {
                                    fetchNeighborhood(val.id).then(setNeighbourhoods)
                                }}
                            />
                            {/* <label
                                htmlFor="permanent_district_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tuman
                            </label>
                            <input
                                type="text"
                                id="permanent_district_name"
                                name="permanent_district_name"
                                value={formData.permanent_district_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            /> */}
                        </div>
                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={neighbourhoods}
                                label="Mahalla"
                                onSelect={val => {
                                    console.log(val, "Mahalla");

                                }}
                            />

                            {/* <label
                                htmlFor="permanent_mahalla_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mahalla
                            </label>
                            <input
                                type="text"
                                id="permanent_mahalla_name"
                                name="permanent_mahalla_name"
                                value={formData.permanent_mahalla_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            /> */}
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="citizenship_type_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fuqarolik
                            </label>
                            <input
                                type="text"
                                id="citizenship_type_name"
                                name="citizenship_type_name"
                                value={formData.citizenship_type_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3 mt-6 border-b pb-1 border-gray-200 dark:border-gray-700">
                        Talabaning oldingi ta'limi ma'lumotlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={regions}
                                label="Viloyatlar"
                                onSelect={val => {
                                    fetchDistricts(val.id).then(setDistricts)
                                }} />
                            {/* <label
                                htmlFor="school_region_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktab joylashgan viloyat
                            </label>
                            <input
                                type="text"
                                id="school_region_name"
                                name="school_region_name"
                                value={formData.school_region_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            /> */}
                        </div>
                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={districts}
                                label="Tuman"
                                onSelect={val => {
                                    fetchNeighborhood(val.id).then(setNeighbourhoods)
                                }}
                            />
                            {/* <label
                                htmlFor="school_district_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktab joylashgan tuman
                            </label>
                            <input
                                type="text"
                                id="school_district_name"
                                name="school_district_name"
                                value={formData.school_district_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            /> */}
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="school_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bitirgan maktabi
                            </label>
                            <input
                                type="text"
                                id="school_name"
                                name="school_name"
                                value={formData.school_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="graduation_year"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktabni bitirgan yil
                            </label>
                            <input
                                type="number"
                                id="graduation_year"
                                name="graduation_year"
                                value={formData.graduation_year || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                min="1900"
                                max={new Date().getFullYear() + 5}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="school_certificate_serial"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktab attestati seriyasi
                            </label>
                            <input
                                type="text"
                                id="school_certificate_serial"
                                name="school_certificate_serial"
                                value={formData.school_certificate_serial || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="school_certificate_number"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktab attestati raqami
                            </label>
                            <input
                                type="text"
                                id="school_certificate_number"
                                name="school_certificate_number"
                                value={formData.school_certificate_number || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3 mt-6 border-b pb-1 border-gray-200 dark:border-gray-700">
                        Talabaning hozirgi ta'limi ma'lumotlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="mb-2">
                            <label
                                htmlFor="edu_group_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Guruh nomi
                            </label>
                            <input
                                type="text"
                                id="edu_group_name"
                                name="edu_group_name"
                                value={formData.edu_group_name || ""}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            />
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="admission_year"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                O'qishga kirgan yili
                            </label>
                            <input
                                type="number"
                                id="admission_year"
                                name="admission_year"
                                value={formData.admission_year || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                min="1900"
                                max={new Date().getFullYear() + 5}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Talaba holati
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required>
                                <option value="ACTIVE">O'qimoqda</option>
                                <option value="ON_LEAVE">Akademik ta'tilda</option>
                                <option value="WITHDRAWN">O'qishdan chetlatilgan</option>
                                <option value="FINISHED">Bitirgan</option>
                            </select>
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="edu_type_dummy"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ta'lim turi (Misol)
                            </label>
                            <input
                                type="text"
                                id="edu_type_dummy"
                                name="edu_type_dummy"
                                value={"Kunduzgi"}
                                readOnly
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed sm:text-sm"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentEditPage;
