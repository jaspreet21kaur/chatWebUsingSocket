import React from 'react'

const SelectedUserHeader = ({selectedUser,onlineUsers,disconnectId,typingResponse}:{selectedUser:UserAndChatData,onlineUsers:onlineUsers[],disconnectId:string,typingResponse:any}) => {
  return (
    <div className="flex z-[99] flex-col fixed w-full bg-white p-6">
    <p>{selectedUser?.fullName}</p>
    <p className="text-xs">
      {onlineUsers.find(
        (user:{userId:string}) => user.userId === selectedUser?._id
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
  )
}

export default SelectedUserHeader