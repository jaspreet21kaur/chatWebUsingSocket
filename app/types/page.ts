interface UserData {
    createdAt: string;
    email: string;
    fullName: string;
    mobileNumber: string | null;
    profileImg: string | null; 
    updatedAt: string; 
    _id: string;
  
  }
  

interface ChatIdObject {
  conversation_id: string;
}



interface UserAndChatData {
  chatIds: ChatIdObject[];
  createdAt: string;
  email: string;
  fullName: string;
  mobileNumber: number;
  profileImg: string;
  updatedAt: string;
  _id: string;
}

interface ChatMessage {
  conversation_id: string;
  isReply: boolean;
  message: string;
  message_state: "delivered" | "seen" | "sent";
  reaction: any[];
  receiver_id: string;
  sender_id: string;
  timestamp: string;
  __v: number;
  _id: string;
}

interface TypingStatus {
  userId: string;
  conversation_id: string;
  typing: boolean;
}

interface onlineUsers {
  userId: string;
  online: boolean;
}

interface MessageInfo {
  conver: string;
  message: string;
  message_state: "seen" | "delivered";
  sender: boolean;
  timestamp: string;
}

interface chatJoined {
  conversation_id: string;
  isSuggestionActive: boolean;
  message: string;
  target_user_id:string;
}

interface Message {
    conversation_id: string;
    isReply: boolean;
    message: string;
    message_state: 'delivered' | 'seen' | 'sent'; 
    reaction: any[]; 
    receiver_id: string;
    sender_id: string;
    timestamp: string; 
    __v: number; 
    _id: string;
  }
  
  interface Conversation {
    messages: Message[];
    conversation_id: string;
  }
  