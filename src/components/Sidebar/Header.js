import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const Navigate = useNavigate();

  return (
    <>
      <div className="header">
        <div className="name">
          <h2>Framee</h2>

        </div>
        <div className="header_right">
          <div className="header_right_link" onClick={() => Navigate("/admin")}>
            Dashboard
          </div>
          <div
            className="header_right_link"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
              Navigate("/login");
            }}
          >
            Logout
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
