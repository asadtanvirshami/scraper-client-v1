import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SheetData {
  [key: string]: unknown;
}

interface SheetState {
  sheets: {
    [key: string]: {
      isOpen: boolean;
      formType: "trade" | "account" | "strategy" | null;
      mode: "add" | "edit";
      size: "sm" | "md" | "lg" | "xl";
      data: SheetData | null;
    };
  };
}

const initialState: SheetState = {
  sheets: {},
};

const sheetSlice = createSlice({
  name: "sheet",
  initialState,
  reducers: {
    openSheet: (
      state,
      action: PayloadAction<{
        key: string;
        formType: "trade" | "account" | "strategy" | null;
        mode?: "add" | "edit";
        size?: "sm" | "md" | "lg" | "xl";
        data?: SheetData;
      }>
    ) => {
      // Close all dialogs first (only one open at a time)
      Object.keys(state.sheets).forEach((key) => {
        state.sheets[key].isOpen = false;
      });

      const { key, formType, mode, size, data } = action.payload;

      // Open or initialize the specified dialog
      state.sheets[key] = {
        isOpen: true,
        formType: formType ?? null,
        mode: mode ?? "add",
        size: size ?? "md",
        data: data ?? null,
      };
    },
    closeSheet: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (state.sheets[key]) {
        state.sheets[key].isOpen = false;
      }
    },
    toggleSheet: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (!state.sheets[key]) {
        state.sheets[key] = {
          isOpen: true,
          formType: null,
          mode: "add",
          size: "md",
          data: null,
        };
      } else {
        state.sheets[key].isOpen = !state.sheets[key].isOpen;
      }
    },
    resetSheets: (state) => {
      state.sheets = {};
    },
  },
});

export const { openSheet, closeSheet, toggleSheet, resetSheets } = sheetSlice.actions;
export default sheetSlice.reducer;
