"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";

/**
 * StoreProvider is a React component that wraps the app with
 * the Redux store and persistor. It provides the store and
 * persistor to the app, and handles the loading state
 * for the persistor.
 *
 * @param {React.ReactNode} children - The children of the component
 * @returns {React.ReactNode} - The wrapped app with the store and persistor
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
