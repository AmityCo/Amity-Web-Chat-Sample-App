import "./auth.css";
import avatar from "./amity-no-bg.png";
import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { Link, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import { authRegister, uploadPic } from "../Redux/Auth/action";
import { useNavigate } from "react-router-dom";
import AmityClient, { ConnectionStatus, ApiEndpoint } from "@amityco/js-sdk";
import axios from "axios";

export const RegisterComp = () => {
  const { user, loading, error } = useSelector((store) => store.user);
  const [regData, setRegData] = useState({
    pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    isAdmin: false,
    name: "",
    email: "",
    password: "",
  });
  const [amityUser, setAmityUser] = useState({
    displayName: "",
    userId: "",
    email: "",
  });

  const [onConnected, setOnConnected] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = ""; // add your api key here
  function login() {
    const client = new AmityClient({
      apiKey: apiKey,
      apiEndpoint: ApiEndpoint.SG,
    });
    // modify your server region here e.g ApiEndpoint.EU
    if (amityUser.userId.length > 0) {
      client.registerSession({
        userId: amityUser.userId,
        displayName: amityUser.displayName,
      }); // Add your own userId and displayName
      client.on("connectionStatusChanged", ({ newValue }) => {
        if (newValue === ConnectionStatus.Connected) {
          console.log("connected to asc " + amityUser.displayName);
          registerUser(
            amityUser.userId,
            amityUser.displayName,
            amityUser.email
          );
          setOnConnected(true);
        } else {
          console.log(" not connected to asc");
        }
      });
      console.log("client: ", client);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    // setRegData({ ...regData, [name]: value });
    setAmityUser({ ...amityUser, [name]: value });
  };

  const handleSubmit = () => {
    login();
  };
  function registerUser(userId, displayName, email) {
    axios
      .post("https://power-school-demo.herokuapp.com/v1/users", {
        userId: userId,
        displayName: displayName,
        email: email,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  const authUser = (payload) => ({ type: "AUTH_ID", payload });
  useEffect(() => {
    if (onConnected) {
      navigate("/");
      dispatch(authUser(amityUser));
    }
  }, [onConnected]);

  return (
    <div className="auth-cont">
      <div>
        <h2 className="auth-heading">Create an account</h2>
        <div>
          <div className="profile-pic">
            {/* <input onChange={handleInputFile} type="file" name="" id="file" /> */}
            {/* <label htmlFor="file" id="uploadBtn"> */}
            {/* <img id="photo" src={user.pic ? user.pic : avatar} /> */}
            <img id="photo" src={avatar} />
            {/* </label> */}
          </div>
          {/* <p className="profile-text">Choose Profile</p> */}
        </div>
        <div className="details-cont">
          <p>Display name</p>
          <input
            onChange={handleChange}
            name="displayName"
            className="inputcom"
          />

          <p>User ID</p>
          <input onChange={handleChange} name="userId" className="inputcom" />
          <p>Email</p>
          <input onChange={handleChange} name="email" className="inputcom" />
          {/* <p>Password</p>
          <input
            onChange={handleChange}
            type="password"
            name="password"
            className="inputcom"
          />

          <p>Confirm Password</p>
          <input type="password" className="inputcom" /> */}

          {loading ? (
            <ColorButton disabled>
              <CircularProgress style={{ color: "white" }} />
            </ColorButton>
          ) : (
            <ColorButton onClick={handleSubmit}>Continue</ColorButton>
          )}

          {/* <Link className="auth-link" to={"/login"}>
            Already have an account
          </Link> */}
          <p className="contract">
            {/* By registering you agree to Messenger's{" "}
            <span>Terms of Service</span> and <span>Privacy Policy</span>. */}
          </p>
        </div>
      </div>
    </div>
  );
};
const ColorButton = styled(Button)(() => ({
  color: "white",
  fontSize: "20px",
  textTransform: "none",
  backgroundColor: "#06be8b",
  "&:hover": {
    backgroundColor: "#039f73",
  },
  borderRadius: "15px",
}));
