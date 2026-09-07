import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_PATH || "",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

export default axiosInstance;
