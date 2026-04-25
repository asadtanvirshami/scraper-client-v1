// src/redux/slices/subscription/subscription-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Subscription, Plan } from "@/types/api/billing";

interface SubscriptionState {
  subscription: Subscription | null;
  plans: Plan[];
  isLoaded: boolean;
}

const initialState: SubscriptionState = {
  subscription: null,
  plans: [],
  isLoaded: false,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscription(state, action: PayloadAction<Subscription | null>) {
      state.subscription = action.payload;
      state.isLoaded = true;
    },
    setPlans(state, action: PayloadAction<Plan[]>) {
      state.plans = action.payload;
    },
    clearSubscription(state) {
      state.subscription = null;
      state.isLoaded = false;
    },
  },
});

export const { setSubscription, setPlans, clearSubscription } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
