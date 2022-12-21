import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useRef, useState } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { Avatar, Badge } from "@mui/material";
import { useDispatch } from "react-redux";
import { makeSearchApi } from "./Redux/Searching/action";
import { useSelector } from "react-redux";
import { accessChat, makeRecentChatApi } from "./Redux/RecentChat/action";
import { selectChat } from "./Redux/Chatting/action";
import { removeSeenMsg } from "./Redux/Notification/action";
import {
  ChannelRepository,
  ChannelType,
  ChannelFilter,
  ChannelSortingMethod,
  MemberFilter,
} from "@amityco/js-sdk";
import axios from "axios";

export const MyChat = () => {
  const [search, setSearch] = useState(false);
  const [recentChat, setRecentChat] = useState([]);
  const [channelList, setChannelList] = useState([]);

  const { search_result, loading, error } = useSelector(
    (store) => store.search
  );
  const { recent_chat, loading: chat_loading } = useSelector(
    (store) => store.recentChat
  );
  const SEARCH_RESULT = "SEARCH_RESULT";
  const searchResult = (payload) => ({ type: SEARCH_RESULT, payload });

  const { user, token } = useSelector((store) => store.user);
  const { userId } = useSelector((store) => store.user);
  const { chatting } = useSelector((store) => store.chatting);
  const { notification, unseenmsg } = useSelector(
    (store) => store.notification
  );
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  useEffect(() => {
    if (token) dispatch(makeRecentChatApi(token));
  }, [user]);
  const ref = useRef();

  const handleQuery = (e) => {
    let id;
    return function (e) {
      if (!e.target.value) {
        setSearch(false);
        return;
      }
      if (ref.current) clearTimeout(ref.current);
      setSearch(true);
      setKeyword(e.target.value);
    };
  };
  function onClickSearch() {
    // queryAllUser(keyword);

    dispatch(makeSearchApi(keyword));
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onClickSearch();
    }
  };
  useEffect(() => {
    queryRecentChat();
  }, []);

  function queryRecentChat() {
    let channels;

    const liveCollection = ChannelRepository.queryChannels({
      types: [ChannelType.Conversation],
      filter: ChannelFilter.Member,
      isDeleted: false,
      sortBy: ChannelSortingMethod.LastCreated,
    });

    liveCollection.on("dataUpdated", (models) => {
      channels = models;

      setChannelList(models);
    });
  }
  function filterRecentChat() {
    const account = userId.userId;
    let resultArr = [];
    let senderName = "";
    channelList.forEach((model) => {
      let members;
      const liveCollection = ChannelRepository.queryMembers({
        channelId: model.channelId,
        memberships: [MemberFilter.Member],
      });

      members = liveCollection.models;

      let sender = members && members.filter((item) => item.userId !== account);
      if (sender.length == 1) {
        senderName = sender[0].userId;
      } else if (sender.length > 1) {
        let userIdArr = sender.map((item) => item.userId);
        let chatName = userIdArr.join(",");
        senderName = chatName;
      } else {
        senderName = "Empty Chat";
      }
      resultArr.push({
        _id: senderName,
        name: senderName,
      });
      setRecentChat(resultArr);
    });
    //   let sender;
    //   liveCollection.on("dataUpdated", (newModels) => {
    //     members = newModels;

    //     sender = members.filter((item) => item.userId !== account);

    //     if (sender.length == 1) {
    //       senderName = sender[0].userId;
    //     } else if (sender.length > 1) {
    //       let userIdArr = sender.map((item) => item.userId);
    //       let chatName = userIdArr.join(",");
    //       senderName = chatName;
    //     } else {
    //       senderName = "Empty Chat";
    //     }

    //     resultArr.push({
    //       _id: senderName,
    //       name: senderName,
    //     });
    //     setRecentChat(resultArr);
    //   });
  }
  useEffect(() => {
    filterRecentChat();
  }, [channelList]);

  // useEffect(() => {
  //   // dispatch(searchResult(recentChat));
  //   console.log("recentChat: ", recentChat);
  // }, [recentChat]);

  return (
    <div className="mychat-cont">
      <div>
        <div className="notification">
          <h2>Chats</h2>
          {/* <NotificationsIcon /> */}
          <Badge badgeContent={notification} color="error">
            <Notificationcomp />
          </Badge>
          {/* <AddIcon /> */}
        </div>
        <div className="search-cont">
          <SearchIcon onClick={onClickSearch} />
          <input
            onChange={handleQuery()}
            type="text"
            placeholder="Search users"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div className="recent-chat">
        <p className="Recent">Recent</p>
        <div className="recent-user">
          {search
            ? search_result.map((el) => (
                <SearchUserComp
                  key={el._id}
                  {...el}
                  token={token}
                  recent_chat={recent_chat}
                  setSearch={setSearch}
                />
              ))
            : recentChat.map((el, index) => (
                <SearchUserComp
                  key={el._id}
                  {...el}
                  token={token}
                  recent_chat={recent_chat}
                  setSearch={setSearch}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default function Notificationcomp() {
  const { unseenmsg } = useSelector((store) => store.notification);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (unseenmsg.length !== 0) dispatch(removeSeenMsg([]));
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      {/* <NotificationsIcon
        color="black"
        aria-describedby={id}
        onClick={handleClick}
      /> */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {!unseenmsg.length ? (
          <Typography sx={{ p: 2, width: 170 }}>No new messages.</Typography>
        ) : (
          unseenmsg.map((el, index) => (
            <Typography key={index} sx={{ p: 2, width: 170 }}>
              {el.sender.name + " " + el.content.substring(0, 15) + "..."}
            </Typography>
          ))
        )}
      </Popover>
    </div>
  );
}
const ChatUserComp = ({
  isGroupChat,
  chatName,
  users,
  latestMessage,
  id,
  _id,
  index,
  chattingwith,
}) => {
  const dispatch = useDispatch();
  const handleSelectChat = () => {
    dispatch(
      selectChat({
        isGroupChat,
        index,
        user: users.find((el) => el._id != id),
        _id,
        chatName,
      })
    );
  };
  return (
    <div
      onClick={handleSelectChat}
      // className={chattingwith == _id ? "user selectUser" : "user"}
    >
      <div className="history-cont">
        {isGroupChat ? (
          <div>{<Avatar>G</Avatar>}</div>
        ) : (
          <div>{<Avatar src={users.find((el) => el._id != id)?.pic} />}</div>
        )}
        <div>
          {isGroupChat ? (
            <p className="name">{chatName}</p>
          ) : (
            <p className="name">{users.find((el) => el._id != id)?.name}</p>
          )}
          <p className="chat">
            {latestMessage
              ? latestMessage.content.length > 8
                ? latestMessage.content.substring(0, 30) + " . . ."
                : latestMessage.content
              : ""}
          </p>
        </div>
      </div>
      <div>
        {latestMessage ? (
          <p className="time">
            {new Date(latestMessage?.updatedAt).getHours() +
              ":" +
              new Date(latestMessage?.updatedAt).getMinutes()}
          </p>
        ) : (
          ""
        )}
        {/* <p className="unseen-chat">5</p> */}
      </div>
    </div>
  );
};

export const SearchUserComp = ({
  _id,
  email,
  name,
  pic,
  token,
  recent_chat,
  setSearch,
}) => {
  const dispatch = useDispatch();
  const storeUserData = useSelector((store) => store.user);
  const SELECT_CHAT = "SELECT_CHAT";
  const selectChat = (payload) => ({ type: SELECT_CHAT, payload });

  function createChannel(channelId, user1, user2) {
    axios
      .post("https://power-school-demo.herokuapp.com/v1/channels", {
        channelId: channelId,
        user1: user1,
        user2: user2,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  const handleSubmitForAcceChat = () => {
    // dispatch(accessChat(_id, token, recent_chat));

    const userId = storeUserData.userId.userId;
    // setSearch(false);
    const liveChannel = ChannelRepository.createChannel({
      type: ChannelType.Conversation,
      userIds: [userId, _id],
      displayName: `${userId},${_id}`,
    });
    liveChannel.once("dataUpdated", (data) => {
      console.log("channel created", data);
      dispatch(
        selectChat({
          isGroupChat: false,
          index: 0,
          user: {
            pic: pic,
            name: name,
            userId: _id,
          },
          _id: data.channelId,
          chatName: "Mock",
        })
      );
      createChannel(data.channelId, userId, _id);
    });
  };

  return (
    <div onClick={handleSubmitForAcceChat} className="user">
      <div className="history-cont">
        <div>{<Avatar src={pic} />}</div>
        <div>
          <p className="name">{name}</p>
          {/* <p className="chat">Email: {email}</p> */}
        </div>
      </div>
    </div>
  );
};
