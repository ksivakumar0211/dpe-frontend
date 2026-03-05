import axios from "@/utils/axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequest<T> {
  url: string;
  method?: HttpMethod;
  data?: any;
  params?: any;
}

export const apiRequest = async <T = any>({
  url,
  method = "GET",
  data,
  params,
}: ApiRequest<T>): Promise<T> => {
  const response = await axios({url,method, data,params}); 
  return response.data;
};
