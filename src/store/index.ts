import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { apiSlice } from "./apiSlice";
import authReducer from "./slice/authSlice";
import menuReducer from "./slice/menuSlice";
import breadcrumbReducer from "./slice/bredCrumbs";
import {
  ENV,
} from "../utils/config";
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  menu: menuReducer,
  breadcrumbs: breadcrumbReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "menu"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
  devTools: ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export const persistor = persistStore(store);
