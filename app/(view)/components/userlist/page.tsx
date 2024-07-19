import React from 'react'
import Image from 'next/image'
import { BiCheckDouble, BiCheck } from 'react-icons/bi'
import { TbCircleNumber1Filled } from 'react-icons/tb'
import moment from 'moment';
import blankprofile from "../../../../public/Images/blankProfile.webp"


function convertTimestampToNormalTime(msgTime: any) {
    const formatDateAndTime = moment(msgTime).format("DD-MM-YYYY h:mm A");
    const dateTimeFormat = formatDateAndTime.split(" ");
    const time = dateTimeFormat[1];
    const dayTime = dateTimeFormat[2];
    const normalTime = `${time} ${dayTime}`;

    return normalTime;
  }
const UserList = ({userdata,lastMessages,handleUserClick,selectedUser,shownotifi}:{userdata:UserData[],shownotifi:any,lastMessages:any,handleUserClick:any,selectedUser:any}) => {
  return (
    <div>{userdata && userdata.length > 0 ? (
        userdata.map((user:{_id:string,fullName:string,profileImg:any}, index:number) => (
          <div
            key={index}
            className={`flex flex-row py-4 px-2  justify-center items-center border-b-2 cursor-pointer ${
              selectedUser === user ? "bg-gray-200" : ""
            }`}
            onClick={() => handleUserClick(user?._id)} 
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
      )}</div>
  )
}

export default UserList