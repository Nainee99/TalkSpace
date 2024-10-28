import { create } from "zustand";
import { createAuthSlice } from "./slice/authSlice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
}));
