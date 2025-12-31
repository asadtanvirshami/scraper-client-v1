import { TradeRaw } from "@/features/dashboard/types/trade-type";
import { StrategyData } from "@/features/strategy/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DialogData {
  [key: string]: unknown;
}

interface DialogState {
  dialogs: {
    [key: string]: {
      isOpen: boolean;
      formType: "trade" | "account" | "strategy" | "change-password" | null;
      mode: "add" | "edit" | "view";
      size: "sm" | "md" | "lg" | "xl";
      data: TradeRaw;
    };
  };
}

const initialState: DialogState = {
  dialogs: {},
};

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (
      state,
      action: PayloadAction<{
        key: string;
        formType: "trade" | "account" | "strategy" | "change-password" | null;
        mode?: "add" | "edit" | "view";
        size?: "sm" | "md" | "lg" | "xl";
        data?: any;
      }>
    ) => {
      // Close all dialogs first (only one open at a time)
      Object.keys(state.dialogs).forEach((key) => {
        state.dialogs[key].isOpen = false;
      });

      const { key, formType, mode, size, data } = action.payload;

      // Open or initialize the specified dialog
      state.dialogs[key] = {
        isOpen: true,
        formType: formType ?? null,
        mode: mode ?? "add",
        size: size ?? "md",
        data: data ?? null,
      };
    },
    closeDialog: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (state.dialogs[key]) {
        state.dialogs[key].isOpen = false;
      }
    },
    toggleDialog: (
      state,
      action: PayloadAction<
        string | { key: string; mode?: "add" | "edit" | "view"; data?: any }
      >
    ) => {
      const payload = action.payload;
      let key: string;
      let mode: "add" | "edit" | "view" = "add";
      let data: any = null;

      // 🧩 Support both simple string and object payloads
      if (typeof payload === "string") {
        key = payload;
      } else {
        key = payload.key;
        mode = payload.mode || "add";
        data = payload.data || null;
      }

      // 🟢 If dialog doesn't exist yet → create it
      if (!state.dialogs[key]) {
        state.dialogs[key] = {
          isOpen: true,
          formType: null,
          mode,
          size: "md",
          data,
        };
      } else {
        // 🔄 Toggle existing dialog
        state.dialogs[key].isOpen = !state.dialogs[key].isOpen;

        // When opening (not closing), update mode & data
        if (state.dialogs[key].isOpen) {
          state.dialogs[key].mode = mode;
          state.dialogs[key].data = data;
        }
      }
    },
    resetDialogs: (state) => {
      state.dialogs = {};
    },
  },
});

export const { openDialog, closeDialog, toggleDialog, resetDialogs } = dialogSlice.actions;
export default dialogSlice.reducer;
