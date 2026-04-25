import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import userReducer from "./slices/user/user-slice";
import dialogReducer from "./slices/dialog/dialog-slice";
import notificationReducer from "./slices/notification/slice";
import subscriptionReducer from "./slices/subscription/subscription-slice";

// UNIQUE persist configs
const userPersistConfig = {
  key: "user",
  storage,
};

// Persist subscription so credits are available instantly on reload
const subscriptionPersistConfig = {
  key: "subscription",
  storage,
};

// Persist ONLY these slices
const persistedUser = persistReducer(userPersistConfig, userReducer);
const persistedSubscription = persistReducer(subscriptionPersistConfig, subscriptionReducer);

// Root reducer
const rootReducer = combineReducers({
  user: persistedUser,
  dialog: dialogReducer,
  notification: notificationReducer,
  subscription: persistedSubscription,
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
