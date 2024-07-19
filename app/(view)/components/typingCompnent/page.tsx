import React from 'react'
import { IoSend } from 'react-icons/io5'

const TypingComponent = ({message,handleTextChange,sendMessage}:{message:string,handleTextChange:any,sendMessage:any}) => {
  return (
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
  )
}

export default TypingComponent