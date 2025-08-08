import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentRole, setCurrentRole] = useState(localStorage.getItem('role') || 'OTMADMIN');
    const [otmAdminToken, setOtmAdminToken] = useState(localStorage.getItem('otmAdminToken') || null);
    const [teacherToken, setTeacherToken] = useState(localStorage.getItem('teacherToken') || null);

    const activeToken = currentRole === 'OTMADMIN' ? otmAdminToken : teacherToken;

    const login = (role, token) => {
        if (role === 'OTMADMIN') {
            setOtmAdminToken(token);
            localStorage.setItem('otmAdminToken', token);
        } else if (role === 'TEACHER') {
            setTeacherToken(token);
            localStorage.setItem('teacherToken', token);
        }
        setCurrentRole(role);
        localStorage.setItem('role', role);
    };

    const changeRole = async (newRole) => {
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://emis.e-edu.uz/api';

            const response = await axios.post(
                `${API_URL}/v1/users/change-role/`,
                { new_role: newRole.toUpperCase() },
                {
                    headers: {
                        Authorization: `Bearer ${activeToken}`,
                    },
                }
            );

            if (response.data && response.data.result && response.data.result.access_token) {
                const receivedToken = response.data.result.access_token;

                if (newRole === 'OTMADMIN') {
                    setOtmAdminToken(receivedToken);
                    localStorage.setItem('otmAdminToken', receivedToken);
                } else if (newRole === 'TEACHER') {
                    setTeacherToken(receivedToken);
                    localStorage.setItem('teacherToken', receivedToken);
                }

                setCurrentRole(newRole);
                localStorage.setItem('role', newRole);

                console.log(`Rol muvaffaqiyatli ${newRole} ga o'zgartirildi!`);
                return true;
            } else {
                console.error('API javobida token topilmadi yoki javob formati noto\'g\'ri:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Rolni almashtirishda xato yuz berdi:', error.response ? error.response.data : error.message);
            alert('Rolni almashtirib bo\'lmadi: ' + (error.response ? error.response.data.detail || error.response.data.message : error.message));
            return false;
        }
    };

    const logout = () => {
        setCurrentRole('OTMADMIN');
        setOtmAdminToken(null);
        setTeacherToken(null);
        localStorage.removeItem('role');
        localStorage.removeItem('otmAdminToken');
        localStorage.removeItem('teacherToken');
    };

    const value = {
        currentRole,
        otmAdminToken,
        teacherToken,
        activeToken,
        login,
        changeRole,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);