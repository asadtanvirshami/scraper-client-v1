import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface AccountState {
  current: {
    accountId: string | null;
    type: string;
  } | null;
  account: {} | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AccountState = {
  current: null,
  account: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setSelectedAccount: (
      state,
      action: PayloadAction<{
        current: {
          accountId: string;
          type: string;
        };
        isLoading: boolean;
        account: {};
      }>
    ) => {
      state.current = action.payload.current;
      state.account = action.payload.account;
      state.isLoading = action.payload.isLoading;
      state.error = null;
      state.isAuthenticated = true;
    },
    setAccountState: (state, action: PayloadAction<Partial<AccountState>>) => {
      const { account, current, error, isLoading, isAuthenticated } =
        action.payload;
      if (current !== undefined) state.current = current;
      if (account !== undefined) state.account = account;
      if (error !== undefined) state.error = error;
      if (isLoading !== undefined) state.isLoading = isLoading;
      if (isAuthenticated !== undefined)
        state.isAuthenticated = isAuthenticated;
    },

    activeAccount(
      state,
      action: PayloadAction<{
        accountId: string;
        tradesyncId: string | null;
        type: string;
      }>
    ) {
      state.current = action.payload;
      state.error = null;
      state.isLoading = false;
      state.isAuthenticated = true;
    },
    logoutAccount(state) {
      state.current = null;
      state.account = null;
      state.error = null;
      state.isLoading = false;
      state.isAuthenticated = false;
    },
  },
});

export const {
  activeAccount,
  setSelectedAccount,
  setAccountState,
  logoutAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
