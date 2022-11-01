import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";

import PostersPopup from "./PostersPopup";
const SideBar = () => {
  const [posterPopup, setPosterPopup] = useState(false);


  return (
    <>
      <div className="sidebar">
        <NavLink
          to="/home"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/occasion"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Occasion
        </NavLink>
        <NavLink
          to="/category"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Category
        </NavLink>
        <NavLink
          to="/tags"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Tags
        </NavLink>
        <NavLink
          to="/user_data"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Users
        </NavLink>
        <NavLink
          to="/user_category"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          User Category
        </NavLink>
        <NavLink
          to="#"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
          onClick={() => setPosterPopup(true)}
        >
          Posters
        </NavLink>
      </div>
      {posterPopup ? (
       <PostersPopup onSave={()=>setPosterPopup(false)}/>
      ) : (
        ""
      )}
    </>
  );
};

export default SideBar;
