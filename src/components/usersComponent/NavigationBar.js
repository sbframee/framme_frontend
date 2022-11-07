import React from "react";
import "./style.css";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
const NavigationBar = () => {
  const navigate = useNavigate();
  return (
    <div className="navigations flex">
      <div className="icon-container flex" style={{ flexDirection: "column" }}>
        <HomeIcon />
        <div>Home</div>
      </div>

      <div
        className="icon-container flex"
        style={{ flexDirection: "column" }}
        onClick={() => navigate("/tagInput")}
      >
        <PersonIcon />
        <div>Inputs</div>
      </div>
      <div
        className="icon-container flex"
        style={{
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          height: "66px",
        }}
        onClick={() => navigate("/customInput")}
      >
        <span
          className="flex"
          style={{
            position: "absolute",
            border: "5px solid red",
            borderRadius: "50%",
            top: "-35px",
            width: "70px",
            height:"70px"
          }}
        >
          <AddIcon className="customBtn" />
        </span>

        <div>Custom</div>
      </div>
      <div
        className="icon-container flex"
        style={{ flexDirection: "column" }}
        onClick={() => navigate("/tagInput")}
      >
        <PersonIcon />
        <div>Inputs</div>
      </div>
      <div
        className="icon-container flex"
        style={{ flexDirection: "column" }}
        onClick={() => {
          localStorage.clear();
          window.location.assign("/users");
        }}
      >
        <Logout />
        <div>Logout</div>
      </div>
    </div>
  );
};

export default NavigationBar;
