import axios from "@/utils/axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequest<T> {
  url: string;
  method?: HttpMethod;
  data?: any;
  params?: any;
  reType?: any;
}

export const apiRequest = async <T = any>({
  url,
  method = "GET",
  data,
  params,
  headers = {},
  reType = false,
  signal,  
}: ApiRequest<T> & { headers?: any; reType?: boolean; signal?: AbortSignal }): Promise<T> => {

  const response = await axios({
    url,
    method,
    data,
    params,
    signal, 
    responseType: reType ? "blob" : "json", 
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  return response.data;
};