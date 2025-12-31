import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import userReducer from "./slices/user/user-slice";
import accountReducer from "./slices/trade-account/trade_account-slice";
import dialogReducer from "./slices/dialog/dialog-slice";
import notificationReducer from "./slices/notification/slice";
import sheetReducer from "./slices/sheet/slice";

// UNIQUE persist configs
const userPersistConfig = {
  key: "user",
  storage,
};

const tradeAccountPersistConfig = {
  key: "trade_account",
  storage,
};

// Persist ONLY these slices
const persistedUser = persistReducer(userPersistConfig, userReducer);
const persistedAccount = persistReducer(
  tradeAccountPersistConfig,
  accountReducer
);

// Root reducer
const rootReducer = combineReducers({
  user: persistedUser,
  trade_account: persistedAccount,
  sheet: sheetReducer,
  dialog: dialogReducer,
  notification: notificationReducer,
});

// Store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
      ignoredPaths: ["_persist"],
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
