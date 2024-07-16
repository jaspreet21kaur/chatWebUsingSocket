import io from "socket.io-client";
import auth from "../configs/auth";
import { apiUrl } from "@/url";

const token =localStorage.getItem(auth.storageTokenKeyName)
   
const socket = io(apiUrl.localUrl, {
    query: {
        token:token,
    },
    transports: ["websocket"],
});

socket.on("connected", () => {
  console.log("connect to the web socket");
});
socket.on("disconnect", () => {
  console.log("disconnect from web socket");
});
export default socket;