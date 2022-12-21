import { Avatar, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CallIcon from "@mui/icons-material/Call";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import styled from "@emotion/styled";
import SendIcon from "@mui/icons-material/Send";
import InputEmoji from "react-input-emoji";
import React, { createRef, useRef, useEffect, useState } from "react";
import { ChatlogicStyling, isSameSender } from "./ChatstyleLogic";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentMessages, sendMessageApi } from "./Redux/Chatting/action";
import { sendMessage } from "./Redux/Chatting/action";
import { addUnseenmsg } from "./Redux/Notification/action";
import { MessageRepository } from "@amityco/js-sdk";

const SERVER_POINT = "https://messenger-clo.herokuapp.com";
var socket, currentChattingWith;

export const ChattingPage = () => {
  const { user, token } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.chatting);
  const reduxUserStore = useSelector((store) => store.user);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    var objDiv = document.getElementById("chat-scroll");

    setTimeout(() => {
      objDiv.scrollTo({
        top: objDiv.scrollHeight,
        left: 0,
      });
    }, 150);
  };

  const [chatMessage, setChatMessage] = useState([]);
  var { unseenmsg } = useSelector((store) => store.notification);
  const {
    chatting: {
      isGroupChat,
      chatName,
      user: { pic, name, userId },
      _id,
    },
  } = useSelector((store) => store.chatting);
  const scrolldiv = createRef();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  function queryChatMessage() {
    const liveCollection = MessageRepository.queryMessages({ channelId: _id });
    let messages = liveCollection.models;

    liveCollection.on("dataUpdated", (data) => {
      messages = data;

      let mappedMessages = messages.map((item) => {
        return {
          _id: item.userId,
          sender: {
            _id: userId,
            name: "sdsd",
            email: "dfsdsf@mdvmkodsv.com",
            pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
          },
          content: item.data.text,
          chat: {
            _id: item.messageId,
            chatName: "sender",
            isGroupChat: false,
            users: [userId, reduxUserStore.userId.userId],
            createdAt: item.createdAt,
            updatedAt: item.editedAt,
            latestMessage: "633e8d007dbc394e1dd2a711",
          },
          readBy: [],
          createdAt: item.createdAt,
          updatedAt: item.createdAt,
        };
      });

      setChatMessage(mappedMessages);
      scrollToBottom();
    });
  }
  useEffect(() => {
    if (chatMessage.length > 0) {
      setChatMessage([]);
    }

    queryChatMessage();
  }, [_id]);

  return (
    <div className="chattingpage">
      <div className="top-header">
        <div className="user-header">
          <Avatar src={isGroupChat ? "" : pic} />
          <p className="user-name">{isGroupChat ? chatName : name}</p>
        </div>
        <div>
          <div className="user-fet">
            <SearchIcon />
            <CallIcon />
            <VideoCallIcon />
            <MoreHorizIcon />
          </div>
        </div>
      </div>
      <div ref={messagesEndRef} id="chat-scroll" className="live-chat">
        {chatMessage.map((el, index) => (
          <div
            key={index}
            className={
              el.sender._id == el._id ? "rihgtuser-chat" : "leftuser-chat"
            }
          >
            <div className={el.sender._id == el._id ? "right-avt" : "left-avt"}>
              <p className="time chat-time">
                {new Date(el.createdAt).getHours() +
                  ":" +
                  (new Date(el.createdAt).getMinutes() < 10 ? "0" : "") +
                  new Date(el.createdAt).getMinutes()}
              </p>
              <div className={ChatlogicStyling(el.sender._id, el._id)}>
                <p>{el.content}</p>
              </div>

              {isSameSender(messages, index) ? (
                <Avatar
                  src={el.sender._id != el._id ? el.sender.pic : el.pic}
                />
              ) : (
                <div className="blank-div"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="sender-cont">
        <InputContWithEmog
          id={_id}
          token={token}
          socket={socket}
          onSendChat={scrollToBottom}
        />
      </div>
    </div>
  );
};
const ColorButton = styled(Button)(() => ({
  color: "white",
  fontSize: "20px",
  textTransform: "none",
  padding: "12px",
  marginRight: "15px",
  backgroundColor: "#27b48c",
  "&:hover": {
    backgroundColor: "#0f8e6a",
  },
}));
function InputContWithEmog({ id, token, socket, onSendChat }) {
  const [text, setText] = useState("");

  // const dispatch = useDispatch();

  function sendChatMessage() {
    onSendChat && onSendChat();
    const liveObject = MessageRepository.createTextMessage({
      channelId: id,
      text: text,
    });

    liveObject.on("dataUpdate", (message) => {
      console.log("message is created", message);
    });
  }

  function handleOnEnter() {
    sendChatMessage();
  }
  function handleChatClick() {
    // dispatch(
    //   sendMessageApi(
    //     {
    //       content: text,
    //       chatId: id,
    //     },
    //     token,
    //     socket
    //   )
    // );
    sendChatMessage();
    setText("");
  }

  return (
    <>
      <div className="search-cont send-message">
        <InputEmoji
          value={text}
          onChange={setText}
          cleanOnEnter
          onEnter={handleOnEnter}
          placeholder="Type a message"
        />
      </div>
      <ColorButton
        onClick={handleChatClick}
        variant="contained"
        endIcon={<SendIcon />}
      ></ColorButton>
    </>
  );
}
