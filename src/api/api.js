import axios from "axios";

const API_BASE_URL = "https://emis.e-edu.uz/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Har bir so‘rovga localStorage'dagi token avtomatik qo‘shiladi
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 👈 Token shu yerda olinadi
    if (token) {
      config.headers.Authorization = `${token}`; // <<-- Faqat token qiymati
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ GET
export const fetchData = async (endpoint) => {
  try {
    const response = await api.get(`/${endpoint}`);
    return { success: true, ...response.data };
  } catch (error) {
    console.error(
      `Error fetching data from ${endpoint}:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// ✅ POST
export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(`/${endpoint}`, data);
    return { success: true, ...response.data };
  } catch (error) {
    console.error(
      `Error posting data to ${endpoint}:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// ✅ PUT
export const putData = async (endpoint, data) => {
  try {
    const response = await api.put(`/${endpoint}`, data);
    return { success: true, ...response.data };
  } catch (error) {
    console.error(
      `Error putting data to ${endpoint}:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// ✅ DELETE
export const deleteData = async (endpoint) => {
  try {
    const response = await api.delete(`/${endpoint}`);

    return {
      success: true,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      data: response.data || null,
    };
  } catch (error) {
    console.error(
      `Error deleting data from ${endpoint}:`,
      error.response?.data || error.message
    );
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data || error.message,
    };
  }
};
