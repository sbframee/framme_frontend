import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ViewGridIcon } from "@heroicons/react/solid";
import axios from "axios";
const NavLink = ({
  title,
  icon,
  menuList,
  draggable,
  href,
  setIsItemAvilableOpen,
}) => {
  // console.log(title)
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Link
      to={{ pathname: href }}
      className="nav_link_container"
      onClick={() => {}}
    >
      <div
        className={`nav-link`}
        draggable={draggable}
        onClick={() => menuList && setMenuVisible(!menuVisible)}
        onMouseLeave={(e) => setMenuVisible(false)}
        id={`item-category-${title?.toLowerCase()}`}
      >
        <>
          {icon}
          <p>
            {draggable && (
              <ViewGridIcon
                style={{
                  minWidth: "1rem",
                  maxWidth: "1rem",
                  marginRight: 10,
                  cursor: "move",
                }}
              />
            )}
            <span className={`nav_title`}>
              {title?.slice(0, 31)}
              {title?.length > 32 && "..."}
            </span>
          </p>
        </>
        {/* Submenu popup*/}
        {menuList && (
          <div
            className="menu"
            style={{
              display: menuVisible ? "block" : "none",
              top:
                title === "Report"
                  ? "-350px"
                  : title === "Setup"
                  ? "-190px"
                  : "-10px",
              width: title === "Report" ? "300px" : "200px",
            }}
          >
            {menuList
              .filter((a) => a)
              .map((menu) => (
                <div
                  className="item"
                  key={Math.random()}
                  onClick={() => {
                    console.log(menu);
                    if (menu.name === "Poster")
                      setIsItemAvilableOpen(true);
                  }}
                >
                  {<Link to={menu.link}>{menu.name}</Link>}
                </div>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default NavLink;
