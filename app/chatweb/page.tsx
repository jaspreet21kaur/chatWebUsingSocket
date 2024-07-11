"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import auth from "../configs/auth";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import {
  LogoutApi,
  getAllUserAPi,
  getUserByIdAPi,
} from "../services/apis/user";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import socket from "../services/socket";
import moment from "moment-timezone";
import { BsThreeDotsVertical } from "react-icons/bs";

const ChatWeb = (props: { route: any; navigation: any }) => {
  const isFirstRender = useRef(true);
  const [value, onChangeText] = React.useState<string>("");
  const [message, setmessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const cookies = useCookies();
  const router = useRouter();
  const [userdata, setuserdata] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [online, setOnline] = useState(false);
  const isNotification = true;
  const conwocationidRef = useRef(null);
  const [conversationId, setConversationId] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<any>>([]);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [showTyping, setShowTyping] = useState(false); // To control when to show typing indicator to the receiver
  const [lastMessage, setLastMessage] = useState<any>("");
  const [typingResponse, setTypingResponse] = useState<any>([]);
  const [showOptions, setShowOptions] = useState<string | null>(null);

  //formated time
  function convertTimestampToNormalTime(msgTime: any) {
    const formatDateAndTime = moment(msgTime).format("DD-MM-YYYY h:mm A");
    const dateTimeFormat = formatDateAndTime.split(" ");
    // const date = dateTimeFormat[0];
    const time = dateTimeFormat[1];
    const dayTime = dateTimeFormat[2];
    const normalTime = `${time} ${dayTime}`;

    return normalTime;
  }

  //get all users
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

  //  logout
  const handleLogout = async () => {
    const repsonse = await LogoutApi(currentUserId);
    if (repsonse?.status === 200) {
      localStorage.removeItem(auth.storageTokenKeyName);
      cookies.remove(auth.storageTokenKeyName);
      router.replace("/login");
    }
  };

  //selected particular user to chat
  const handleUserClick = async (id: any) => {
    try {
      const response = await getUserByIdAPi(id);
      if (response?.success) {
        setSelectedUser(response?.userData);
        setLastMessage(null);
      }
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  //to get socket of a particular user
  useEffect(() => {
    if (socket && selectedUser) {
      joinChat();
    }
  }, [socket, selectedUser]);

  //send message
  const sendMessage = (e: any) => {
    const token = localStorage.getItem(auth.storageTokenKeyName);
    e.preventDefault();

    // Emit message
    socket?.emit("sendPrivateMessage", {
      sender_id: currentUserId,
      receiver_id: selectedUser?._id,
      message: message,
      token: token,
      conversation_id: conversationId,
    });

    // Update chat history with sent message
    // const sentMessage = {
    //   sender_id: currentUserId,
    //   receiver_id: selectedUser?._id,
    //   message: message,
    //   timestamp: new Date().toISOString(), // Add timestamp here
    // };
    // setChatMessages((prevChatHistory) => [...prevChatHistory, sentMessage]);

    // Clear input
    setmessage("");
    onChangeText("");
  };

  // Join chat function
  const joinChat = () => {
    const tokenReceived = localStorage.getItem(auth.storageTokenKeyName);
    if (tokenReceived && selectedUser) {
      socket?.emit("joinRoom", {
        isNotification,
        token: tokenReceived,
        targetUserId: selectedUser._id,
      });
    }
  };

  //join chat useeffect
  useEffect(() => {
    if (socket && selectedUser) {
      joinChat();
    }

    return () => {
      if (socket && selectedUser) {
        socket?.emit("leaveChat", {
          userId: currentUserId,
          chatId: conwocationidRef.current,
        });
      }
    };
  }, [socket, selectedUser]);

  //all sockets
  useEffect(() => {
    if (socket && selectedUser) {
      //1.chat joined socket
      socket.on("chatJoined", (response: any) => {
        setConversationId(response.conversation_id);
        conwocationidRef.current = response?.conversation_id;
      });

      socket.on("previousMsg", async (response: any) => {
        setChatMessages(response?.messages?.slice()?.reverse() || []);
        if (
          response?.conversation_id === response?.messages[0]?.conversation_id
        ) {
          setLastMessage(response?.messages[0]);
        }
      });

      //4. all messages see
      // socket.on("allMessageSee", (response: any) => {
      //   console.log("all mesage see , all mesage se", response);
      //   setChatMessages((state: any) => {
      //     return state.map((elm: any) =>
      //       elm?.sender == response?.other_user_id
      //         ? { ...elm, message_state: "seen" }
      //         : { ...elm }
      //     );
      //   });
      // });

      //5. recieve pervious messages
      socket.on("recievePreviousMessages", (response: any) => {
        if (conwocationidRef?.current == response.conversation_id) {
          setChatMessages((state) => [
            ...response?.messages?.reverse(),
            ...state,
          ]);
        }
      });

      //6. typing
      socket.on("typingStart", (response: any) => {
        if (response?.conversation_id != conwocationidRef.current) return;
        setTypingResponse(response);
      });

      //7.stop typing
      socket.on("typingStop", (response: any) => {
        if (response?.conversation_id != conwocationidRef.current) return;
        setTypingResponse(response);
      });

      //8.user offline
      socket.on("userOffline", (response: any) => {
        if (conwocationidRef?.current == response.chatId) {
          setOnline(false);
        }
      });
    
      //9. user online
      socket.on("userOnline", (response: any) => {
        if (conwocationidRef?.current == response.chatId) {
          setOnline(true);
        }
      });

      //10. new user msg
      socket.on("newUserMsg", (response: any) => {
        console.log(response,"new user message")
      });

      //, delete scoket on
      socket.on("messagesDeleted",(response)=>{
        console.log(response)
        setChatMessages(prevMessages =>
          prevMessages.filter(msg => msg._id !== response?.messageIds[0])
        );
      })
    }
  }, [selectedUser]);

  useEffect(() => {
    setSelectedUser(null);
    const token: any = localStorage.getItem(auth.storageTokenKeyName);
    if (token) {
      const decodeToken: any = jwtDecode(token);
      setCurrentUserId(decodeToken?.id);
      setOnline(decodeToken?.userLogin);
      fetchData();
    }

    //sockects
    //1. connection establish
    socket.on("connect", () => {
      console.log("connected to socket");
    });
  }, []);

  //handle typing
  const handelTyping = (action: "start" | "stop") => {
    const userToken = localStorage.getItem(auth.storageTokenKeyName);
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

  // typing additional
  const onChangeTextdebug = (text?: string) => {
    if (!typingTimeoutRef.current) {
      handelTyping("start");
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handelTyping("stop");
      typingTimeoutRef.current = null;
    }, 1000); // 2 seconds delay
  };

  // tying use effect
  useEffect(() => {
    if (isFirstRender.current) {
      // This code will run only on the first render
      isFirstRender.current = false; // Set it to false so it doesn't run again
    } else {
      // This code will run on subsequent renders, i.e., when `value` changes
      onChangeTextdebug();
    }
  }, [message]);

  const onTextChange = (text: string) => {
    onChangeText(text); // Update local state with text input
    if (text.trim() === "") {
      handelTyping("stop");
    } else {
      handelTyping("start");
    }
  };

  //handle text change
  const handleTextChange = (e: any) => {
    setmessage(e.target.value);
    // onTextChange(e.target.value);
  };

  useEffect(() => {
    socket.on("startTyping", () => {
      setTyping(true); // Update state to show typing indicator
    });

    socket.on("stopTyping", () => {
      setTyping(false); // Update state to hide typing indicator
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
    };
  }, []);

  //get private messsage
  useEffect(() => {
    socket.on("GetPrivateMessage", (response) => {
      // Check if the message belongs to the current conversation
      if (response.conversation_id === conversationId) {
        setChatMessages((prevMessages) => [...prevMessages, response]);
      }
    });
   
    
    return () => {
      socket.off("GetPrivateMessage");
      
    };
  }, [conversationId]);

  //typing useeffect
  useEffect(() => {
    socket.on("startTyping", () => {
      if (!typing) {
        setShowTyping(true); // Show typing indicator to the receiver only if sender is typing
      }
    });

    socket.on("stopTyping", () => {
      setShowTyping(false); // Hide typing indicator when sender stops typing
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
    };
  }, [typing]);

  //handle delete message
  const handleDeleteMesssage = (msgId: any) => {
    setShowOptions(prev => prev === msgId ? null : msgId); // Toggle showOptions based on current state
   
  }

  //close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showOptions && !target.closest(`#dropdownMenuIconButton-${showOptions}`) && !target.closest(`#dropdownDots-${showOptions}` )) {
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
  
  // message delete
  const SocketDelete=(DeleteId:any)=>{
      const deleteMsgData={
        messageIds:[DeleteId],
        conversationId:conversationId,
        sender_id:currentUserId
      }
      socket.emit("deleteMessages",deleteMsgData)
     
  }
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
              placeholder="search chatting"
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
                <div className="w-1/4">
                  {/* <Image src={boy} className="object-cover h-12 w-12 rounded-full" alt="" /> */}
                </div>
                <div className="w-full">
                  <div className="text-lg font-semibold">{user?.fullName}</div>

                  {lastMessage?.receiver_id === user._id && (
                    <span className="text-gray-500">
                      {lastMessage?.message}
                    </span>
                  )}
                  {lastMessage?.sender_id === user._id && (
                    <span className="text-gray-500">
                      {lastMessage?.message}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 px-2 text-center text-gray-500">
              No users available
            </div>
          )}
        </div>

        {/* Message Section */}
        <div className="chat-background  w-full flex flex-col justify-between">
          {selectedUser ? (
            <>
            
            <div className="flex flex-col setHeightMessageBox">
              <div  className="flex flex-col fixed w-full bg-white p-6">
                {/* <Image src={boy} className="object-cover h-12 w-12 rounded-full" alt="" /> */}
                <p>{selectedUser?.fullName}</p>
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
                                      onClick={()=>SocketDelete(msg._id)}
                                      className="block cursor-pointer px-4 py-2 hover:underline" 
                                    >
                                      Delete
                                    </p>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="block cursor-pointer px-4 py-2 hover:underline  dark:text-white"
                                    >
                                      Edit
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* {typing && (
                   <p>Typing....</p>
                )} */}
              </div>
            </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}
          {/* Message Input */}
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
