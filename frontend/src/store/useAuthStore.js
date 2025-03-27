import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "developement"? "http://localhost:5001/api" : "/"

export const useAuthStore = create( (set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn :false,
    isUpdatingProfile: false,
    onlineUsers : [],
    isCheckingAuth: true,
    socket: null,

    checkAuth : async() =>{
        try {
            const res = await axiosInstance.get("/auth/get-current-user");
            set({authUser: res.data})
            get().connectSocket();
        } catch (error) {
            console.log("Error in checking auth in useAuthStore ",error)
            set({authUser: null})
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup : async(data) =>{
        set({ isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup",data);
            if(res.status == 201){
                set({authUser: res.data});
                toast.success("Account created Successfully");
                get().connectSocket();
            }

        } catch (error) {
            console.log("Error in signup || useAuthStore", error)
            toast.error(error.response.data.message);
        }finally{
            set({isSigningUp: false});
        }
    },

    login: async(data) =>{
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", data);
            if(res){
                set({authUser: res.data});
                toast.success("Logged in Successfully");

                get().connectSocket();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isLoggingIn: false})
        }
    },

    logout: async() =>{
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logout successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile : async(data) =>{
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isUpdatingProfile: false});
        }
    },

    connectSocket : () =>{
        const {authUser} = get()
        if(!authUser || get.socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId : authUser._id,
            }
        });
        socket.connect()
        set({socket: socket});

        //
        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers: userIds});
        })
    },

    disconnectSocket: () =>{
        
        if(get().socket?.connected) get().socket.disconnect();
    }

}) )