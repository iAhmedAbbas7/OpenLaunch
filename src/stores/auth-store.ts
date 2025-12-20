// <== IMPORTS ==>
import { create } from "zustand";
import type { AuthUser, UserProfile } from "@/types/auth";

// <== AUTH STORE STATE TYPE ==>
interface AuthStoreState {
  // <== USER ==>
  user: AuthUser | null;
  // <== PROFILE ==>
  profile: UserProfile | null;
  // <== IS LOADING ==>
  isLoading: boolean;
  // <== IS INITIALIZED ==>
  isInitialized: boolean;
}

// <== AUTH STORE ACTIONS TYPE ==>
interface AuthStoreActions {
  // SET USER
  setUser: (user: AuthUser | null) => void;
  // SET PROFILE
  setProfile: (profile: UserProfile | null) => void;
  // SET LOADING
  setLoading: (isLoading: boolean) => void;
  // SET INITIALIZED
  setInitialized: (isInitialized: boolean) => void;
  // RESET STATE
  reset: () => void;
}

// <== AUTH STORE TYPE ==>
type AuthStore = AuthStoreState & AuthStoreActions;

// <== INITIAL STATE ==>
const initialState: AuthStoreState = {
  // <== USER ==>
  user: null,
  // <== PROFILE ==>
  profile: null,
  // <== IS LOADING ==>
  isLoading: true,
  // <== IS INITIALIZED ==>
  isInitialized: false,
};

// <== LOGGED OUT STATE ==>
const loggedOutState: AuthStoreState = {
  // <== USER ==>
  user: null,
  // <== PROFILE ==>
  profile: null,
  // <== IS LOADING ==>
  isLoading: false,
  // <== IS INITIALIZED ==>
  isInitialized: true,
};

// <== AUTH STORE ==>
export const useAuthStore = create<AuthStore>((set) => ({
  // INITIAL STATE
  ...initialState,
  // SET USER
  setUser: (user) => set({ user }),
  // SET PROFILE
  setProfile: (profile) => set({ profile }),
  // SET LOADING
  setLoading: (isLoading) => set({ isLoading }),
  // SET INITIALIZED
  setInitialized: (isInitialized) => set({ isInitialized }),
  // RESET STATE (USE LOGGED OUT STATE - NOT LOADING, IS INITIALIZED)
  reset: () => set(loggedOutState),
}));

// <== USE USER ==>
export const useUser = () => useAuthStore((state) => state.user);
// <== USE PROFILE ==>
export const useProfile = () => useAuthStore((state) => state.profile);
// <== USE IS AUTHENTICATED ==>
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
// <== USE IS LOADING ==>
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
