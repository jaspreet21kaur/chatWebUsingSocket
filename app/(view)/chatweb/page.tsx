"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import moment from "moment-timezone";
import { BsThreeDotsVertical } from "react-icons/bs";
import auth from "@/app/configs/auth";
import {
  getAllUserAPi,
  LogoutApi,
  getUserByIdAPi,
} from "@/app/services/apis/user";
import socket from "@/app/services/socket";
import blankprofile from "../../../public/Images/blankProfile.webp";
import { BiCheckDouble } from "react-icons/bi";
import { BiCheck } from "react-icons/bi";
import { TbCircleNumber1Filled } from "react-icons/tb";

const ChatWeb = () => {
  const isFirstRender = useRef(true);
  const [value, onChangeText] = React.useState<string>("");
  const [message, setmessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const cookies = useCookies();
  const router = useRouter();
  const [userdata, setuserdata] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [online, setOnline] = useState<any>("");
  const isNotification = true;
  const conwocationidRef = useRef(null);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<any>>([]);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [typingResponse, setTypingResponse] = useState<any>([]);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchUser, setSearchUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Array<any>>([]);
  const [disconnectId, setDisconnectId] = useState("");
  const [lastMessages, setLastMessages] = useState<{ [key: string]: any }>({});
  const [shownotifi, setShowNotifi] = useState(false);

  function convertTimestampToNormalTime(msgTime: any) {
    const formatDateAndTime = moment(msgTime).format("DD-MM-YYYY h:mm A");
    const dateTimeFormat = formatDateAndTime.split(" ");
    const time = dateTimeFormat[1];
    const dayTime = dateTimeFormat[2];
    const normalTime = `${time} ${dayTime}`;

    return normalTime;
  }

  const fetchData = async () => {
    try {
      const response = await getAllUserAPi();
      if (response?.status === 200) {
        setuserdata(response?.userData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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

  const handleUserClick = async (id: any) => {
    try {
      const response = await getUserByIdAPi(id);
      if (response?.success) {
        setSelectedUser(response.userData);

        //  console.log(response?.userData?.chatIds[0].conversation_id,lastMessages[id]?.conver)

        setConversationId(response?.userData?.chatIds[0]?.conversation_id);
        if (
          response?.userData?.chatIds[0]?.conversation_id ===
          lastMessages[id]?.conver
        ) {
          setShowNotifi(false);
        }
      } else {
        console.error("Failed to fetch user data:", response);
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const sendMessage = (e: any) => {
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
      (user: any) => user._id === selectedUser._id
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
      socket.on("chatJoined", (response: any) => {
        // console.log(response,"chatjoined")
        // console.log(currentUserId)
        if(currentUserId!==response?.target_user_id){
          setConversationId(response.conversation_id);
          conwocationidRef.current = response?.conversation_id;
        }
       
         
      });

      socket.on("previousMsg", async (response: any) => {
        setChatMessages(response?.messages?.slice()?.reverse() || []);
      });

      
      socket.on("typingStart", (response: any) => {
        if (response?.conversation_id != conwocationidRef.current) return;
        setTypingResponse(response);
      });

      socket.on("typingStop", (response: any) => {
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
      console.log(response,"online users aht first empty user effect----")
      setOnlineUsers(response);
    });
  }, []);

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

  const handleTextChange = (e: any) => {
    setmessage(e.target.value);
  };

  useEffect(() => {
    socket.on("startTyping", () => {
      setTyping(true);
    });

    socket.on("stopTyping", () => {
      setTyping(false);
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
    };
  }, []);

  useEffect(() => {
    socket.on("GetPrivateMessage", (response) => {
      if (response.conversation_id === conversationId) {
        setChatMessages((prevMessages) => [...prevMessages, response]);
      }
      const updatedUserdata = [...userdata];
      const senderId = response.sender_id;
      const index = updatedUserdata.findIndex((user:any) => user._id === senderId);

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

  const handleDeleteMesssage = (msgId: any) => {
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

  const SocketDelete = (DeleteId: any) => {
    const deleteMsgData = {
      messageIds: [DeleteId],
      conversationId: conversationId,
      sender_id: currentUserId,
    };
    socket.emit("deleteMessages", deleteMsgData);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedUser]);

 
//  console.log(conversationId,"current conversation id")

  return (
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
          {userdata && userdata.length > 0 ? (
            userdata.map((user: any, index) => (
              <div
                key={index}
                className={`flex flex-row py-4 px-2  justify-center items-center border-b-2 cursor-pointer ${
                  selectedUser === user ? "bg-gray-200" : ""
                }`}
                onClick={() => handleUserClick(user?._id)} // Handle click on user
              >
                <div className="w-1/6">
                  {user?.profileImg !== "null" ? (
                    <div className="flex relative">
                      <Image
                        width={200}
                        height={200}
                        src={user?.profileImg}
                        className="object-cover h-12 w-12 rounded-full"
                        alt=""
                      />
                    </div>
                  ) : (
                    <Image
                      width={200}
                      height={200}
                      src={blankprofile}
                      className="object-cover h-12 w-12 rounded-full"
                      alt=""
                    />
                  )}
                </div>
                <div className="w-full">
                  <div className="text-lg font-semibold">{user?.fullName}</div>
                  <span className="text-gray-500">
                    {lastMessages[user._id] ? (
                      <div className="flex justify-between items-center">
                        <p className="flex items-center">
                          {lastMessages[user._id].message_state ===
                            "delivered" &&
                            lastMessages[user._id].sender !== true && (
                              <BiCheckDouble className="w-5 h-5" />
                            )}
                          {lastMessages[user._id].message_state ===
                            "delivered" &&
                            lastMessages[user._id].sender == true &&
                            ""}
                          {lastMessages[user._id].message_state === "sent" &&
                            lastMessages[user._id].sender !== true && (
                              <BiCheck className="w-5 h-5" />
                            )}
                          {lastMessages[user._id].message_state === "seen" &&
                            lastMessages[user._id].sender === true &&
                            ""}
                          {lastMessages[user._id].message_state === "seen" &&
                            lastMessages[user._id].sender !== true && (
                              <BiCheckDouble className="text-blue-500 w-5 h-5" />
                            )}
                          {lastMessages[user._id].message}
                        </p>

                        <div className="flex flex-col justify-center">
                          <p>
                            {lastMessages[user._id].message_state ===
                              "delivered" &&
                            lastMessages[user._id].sender == true &&
                            shownotifi ? (
                              <TbCircleNumber1Filled className="text-green-600 w-5 h-5" />
                            ) : (
                              ""
                            )}
                          </p>
                          <p className="text-xs">
                            {convertTimestampToNormalTime(
                              lastMessages[user._id].timestamp
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500"></p>
                    )}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 px-2 text-center text-gray-500">
              No users available
            </div>
          )}
        </div>

        <div className="chat-background  w-full flex flex-col justify-between">
          {selectedUser ? (
            <>
              <div className="flex flex-col setHeightMessageBox">
                <div className="flex z-[99] flex-col fixed w-full bg-white p-6">
                  <p>{selectedUser?.fullName}</p>
                  <p className="text-xs">
                    {onlineUsers.find(
                      (user) => user.userId === selectedUser?._id
                    )?.online &&
                    disconnectId !== selectedUser?._id &&
                    typingResponse?.typing !== true
                      ? "Online"
                      : ""}
                  </p>

                  {typingResponse?.userId === selectedUser?._id &&
                  typingResponse?.typing === true ? (
                    <p className="text-xs">
                      {selectedUser?.fullName} is typing...
                    </p>
                  ) : null}
                </div>
                <div className="px-5 mt-[6rem]">
                  {chatMessages.map((msg: any, index) => (
                    <div key={index}>
                      <div
                        className={`flex ${
                          msg.sender_id === currentUserId
                            ? "justify-end"
                            : "justify-start"
                        } mb-1`}
                      >
                        <div
                          className={`py-[0.4rem] px-3 ${
                            msg.sender_id === currentUserId
                              ? "bg-black text-white rounded-bl-3xl rounded-tl-3xl rounded-tr-xl"
                              : "bg-gray-400 text-white rounded-br-3xl rounded-tr-3xl rounded-tl-xl"
                          }`}
                        >
                          <div className="flex relative  gap-3">
                            <p> {msg.message} </p>
                            <p className="text-xs bottom-[-12px] relative">
                              {" "}
                              {convertTimestampToNormalTime(msg?.timestamp)}
                            </p>
                            {msg.sender_id === currentUserId ? (
                              <span className="z-[1]">
                                {msg.message_state === "sent" && (
                                  <BiCheck className=" w-5 h-5 mt-2" />
                                )}
                                {msg.message_state === "seen" && (
                                  <BiCheckDouble className="text-blue-500 w-5 h-5 mt-2" />
                                )}
                                {msg.message_state === "delivered" && (
                                  <BiCheckDouble className=" w-5 h-5 mt-2" />
                                )}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        {msg.sender_id === currentUserId && (
                          <>
                            <button
                              onClick={() => handleDeleteMesssage(msg?._id)}
                              id={`dropdownMenuIconButton-${msg._id}`}
                              data-dropdown-toggle={`dropdownDots-${msg._id}`}
                              className="inline-flex items-center  text-sm font-medium text-center "
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 4 15"
                              >
                                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                              </svg>
                            </button>

                            <div
                              id={`dropdownDots-${msg._id}`}
                              hidden={showOptions !== msg._id}
                              className="z-[10]  mt-5 absolute  bg-white divide-y divide-gray-100 dark:bg-slate-800 dark:text-white rounded-lg shadow w-[6rem] "
                            >
                              <ul
                                className="py-2 dropdownMenuIconButton text-md  text-gray-700 dark:text-gray-200"
                                aria-labelledby={`dropdownMenuIconButton-${msg._id}`}
                              >
                                <li>
                                  <p
                                    onClick={() => SocketDelete(msg._id)}
                                    className="block cursor-pointer px-4 py-2 hover:underline"
                                  >
                                    Delete
                                  </p>
                                </li>
                                <li></li>
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}

          {selectedUser && (
            <div className="py-5  px-5">
              <form className="w-full flex justify-between items-center bg-black text-white py-3 px-3 rounded-xl">
                <input
                  value={message}
                  onChange={(e) => handleTextChange(e)}
                  className="w-full bg-black text-white border-none outline-none rounded-xl"
                  type="text"
                  placeholder="Type your message here..."
                />
                <button onClick={sendMessage}>
                  <IoSend className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWeb;
