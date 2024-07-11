import io from "socket.io-client";
import auth from "../configs/auth";
const token =localStorage.getItem(auth.storageTokenKeyName)
   
const socket = io("http://192.168.1.165:8080", {
    query: {
        token:token,
    },
    transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("connect to the web socket");
});
socket.on("disconnect", () => {
  console.log("disconnect from web socket");
});
export default socket;