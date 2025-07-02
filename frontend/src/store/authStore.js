import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLogingIn: false,
  isUpdatingProfile: false,
  isLogingOut: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await axiosInstance.get("/auth/checkAuth");
      if (!res) {
        set({ authUser: null });
        set({ isCheckingAuth: false });
        return;
      }
      set({ authUser: res.data });
      set({ isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.log(`Problem at checking auth ${error}`);
      set({ authUser: null });
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signUp", data);
      toast.success("Account Created Successfully");
      set({ authUser: res.data });
      set({ isSigningUp: false });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLogingIn: true });
    try {
      const res = await axiosInstance.post("/auth/logIn", data);
      toast.success("Logged In Successfully");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLogingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logOut");
      toast.success("Logged Out Successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isUpdatingProfile: true });
      const res = await axiosInstance.put("/auth/updateProfile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully");
      set({ isUpdatingProfile: false });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
