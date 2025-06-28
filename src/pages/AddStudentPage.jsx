import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postData, fetchData, putData } from '../api/api';
import InputSelect from '../components/InputSelect';
import Loader from '../components/Loader';

const convertDdMmYyyyToYyyyMmDd = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('.');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

const convertYyyyMmDdToDdMmYyyy = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateString;
};

const StudentEditPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        gender: '',


        permanent_region: '',
        permanent_district: '',
        permanent_mahalla: '',
        address: '',
        citizenship_type: '',

        school_region: '',
        school_district: '',
        school: '',
        school_finished_year: '',
        school_certificate_serial: '',
        school_certificate_number: '',


        edu_group: '',
        admission_year: '',
        status: 'ACTIVE',
    });


    const [searchFormData, setSearchFormData] = useState({
        pinfl: '',
        birth_date_check: '',
        passport_serial: '',
        passport_number: '',
        birth_cert_serial: '',
        birth_cert_number: '',
        birth_date_cert_check: ''
    });

    const [loading, setLoading] = useState(false);
    const [checkError, setCheckError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const [citizenshipTypes, setCitizenshipTypes] = useState([]);
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighbourhoods, setNeighbourhoods] = useState([]);
    const [schools, setSchools] = useState([]);
    const [eduGroups, setEduGroups] = useState([]);

    const [isFetchingOptions, setIsFetchingOptions] = useState(true);
    const [optionsError, setOptionsError] = useState(null);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFormData(prev => ({ ...prev, [name]: value }));
    };


    const fetchDistricts = useCallback(async (regionId) => {
        if (!regionId) {
            setDistricts([]);
            setNeighbourhoods([]);
            return [];
        }
        try {
            const response = await fetchData(`districts/?region_id=${regionId}`);
            if (response.success && Array.isArray(response.results)) {
                return response.results;
            } else {
                console.error(`Tumanlarni yuklashda xato (regionId: ${regionId}):`, response.error || response);
                return [];
            }
        } catch (err) {
            console.error(`Tumanlarni yuklashda xatolik (regionId: ${regionId}):`, err);
            return [];
        }
    }, []);


    const fetchNeighborhood = useCallback(async (districtId) => {
        if (!districtId) {
            setNeighbourhoods([]);
            return [];
        }
        try {
            const response = await fetchData(`neighborhoods/?district_id=${districtId}`);
            if (response.success && Array.isArray(response.results)) {
                return response.results;
            } else {
                console.error(`Mahallalarni yuklashda xato (districtId: ${districtId}):`, response.error || response);
                return [];
            }
        } catch (err) {
            console.error(`Mahallalarni yuklashda xatolik (districtId: ${districtId}):`, err);
            return [];
        }
    }, []);

    useEffect(() => {
        const loadPageData = async () => {
            setIsFetchingOptions(true);
            setOptionsError(null);
            try {
                const [
                    citizenshipRes,
                    regionsRes,
                    schoolsRes,
                    eduGroupsRes
                ] = await Promise.all([
                    fetchData('citizenship-types/'),
                    fetchData('regions/'),
                    fetchData('schools/'),
                    fetchData('edu-groups/')
                ]);

                if (citizenshipRes.success && Array.isArray(citizenshipRes.results)) {
                    setCitizenshipTypes(citizenshipRes.results);
                } else {
                    console.error("Fuqarolik turlarini yuklashda xato:", citizenshipRes.error || citizenshipRes);
                }

                if (regionsRes.success && Array.isArray(regionsRes.results)) {
                    setRegions(regionsRes.results);
                } else {
                    console.error("Viloyatlarni yuklashda xato:", regionsRes.error || regionsRes);
                }

                if (schoolsRes.success && Array.isArray(schoolsRes.results)) {
                    setSchools(schoolsRes.results);
                } else {
                    console.error("Maktablarni yuklashda xato:", schoolsRes.error || schoolsRes);
                }

                if (eduGroupsRes.success && Array.isArray(eduGroupsRes.results)) {
                    setEduGroups(eduGroupsRes.results);
                } else {
                    console.error("Guruhlarni yuklashda xato:", eduGroupsRes.error || eduGroupsRes);
                }


                if (studentId && studentId !== 'add') {
                    setLoading(true);
                    const studentRes = await fetchData(`students/${studentId}/`);
                    if (studentRes.success && studentRes.result) {
                        const studentData = studentRes.result;
                        setFormData({
                            last_name: studentData.citizen?.last_name || '',
                            first_name: studentData.citizen?.first_name || '',
                            middle_name: studentData.citizen?.middle_name || '',
                            gender: studentData.citizen?.gender || '',

                            permanent_region: studentData.permanent_address?.region?.id || '',
                            permanent_district: studentData.permanent_address?.district?.id || '',
                            permanent_mahalla: studentData.permanent_address?.mahalla?.id || '',
                            address: studentData.permanent_address?.address || '',
                            citizenship_type: studentData.citizen?.citizenship_type?.id || '',

                            school_region: studentData.school_education?.region?.id || '',
                            school_district: studentData.school_education?.district?.id || '',
                            school: studentData.school_education?.school?.id || '',
                            school_finished_year: studentData.school_education?.finished_year || '',
                            school_certificate_serial: studentData.school_education?.certificate_serial || '',
                            school_certificate_number: studentData.school_education?.certificate_number || '',

                            edu_group: studentData.edu_group?.id || '',
                            admission_year: studentData.admission_year || '',
                            status: studentData.status || 'ACTIVE',
                        });


                        if (studentData.permanent_address?.region?.id) {
                            const loadedDistricts = await fetchDistricts(studentData.permanent_address.region.id);
                            setDistricts(loadedDistricts);
                            if (studentData.permanent_address.district?.id) {
                                const loadedNeighborhoods = await fetchNeighborhood(studentData.permanent_address.district.id);
                                setNeighbourhoods(loadedNeighborhoods);
                            }
                        }

                        if (studentData.school_education?.region?.id) {
                            const loadedSchoolDistricts = await fetchDistricts(studentData.school_education.region.id);
                            setDistricts(prev => [...new Set([...prev, ...loadedSchoolDistricts])]);
                        }

                    } else {
                        console.error("Talaba ma'lumotlarini yuklashda xato:", studentRes.error || studentRes);
                        setError("Talaba ma'lumotlarini yuklashda xatolik yuz berdi.");
                    }
                    setLoading(false);
                }

            } catch (err) {
                console.error("Umumiy ma'lumotlarni yuklashda xatolik:", err);
                setOptionsError("Sahifa ma'lumotlarini yuklashda xatolik yuz berdi. Konsolni tekshiring. " + err.message);
            } finally {
                setIsFetchingOptions(false);
            }
        };

        loadPageData();
    }, [studentId, fetchDistricts, fetchNeighborhood]);

    const handleCheckCitizen = async (type) => {
        setLoading(true);
        setCheckError(null);
        setSuccessMessage(null);

        try {
            let apiUrl = '';
            let params = {};

            if (type === "passport") {
                if (!searchFormData.pinfl && !(searchFormData.passport_serial && searchFormData.passport_number)) {
                    setCheckError("JSHSHIR yoki Pasport seriyasi va raqami to'ldirilishi shart.");
                    setLoading(false);
                    return;
                }
                apiUrl = 'check-citizen-by-passport/';
                params = {
                    pinfl: searchFormData.pinfl,
                    passport_serial: searchFormData.passport_serial,
                    passport_number: searchFormData.passport_number,
                    birth_date: convertDdMmYyyyToYyyyMmDd(searchFormData.birth_date_check)
                };
            } else if (type === "birth_certificate") {
                if (!searchFormData.birth_cert_serial || !searchFormData.birth_cert_number || !searchFormData.birth_date_cert_check) {
                    setCheckError("Tug'ilganlik guvohnomasi seriyasi, raqami va tug'ilgan sana to'ldirilishi shart.");
                    setLoading(false);
                    return;
                }
                apiUrl = 'check-citizen-by-birthcert/';
                params = {
                    birth_cert_serial: searchFormData.birth_cert_serial,
                    birth_cert_number: searchFormData.birth_cert_number,
                    birth_date: convertDdMmYyyyToYyyyMmDd(searchFormData.birth_date_cert_check)
                };
            } else {
                setCheckError("Noto'g'ri tekshirish turi tanlandi.");
                setLoading(false);
                return;
            }

            const response = await fetchData(apiUrl, params);
            if (response.success && response.result) {
                const citizenData = response.result.citizen || {};
                const permanentAddressData = response.result.permanent_address || {};
                const schoolData = response.result.school_education || {};
                const eduGroupData = response.result.edu_group || {};

                setFormData(prev => ({
                    ...prev,
                    last_name: citizenData.last_name || '',
                    first_name: citizenData.first_name || '',
                    middle_name: citizenData.middle_name || '',
                    gender: citizenData.gender || '',

                    permanent_region: permanentAddressData.region?.id || '',
                    permanent_district: permanentAddressData.district?.id || '',
                    permanent_mahalla: permanentAddressData.mahalla?.id || '',
                    address: permanentAddressData.address || '',
                    citizenship_type: citizenData.citizenship_type?.id || '',

                    school_region: schoolData.region?.id || '',
                    school_district: schoolData.district?.id || '',
                    school: schoolData.school?.id || '',
                    school_finished_year: schoolData.finished_year || '',
                    school_certificate_serial: schoolData.certificate_serial || '',
                    school_certificate_number: schoolData.certificate_number || '',

                    edu_group: eduGroupData.id || '',
                    admission_year: response.result.admission_year || '',
                    status: response.result.status || 'ACTIVE',
                }));


                setSearchFormData(prev => ({
                    ...prev,
                    pinfl: citizenData.pinfl || '',
                    passport_serial: citizenData.passport_serial || '',
                    passport_number: citizenData.passport_number || '',
                    birth_cert_serial: citizenData.birth_cert_serial || '',
                    birth_cert_number: citizenData.birth_cert_number || '',
                    birth_date_check: convertYyyyMmDdToDdMmYyyy(citizenData.birth_date || ''),
                    birth_date_cert_check: convertYyyyMmDdToDdMmYyyy(citizenData.birth_date || '')
                }));


                if (permanentAddressData.region?.id) {
                    const loadedDistricts = await fetchDistricts(permanentAddressData.region.id);
                    setDistricts(loadedDistricts);
                    if (permanentAddressData.district?.id) {
                        const loadedNeighborhoods = await fetchNeighborhood(permanentAddressData.district.id);
                        setNeighbourhoods(loadedNeighborhoods);
                    }
                }



                setSuccessMessage('Ma\'lumotlar muvaffaqiyatli topildi va to\'ldirildi.');
                setCheckError(null);
            } else {
                let errMessage = 'Ma\'lumot topilmadi.';
                if (response.error) {
                    errMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                }
                setCheckError(errMessage);
                setSuccessMessage(null);
            }
        } catch (err) {
            console.error("Tekshirishda xatolik:", err);
            setCheckError("Tekshirishda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setSuccessMessage(null);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);


        const payload = {
            citizen: {
                last_name: formData.last_name,
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                gender: formData.gender,
                citizenship_type: formData.citizenship_type

            },
            permanent_address: {
                region_id: formData.permanent_region,
                district_id: formData.permanent_district,
                mahalla_id: formData.permanent_mahalla,
                address: formData.address,
            },
            school_education: {
                region_id: formData.school_region,
                district_id: formData.school_district,
                school_id: formData.school,
                finished_year: formData.school_finished_year,
                certificate_serial: formData.school_certificate_serial,
                certificate_number: formData.school_certificate_number,
            },
            edu_group_id: formData.edu_group,
            admission_year: formData.admission_year,
            status: formData.status,
        };

        try {
            let response;
            if (studentId && studentId !== 'add') {
                response = await putData(`students/${studentId}/`, payload);
            } else {
                response = await postData('students/', payload);
            }


            if (response.success) {
                setSuccessMessage('Ma\'lumotlar muvaffaqiyatli saqlandi!');
                setError(null);
                setTimeout(() => {
                    navigate('/study-process/students');
                }, 1500);
            } else {
                let errorMessage = 'Noma’lum xato yuz berdi.';
                if (response.error) {
                    errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                    if (typeof response.error === 'object' && !Array.isArray(response.error)) {
                        errorMessage = Object.entries(response.error)
                            .map(([key, value]) => {
                                const fieldName = key.replace(/_/g, ' ');
                                return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${Array.isArray(value) ? value.join(', ') : value}`;
                            })
                            .join('; ');
                    }
                }
                setError('Saqlashda xatolik: ' + errorMessage);
                setSuccessMessage(null);
            }
        } catch (err) {
            console.error("Saqlashda xatolik:", err);
            setError("Saqlashda xatolik yuz berdi: " + (err.response?.data?.error || err.message));
            setSuccessMessage(null);
        } finally {
            setLoading(false);
        }
    };

    if (isFetchingOptions) {
        return (
            <div className="fixed inset-0 flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    if (optionsError) {
        return <p className="text-red-600 dark:text-red-400 p-4">Ma'lumotlarni yuklashda xato: {optionsError}. Iltimos, konsolni tekshiring.</p>;
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
                {successMessage && !error && !checkError && (
                    <p className="text-green-600 text-sm mb-4">{successMessage}</p>
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
                                Tug'ilgan sana (JSHSHIR bilan)
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

                    <div className="col-span-2"></div>
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
                    <div className="flex flex-col col-span-3">
                        <label
                            htmlFor="birth_date_cert_check"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tug'ilgan sana (Guvohnoma bilan)
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
                            onClick={() => navigate('/study-process/students')}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-200">
                            Ortga
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
                {successMessage && !checkError && (
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
                                htmlFor="gender"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jinsi
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Tanlash</option>
                                <option value="Male">Erkak</option>
                                <option value="Female">Ayol</option>
                            </select>
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
                                selected={formData.permanent_region}
                                onSelect={async val => {
                                    setFormData(prev => ({ ...prev, permanent_region: val.id, permanent_district: '', permanent_mahalla: '' }));
                                    const loadedDistricts = await fetchDistricts(val.id);
                                    setDistricts(loadedDistricts);
                                    setNeighbourhoods([]);
                                }}
                            />
                        </div>
                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={districts}
                                label="Tuman"
                                selected={formData.permanent_district}
                                onSelect={async val => {
                                    setFormData(prev => ({ ...prev, permanent_district: val.id, permanent_mahalla: '' }));
                                    const loadedNeighborhoods = await fetchNeighborhood(val.id);
                                    setNeighbourhoods(loadedNeighborhoods);
                                }}
                                disabled={!formData.permanent_region || districts.length === 0}
                            />
                        </div>
                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={neighbourhoods}
                                label="Mahalla"
                                selected={formData.permanent_mahalla}
                                onSelect={val => {
                                    setFormData(prev => ({ ...prev, permanent_mahalla: val.id }));
                                }}
                                disabled={!formData.permanent_district || neighbourhoods.length === 0}
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mahalla / Ko'cha / Uy raqami
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Misol: Guliston mahallasi, Yangi ko'cha, 15-uy"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="citizenship_type"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fuqarolik
                            </label>
                            <select
                                id="citizenship_type"
                                name="citizenship_type"
                                value={formData.citizenship_type || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Tanlash</option>
                                {citizenshipTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
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
                                label="Maktab joylashgan viloyat"
                                selected={formData.school_region}
                                onSelect={async val => {
                                    setFormData(prev => ({ ...prev, school_region: val.id, school_district: '', school: '' }));
                                    const loadedDistricts = await fetchDistricts(val.id);
                                    setDistricts(loadedDistricts);
                                }}
                            />
                        </div>
                        <div className="mb-2">
                            <InputSelect
                                classes="mb-2"
                                data={districts}
                                label="Maktab joylashgan tuman"
                                selected={formData.school_district}
                                onSelect={val => {
                                    setFormData(prev => ({ ...prev, school_district: val.id, school: '' }));
                                }}
                                disabled={!formData.school_region || districts.length === 0}
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="school"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bitirgan maktabi
                            </label>
                            <select
                                id="school"
                                name="school"
                                value={formData.school || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Tanlash</option>
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>{s.name?.uz || s.name || s.id}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="school_finished_year"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Maktabni bitirgan yil
                            </label>
                            <input
                                type="number"
                                id="school_finished_year"
                                name="school_finished_year"
                                value={formData.school_finished_year || ""}
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
                                htmlFor="edu_group"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Guruh nomi
                            </label>
                            <select
                                id="edu_group"
                                name="edu_group"
                                value={formData.edu_group || ""}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Tanlash</option>
                                {eduGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
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