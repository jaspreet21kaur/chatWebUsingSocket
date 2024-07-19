import moment from 'moment';
import React from 'react';
import { BiCheck, BiCheckDouble } from 'react-icons/bi';

const ChatMessages = ({ chatMessages, currentUserId, handleDeleteMesssage, showOptions, SocketDelete }:{ chatMessages:ChatMessage[], currentUserId?:string, handleDeleteMesssage: any, showOptions: any, SocketDelete: any }) => {
  // Function to group messages by date
  const groupMessagesByDate:any = () => {
    const groupedMessages:any = {};
    
    // Sort messages by timestamp
    const sortedMessages = [...chatMessages].sort((a, b) => {
        const first:any=new Date(a.timestamp)
        const second:any=new Date(b.timestamp)
        const sort=first-second
        return sort;
    });
   
    // Group messages by date
    sortedMessages.forEach(msg => {
      const date = moment(msg.timestamp).format('YYYY-MM-DD');
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(msg);
    });
    
    return groupedMessages;
  };
  
  // Render messages grouped by date
  const renderMessagesByDate = () => {
    const groupedMessages = groupMessagesByDate();
    const dates = Object.keys(groupedMessages);

    return dates.map(date => (
      <div key={date}>
        <div className='flex justify-center'>
        <p className=" mt-4 mb-2 border border-black bg-black w-fit rounded-2xl px-2  text-white">{formatDateHeading(date)}</p>
        </div>
        {groupedMessages[date].map((msg: { _id: React.Key | null | undefined; sender_id: any; message: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; timestamp: any; message_state: string; }, index: number) => (
          <div key={msg._id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'} mb-1`}>
            <div className={`py-[0.4rem] px-3 ${msg.sender_id === currentUserId ? 'bg-black text-white rounded-bl-3xl rounded-tl-3xl rounded-tr-xl' : 'bg-gray-400 text-white rounded-br-3xl rounded-tr-3xl rounded-tl-xl'}`}>
              <div className="flex relative gap-3">
                <p>{msg.message}</p>
                <p className="text-xs bottom-[-12px] relative">{convertTimestampToNormalTime(msg.timestamp)}</p>
                {msg.sender_id === currentUserId && (
                  <span className="z-[1]">
                    {msg.message_state === 'sent' && <BiCheck className="w-5 h-5 mt-2" />}
                    {msg.message_state === 'seen' && <BiCheckDouble className="text-blue-500 w-5 h-5 mt-2" />}
                    {msg.message_state === 'delivered' && <BiCheckDouble className="w-5 h-5 mt-2" />}
                  </span>
                )}
              </div>
            </div>
            {msg.sender_id === currentUserId && (
              <>
                <button onClick={() => handleDeleteMesssage(msg._id)} id={`dropdownMenuIconButton-${msg._id}`} data-dropdown-toggle={`dropdownDots-${msg._id}`} className="inline-flex items-center text-sm font-medium text-center" type="button">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>
                <div id={`dropdownDots-${msg._id}`} hidden={showOptions !== msg._id} className="z-[10] mt-5 absolute bg-white divide-y divide-gray-100 dark:bg-slate-800 dark:text-white rounded-lg shadow w-[6rem]">
                  <ul className="py-2 dropdownMenuIconButton text-md text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownMenuIconButton-${msg._id}`}>
                    <li>
                      <p onClick={() => SocketDelete(msg._id)} className="block cursor-pointer px-4 py-2 hover:underline">Delete</p>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    ));
  };

  // Function to format date heading
  const formatDateHeading = (date: moment.MomentInput) => {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    
    if (date === today) {
      return 'Today';
    } else if (date === yesterday) {
      return 'Yesterday';
    } else {
      return moment(date).format('DD-MM-YYYY');
    }
  };

  const convertTimestampToNormalTime = (msgTime:any) => {
    const formatDateAndTime = moment(msgTime).format('DD-MM-YYYY h:mm A');
    const dateTimeFormat = formatDateAndTime.split(' ');
    const time = dateTimeFormat[1];
    const dayTime = dateTimeFormat[2];
    return `${time} ${dayTime}`;
  };

  return (
    <div className="px-5 mt-[6rem]">
      {renderMessagesByDate()}
    </div>
  );
};

export default ChatMessages;
