import { Navigate, Route, Routes } from "react-router-dom";
import Tags from "./pages/tags/Tags";
import SideBar from "./components/Sidebar/SideBar";
import InputToSpeach from "./pages/InputToSpeach";
import Occasion from "./pages/occasions/Occasion";
import PictureUpload from "./pages/PictureUpload";
import Main from "./pages/userPage/Main/Main";
import Category from "./pages/category/Category";
import OccasionPage from "./pages/userPage/occassion";
import InputPage from "./pages/input";
import Users from "./pages/UserData/Users";
import UserCategory from "./pages/userCategory/UserCategory";
import CustomImage from "./pages/userPage/CustomeImage/CustomImage";
import UserDynamicPage from "./pages/userPage/UserDynamicPage/UserDynamicPage";
import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import ImageUploadPopup from "./components/ImageUploadPopup";
import axios from "axios";

const id = "230522";
export const baseURL = "http://localhost:9000";
// export const baseURL=  "http://18.210.180.208:9000"
function App() {
  axios.defaults.baseURL = baseURL;
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate replace to={"/users"} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          exact
          path="/login/:user_uuid/:img_url"
          element={<OccasionPage />}
        />
        {localStorage.getItem("user_uuid") ? (
          <>
            {localStorage.getItem("user_uuid") === id ? (
              <>
                <Route exact path="/home" element={<PictureUpload />} />
                <Route exact path="/occasion" element={<Occasion />} />
                <Route exact path="/customInput" element={<CustomImage />} />

                <Route exact path="/category" element={<Category />} />
                <Route exact path="/tags" element={<Tags />} />

                <Route exact path="/user_data" element={<Users />} />
                <Route exact path="/user_category" element={<UserCategory />} />
                <Route exact path="/tagInput" element={<InputPage />} />

                <Route path="*" element={<Navigate replace to="/home" />} />
                <Route
                  exact
                  path="/AdminOccasion/:occ_uuid"
                  element={<OccasionPage />}
                />
              </>
            ) : (
              <>
                {/* userRoutes */}

                <Route exact path="/tagInput" element={<InputPage />} />
                <Route exact path="/users" element={<Main />} />
                <Route
                  exact
                  path="/occasion/:occ_uuid"
                  element={<OccasionPage />}
                />
                <Route exact path="/customInput" element={<CustomImage />} />

                <Route exact path="/image" element={<ImageUploadPopup />} />
                <Route path="*" element={<Navigate replace to={"/users"} />} />
              </>
            )}
          </>
        ) : !window.location.pathname.includes("/login") ? (
          <Route path="*" element={<Navigate replace to={"/login"} />} />
        ) : (
          ""
        )}

      </Routes>
    </div>
  );
}

export default App;
