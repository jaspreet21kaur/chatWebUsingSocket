"use client";
import React, { ChangeEvent, use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { jwtDecode } from "jwt-decode";
import auth from "@/app/configs/auth";
import {getAllUserAPi,LogoutApi,getUserByIdAPi,} from "@/app/services/apis/user";
import socket from "@/app/services/socket";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UserList from "../components/userlist/page";
import SelectedUserHeader from "../components/selectedUserHeader/page";
import TypingComponent from "../components/typingCompnent/page";
import ChatMessages from "../components/chatMessages/page";
import ChatSkeleton from "../components/chatSkeleton/page";

const ChatWeb = () => {
  const isFirstRender = useRef(true);
  const [value, onChangeText] = React.useState<string>("");
  const [message, setmessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const cookies = useCookies();
  const router = useRouter();
  const [userdata, setuserdata] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAndChatData | null>(null);
  const isNotification = true;
  const conwocationidRef = useRef(null);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<ChatMessage>>([]);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [typingResponse, setTypingResponse] = useState<TypingStatus[]>([]);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchUser, setSearchUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Array<onlineUsers>>([]);
  const [disconnectId, setDisconnectId] = useState("");
  const [lastMessages, setLastMessages] = useState<{ [key: string]: MessageInfo }>({});
  const [shownotifi, setShowNotifi] = useState(false);
  const [loading,setloading]=useState(true)

  const fetchData = async () => {
    try {
      const response = await getAllUserAPi();
      if (response?.status === 200) {
        setuserdata(response?.userData);
      }
    } catch (error) {
      toast.error("Network error")
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(auth.storageTokenKeyName)
        : null;
    const stringtoken = JSON.stringify(token);
    const decodeToken: any = jwtDecode(stringtoken);
    if (token) {
      setCurrentUserId(decodeToken?.id);
      fetchData();
    }
    socket.on("currentOnlineUsers", (response) => {
      console.log(response,"online users at first empty user effect----")
      setOnlineUsers(response);
    });
    socket.on("startTyping", () => {
      setTyping(true);
    });

    socket.on("stopTyping", () => {
      setTyping(false);
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
      socket.off("currentOnlineUsers")
    };
  }, []);

  const handleLogout = async () => {
    const repsonse = await LogoutApi(currentUserId);
    if (repsonse?.status === 200) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(auth.storageTokenKeyName);
      }
      cookies.remove(auth.storageTokenKeyName);
      router.replace("/login");
    }
  };

  const handleUserClick = async (id: string) => {
    try {
      setSearchUser("")
      setloading(true)
      const response = await getUserByIdAPi(id);
      if (response?.success) {
        setSelectedUser(response.userData);
         
        const find= response?.userData?.chatIds.filter((user:ChatIdObject)=>user?.conversation_id===lastMessages[id]?.conver && lastMessages[id].sender===true)
        if (
         find?.length>0
        ) {
          setShowNotifi(false);
        }
      } else {
        toast.error(response?.message)
      }
    } catch (error) {
      toast.error("User not found")
    }
  };
  
  const sendMessage = (e: ChangeEvent<HTMLInputElement>) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(auth.storageTokenKeyName)
        : null;
    e.preventDefault();

    socket?.emit("sendPrivateMessage", {
      sender_id: currentUserId,
      receiver_id: selectedUser?._id,
      message: message,
      token: token,
      conversation_id: conversationId,
    });

    const updatedUserdata = [...userdata];
    const index = updatedUserdata.findIndex(
      (user: {_id:string}) => user._id === selectedUser?._id
    );
    if (index !== -1) {
      const selectedUser = updatedUserdata.splice(index, 1)[0];
      updatedUserdata.unshift(selectedUser);
      setuserdata(updatedUserdata);
    }

    setmessage("");
    onChangeText("");
  };

  const joinChat = () => {
    const tokenReceived =
      typeof window !== "undefined"
        ? localStorage.getItem(auth.storageTokenKeyName)
        : null;
    if (tokenReceived && selectedUser) {
      socket?.emit("joinRoom", {
        isNotification,
        token: tokenReceived,
        targetUserId: selectedUser._id,
      });
    }
   
  };

  useEffect(() => {
    if (socket && selectedUser) {
      joinChat();
      socket.on("chatJoined", (response: chatJoined | any) => {
        if(currentUserId!==response?.target_user_id){
          setConversationId(response.conversation_id);
          conwocationidRef.current = response?.conversation_id;
        }  
      });

      socket.on("previousMsg", async (response: Conversation) => {
        setChatMessages(response?.messages?.slice()?.reverse() || []);
        setloading(false)
      });

      
      socket.on("typingStart", (response: {userId:string,conversation_id:string,typing:boolean} | any) => {
        if (response?.conversation_id != conwocationidRef.current) return;
        setTypingResponse(response);
      });

      socket.on("typingStop", (response: {userId:string,conversation_id:string,typing:boolean} | any) => {
        if (response?.conversation_id != conwocationidRef.current) return;
        setTypingResponse(response);
      });

      socket.on("messagesDeleted", (response) => {
        setChatMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== response?.messageIds[0])
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("chatJoined");
        socket.off("previousMsg");
        socket.off("typingStop")
        socket?.emit("leaveChat", {
          userId: currentUserId,
          chatId: conwocationidRef.current,
        });
      }
    };
  }, [selectedUser,currentUserId]);

 

  useEffect(() => {
    socket.on("userConnected", () => {
       socket.on("currentOnlineUsers", (response1) => {
        console.log(response1,"on connected with every user")
        setOnlineUsers(response1);
      });
    });

    return () => {
      socket.off("userConnected");
      socket.off('currentOnlineUsers')
    };
  }, [socket]);

  const handelTyping = (action: "start" | "stop") => {
    const userToken =
      typeof window !== "undefined"
        ? localStorage.getItem(auth.storageTokenKeyName)
        : null;
    const data = {
      token: userToken,
      conversation_id: conversationId,
    };
    if (action == "start") {
      socket.emit("startTyping", data);
    } else {
      socket.emit("stopTyping", data);
    }
  };

  const onChangeTextdebug = (text?: string) => {
    if (!typingTimeoutRef.current) {
      handelTyping("start");
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handelTyping("stop");
      typingTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      onChangeTextdebug();
    }
  }, [message]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setmessage(e.target.value);
  };

  useEffect(() => {
    socket.on("GetPrivateMessage", (response) => {
      if (response.conversation_id === conversationId) {
        setChatMessages((prevMessages) => [...prevMessages, response]);
      }
      const updatedUserdata = [...userdata];
      const senderId = response.sender_id;
      const index = updatedUserdata.findIndex((user:{_id:string}) => user._id === senderId);

      if (index !== -1) {
        const selectedUser = updatedUserdata.splice(index, 1)[0]; 
        updatedUserdata.unshift(selectedUser);
        setuserdata(updatedUserdata); 
      }
      if(response.conversation_id !==conversationId){
      setShowNotifi(true);
      }
      setLastMessages((prevLastMessages) => ({
        ...prevLastMessages,
        [response.sender_id]: {
          conver: response.conversation_id,
          message: response.message,
          timestamp: response.timestamp,
          message_state: response.message_state,
          sender: true,
        },
        [response.receiver_id]: {
          conver: response.conversation_id,
          message: response.message,
          timestamp: response.timestamp,
          message_state: response.message_state,
          sender: false,
        },
      }));
    });

    return () => {
      socket.off("GetPrivateMessage");
    };
  }, [userdata,conversationId]);

  useEffect(() => {
    socket.on("startTyping", () => {
      if (!typing) {
        setShowTyping(true);
      }
    });

    socket.on("stopTyping", () => {
      setShowTyping(false);
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
    };
  }, [typing]);

  const handleDeleteMesssage = (msgId: string) => {
    setShowOptions((prev) => (prev === msgId ? null : msgId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        showOptions &&
        !target.closest(`#dropdownMenuIconButton-${showOptions}`) &&
        !target.closest(`#dropdownDots-${showOptions}`)
      ) {
        setShowOptions(null);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const SocketDelete = (DeleteId: string) => {
    const deleteMsgData = {
      messageIds: [DeleteId],
      conversationId: conversationId,
      sender_id: currentUserId,
    };
    socket.emit("deleteMessages", deleteMsgData);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedUser]);

 const userListBySearch=()=>{
      if(searchUser.trim()!==""){
        const filterUserByList=userdata.filter((user:{fullName:string})=>user?.fullName.toLowerCase().includes(searchUser.toLowerCase()))
        setuserdata(filterUserByList)
      }else{
       fetchData()
      }
  
 }
 useEffect(()=>{
  userListBySearch()
 },[searchUser])


  return (
    <>
    <ToastContainer autoClose={4000}/>
    <div className="bg-red-700 shadow-lg rounded-lg h-full">
      <div className="px-5 py-5 flex justify-between max-w-full items-center bg-white border-b-2">
        <div className="font-semibold text-2xl">Chats</div>
        <div className=" text-black gap-2 font-semibold flex items-center justify-between">
          <p className="h-12 w-12 p-2 bg-yellow-500 rounded-full flex items-center justify-center">
            DP
          </p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="flex flex-row  justify-between bg-white heighCalc">
        {/* User List */}
        <div className="flex flex-col  w-2/5 border-r-2 overflow-y-auto">
          <div className="border-b-2 py-4 px-2">
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user"
              className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
            />
          </div>
           
          {/* User List */}
          <UserList userdata={userdata} selectedUser={selectedUser} shownotifi={shownotifi} handleUserClick={handleUserClick} lastMessages={lastMessages}/>
        </div>

        <div className="chat-background  w-full flex flex-col justify-between">
          {selectedUser ? (
            <>
              <div className="flex flex-col setHeightMessageBox">
                <SelectedUserHeader selectedUser={selectedUser} onlineUsers={onlineUsers} disconnectId={disconnectId} typingResponse={typingResponse}/>
                {loading ? <ChatSkeleton props={chatMessages}/> :
                <ChatMessages SocketDelete={SocketDelete} showOptions={showOptions} handleDeleteMesssage={handleDeleteMesssage} currentUserId={currentUserId} chatMessages={chatMessages}/>
                }
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}

          {selectedUser && (
            <TypingComponent message={message} handleTextChange={handleTextChange} sendMessage={sendMessage}/>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ChatWeb;
