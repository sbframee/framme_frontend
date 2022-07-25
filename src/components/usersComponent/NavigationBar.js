import React from "react";
import "./style.css";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from "react-router-dom";
const NavigationBar = () => {
    const navigate =useNavigate()
  return (
    <div className="navigations flex">
      <div className="icon-container flex" style={{ flexDirection: "column" }}>
        <HomeIcon />
        <div>Home</div>
      </div>
      <div className="icon-container flex" style={{ flexDirection: "column" }}>
        <PersonIcon />
        <div>Home</div>
      </div>
      <div className="icon-container flex" style={{ flexDirection: "column" }} onClick={() => navigate("/customInput")}>
        <AddIcon className="customBtn"/>
        <div>Custom</div>
      </div>
      <div className="icon-container flex" style={{ flexDirection: "column" }}>
        <NotificationsIcon />
        <div>Home</div>
      </div>
      <div className="icon-container flex" style={{ flexDirection: "column" }}>
        <SettingsIcon />
        <div>Home</div>
      </div>
    </div>
  );
};

export default NavigationBar;
