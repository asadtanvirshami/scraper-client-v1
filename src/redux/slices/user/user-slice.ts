import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string;
  plan: string;
  is_verified: boolean;
  blocked?: boolean;
}

interface AuthState {
  user: User | null;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Sets the user state to the provided user and sets isAuthenticated to true.
     * Resets the error state to null.
     * @param state The current state of the auth slice.
     * @param action The action containing the user to login with.
     */
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.error = null;
      state.isAuthenticated = true;
    },

    /**
     * Updates the current user state with the provided user.
     * Resets the error state to null.
     * Sets isAuthenticated to true.
     * @param {AuthState} state The current state of the auth slice.
     * @param {PayloadAction<User>} action The action containing the user to update with.
     */
    updateProfile(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.error = null;
      state.isAuthenticated = true;
    },
    /**
     * Upgrades the user's plan to the provided plan.
     * @param {AuthState} state The current state of the auth slice.
     * @param {PayloadAction<string>} action The action containing the plan to upgrade to.
     */
    upgradeUserPlan(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    /**
     * Sets the user state to null, sets the error state to the provided error message, and sets isAuthenticated to false.
     * @param {AuthState} state The current state of the auth slice.
     * @param {PayloadAction<string>} action The action containing the error message to set the error state to.
     */
    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    /**
     * Resets the user state to null, sets the error state to null, and sets isAuthenticated to false.
     */
    logoutUser(state) {
      state.user = null;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  loginSuccess,
  updateProfile,
  loginFailure,
  logoutUser,
  upgradeUserPlan,
} = userSlice.actions;

export default userSlice.reducer;
