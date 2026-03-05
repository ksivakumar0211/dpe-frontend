import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./index";

import {
  ENV,
  DEV_API_URL,
  PRD_API_URL,
  LOCAL_API_URL,
} from "../utils/config";

let BaseUrl: string = "";

if (ENV === "dev") {
  BaseUrl = DEV_API_URL;
} else if (ENV === "prd") {
  BaseUrl = PRD_API_URL;
} else {
  BaseUrl = LOCAL_API_URL;
}
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token;
      if (token) { headers.set("Authorization", `Bearer ${token}`); }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<any, { userName: string; password: string }>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),
    getMenu: builder.query<any, string>({
      query: (userId) => `/menubyuser/${userId}`,
    }),
  }),
});

export const { useLoginMutation, useGetMenuQuery } = apiSlice;

 