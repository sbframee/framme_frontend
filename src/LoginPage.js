import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    login_username: "",
  });
  const Navigate = useNavigate();
  const loginHandler = async () => {
    setIsLoading(true);

    if (userData.login_username === "230522") {
      localStorage.setItem("user_uuid", userData.login_username);
      setTimeout(() => window.location.assign("/home"), 2000);
      // window.location.reload();
    } else {
      const response = await axios({
        method: "post",
        url: `/users/getUser`,
        data: { user_uuid: userData.login_username },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        localStorage.setItem("user_uuid", response.data.result.user_uuid);
        localStorage.setItem(
          "user_category_uuid",
          JSON.stringify(response.data.result.user_category_uuid || [])
        );
        localStorage.setItem(
          "user_sub_category_uuid",
          JSON.stringify(response.data.result.user_sub_category_uuid || [])
        );
        window.location.assign("/users");
      }
      setIsLoading(false);
    }
  };

  return (
    <div
      id="login-container"
      onKeyDown={(e) => (e.key === "Enter" ? loginHandler() : "")}
    >
      {/* <div className="foodDoAdmin"><img src={foodDoAdmin} alt="" /></div> */}

      <div className="form">
        <h1>Sign In</h1>
        <div className="input-container">
          <label htmlFor="username" className="form-label">
            Id
          </label>
          <input
            type="username"
            className="form-input"
            name="username"
            id="username"
            value={userData.login_username}
            onChange={(e) =>
              setUserData((prev) => ({
                ...prev,
                login_username: e.target.value,
              }))
            }
            autoComplete="off"
            required
          />
        </div>

        {!isLoading ? (
          <button className="submit-btn" onClick={loginHandler}>
            Log In
          </button>
        ) : (
          <button className="submit-btn" id="loading-screen">
            <svg viewBox="0 0 100 100">
              <path
                d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                fill="#ffffff"
                stroke="none"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;1"
                  values="0 50 51;360 50 51"
                ></animateTransform>
              </path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
