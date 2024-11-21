import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./../CSS files/chat.css";
import { MdEmojiEmotions } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { HiOutlineDotsVertical } from "react-icons/hi";
// import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [chatroom, setRoom] = useState(null);
  const [messages, setMessages] = useState([]); // State to hold messages
  const [newMessage, setNewMessage] = useState(""); // For typing new message
  // const [isLoading, setIsLoading] = useState(false); // Loading state
  // const [error, setError] = useState(null); // For error handling
  const [createbuton, setcreatebutton] = useState("false");
  const [groupname, setgroupname] = useState([]);
  const [newgroupname, setnewgroupname] = useState("");

  // const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userid = localStorage.getItem('userid');

  // const isLogin = localStorage.getItem('isLogin');



  const createGroup = async () => { //DONE

    // console.log(groupName);
    try {
      await axios.post('/api/groups/create', { groupName: newgroupname, createdBy: userid }, {
        headers: {
          Authorization: `Bearer ${token}` // Assuming token is stored in localStorage
        }
      })
      // console.log(res.data.group);

    } catch (error) {
      console.log(error);

    }

    // try {
    //   const response = await axios.post('/api/groups/create', { groupName }, {
    //     headers: {
    //       Authorization: `Bearer ${token}` // Assuming token is stored in localStorage
    //     }
    //   });
    //   console.log('Group created successfully:', response.data);
    // } catch (error) {
    //   console.error('Error creating group:', error.response ? error.response.data : error.message);
    // }
  };

  const creategrouptoggle = () => {
    // Handle creating a new group
    if (createbuton === "false") {
      setcreatebutton("true");
    } else {
      setcreatebutton("false");
    }
  };

  useEffect(() => {
    const fatchgroups = async () => { //DONE
      // Handle fetching messages for a specific group
      const groupsresponse = await axios.get('/api/groups/list', {
        headers: {
          Authorization: `Bearer ${token}` // Assuming token is stored in localStorage
        }
      });
      // console.log(groupsresponse.data);

      setgroupname(groupsresponse.data);
    }


    fatchgroups();
  }, [token]);




  const sendMessage = async () => {

    const selectedgroup = localStorage.getItem('selectedgroup');
    const messageData = {
      groupId: selectedgroup, // The group where the message is sent
      messageText: newMessage, // The content of the message
      userId: userid
    };

    try {
      const response = await axios.post('/api/message/send', messageData
        //   , {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('token')}`,
        //   },
        // }
      );
      console.log('Message sent:', response.data);
      const newMessageObject = {
        sender: "me", // Mark the sender as "me"
        messageText: response.data.message.messageText,
        timestamp: new Date().toLocaleTimeString()
      };
      // const newMessageObject = response.data.message.messageText;
      setMessages([...messages, newMessageObject]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  const getMessages = async (group) => { //DONE
    setRoom(group)
    localStorage.setItem('selectedgroup', group._id);
    setMessages([]);
    try {
      const response = await axios.get(`/api/message/${group._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // console.log('Messages:', response.data);
      setMessages(response.data);

    } catch (error) {
      console.error('Error fetching messages:', error.response ? error.response.data : error.message);
    }
  };



  return (
    <>
      {token &&
        <div className="chatcontainer">
          <div className="chatmainsection">
            <div className="groupsection">
              {createbuton === "true" ? <>
                <div className="chatgroupsbar">
                  <div className='groupsheading'>Create Group</div>
                  <div className="searchbar">
                    {/* <input className='groupsearchbar' type="text" placeholder="Search" /> */}
                  </div>
                  <button onClick={() => creategrouptoggle(null)} className="creategroupbtn">
                    {/* <div className="plus">+</div> */}
                    <div className="creategroupname">Close Group</div>
                  </button>
                </div>
              </> : <>
                <div className="chatgroupsbar">
                  <div className='groupsheading'>Groups</div>
                  <div className="searchbar">
                    <input className='groupsearchbar' type="text" placeholder="Search" />
                  </div>
                  <button onClick={() => creategrouptoggle(null)} className="creategroupbtn">
                    {/* <div className="plus">+</div> */}
                    <div className="creategroupname">Create Group</div>
                  </button>
                </div>
              </>}

              {createbuton === "true" ?
                (<>
                  <div className="groupinputsection">
                    <input
                      type="text"
                      placeholder="Group Name"
                      className="groupinput"
                      value={newgroupname}
                      onChange={(e) => setnewgroupname(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createGroup(groupname)}
                    />
                    <button onClick={(e) => createGroup(groupname)} className="createbutton">Create</button>
                  </div>
                </>)
                : (<div className="chatgroupssection">
                  {groupname.map((group, index) => (
                    <button
                      key={index}
                      onClick={() => getMessages(group)} // Set the selected chatroom
                      className="chatgroups"
                    >
                      <div className="imgandname">
                        <div className="logoimg">L</div>
                        <div className="gname">{group.groupName}</div>
                      </div>
                      <div className="groupbar"><HiOutlineDotsVertical /></div>
                    </button>
                  ))}
                </div>)

              }

            </div>

            <div className="chatsection">
              <div className="chatheadersection">
                <button className="logoandname">
                  <div className="grouplogo">L</div>
                  <div className="groupname">{chatroom ? chatroom.groupName : "Select a group"}</div>
                </button>
                <div className="groupbar">
                  <button className="gbar"><HiOutlineDotsVertical /></button>
                </div>
              </div>

              {/* Message Section */}
              <div className="chatmessagesection">
                {
                  messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender === "me" || message.userId._id === userid ? "sent" : "received"}`}>
                      <div className={`message-content ${message.sender === "me" || message.userId._id === userid ? "sent-message" : "received-message"}`}>
                        {message.messageText}
                        <span className="timestamp">{message.timestamp}</span>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="chatinputsection">
                <button className="emogies"><MdEmojiEmotions /></button>
                <button className="links"><FaLink /></button>
                <input
                  className="chatinput"
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)} // Track input value
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Send on Enter key press
                />
                <button className="sendbutton" onClick={sendMessage}>
                  <IoMdSend />
                </button>
              </div>
            </div>
          </div>
        </div>



      }
    </>
  );
};

export default Chat;
