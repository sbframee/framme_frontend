import React from "react";

import Logo from "../../assets/frameelogo.png";
const Navbar = ({ Tag }) => {
  return (
    <div className="navbar" style={{ justifyContent: "space-between" }}>
      {Tag?<Tag />:""}
      <div
        className="flex"
        style={{ justifyContent: "flex-end", width: "100%" }}
      >
        <img src={Logo} style={{ width: "40px" }} alt="" />
      </div>
    </div>
  );
};

export default Navbar;
