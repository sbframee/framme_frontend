import React from "react";

import Logo from "../../assets/frameelogo.png";
const Navbar = ({ Tag }) => {
  return (
    <div className="navbar" style={{ justifyContent: "space-between" }}>
      <img src={Logo} style={{ width: "40px" }} alt="" />

      {Tag ? <Tag /> : ""}
    </div>
  );
};

export default Navbar;
