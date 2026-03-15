import axios from "@/utils/axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequest<T> {
  url: string;
  method?: HttpMethod;
  data?: any;
  params?: any;
}

// export const apiRequest = async <T = any>({
//   url,
//   method = "GET",
//   data,
//   params,
// }: ApiRequest<T>): Promise<T> => {
//   const response = await axios({url,method, data,params}); 
//   return response.data;
// };

export const apiRequest = async <T = any>({
  url,
  method = "GET",
  data,
  params,
  headers = {},
}: ApiRequest<T> & { headers?: any }): Promise<T> => {

  const response = await axios({
    url,
    method,
    data,
    params,
    headers: {
      "Content-Type": "application/json",
      ...headers, // jo bhi header bhejoge wo override ho jayega
    },
  });

  return response.data;
};