import axios, {
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import {
    ENV,
    DEV_API_URL,
    PRD_API_URL,
    LOCAL_API_URL,
} from "./config";

let BaseUrl: string = "";

if (ENV === "dev") {
    BaseUrl = DEV_API_URL;
} else if (ENV === "prd") {
    BaseUrl = PRD_API_URL;
} else {
    BaseUrl = LOCAL_API_URL;
}


console.log('BaseUrlBaseUrlBaseUrl',BaseUrl)
 

// const API_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
    baseURL: BaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
        if (auth?.token) {
            config.headers["Authorization"] = `Bearer ${auth?.token}`;
        }

        return config;
    },
    (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
    }
);

// Response Interceptor
instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError): Promise<never> => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = "/apps/login?session=expired";
            } else {
                console.error(
                    `Unexpected error code ${error.response.status}:`,
                    error.response.data
                );
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 