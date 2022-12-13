import { Navigate, Route, Routes } from "react-router-dom";
import Tags from "./pages/tags/Tags";
import Occasion from "./pages/occasions/Occasion";
import PictureUpload from "./pages/PictureUpload";
import Main from "./pages/userPage/Main/Main";
import Category from "./pages/category/Category";
import OccasionPage from "./pages/userPage/occassion";
import InputPage from "./pages/input";
import Users from "./pages/UserData/Users";
import UserCategory from "./pages/userCategory/UserCategory";
import CustomImage from "./pages/userPage/CustomeImage/CustomImage";
import LoginPage from "./LoginPage";
import ImageUploadPopup from "./components/ImageUploadPopup";
import axios from "axios";
import WaBoot from "./pages/WaBoot";
import ShareImage from "./pages/userPage/occassion/ShareImage";
import AdminTagsInput from "./pages/input/AdminTagsInput";

const id = "230522";
// export const baseURL = "http://localhost:9000";
// export const baseURL=  "http://13.232.99.217:9000/"
export const baseURL = "https://api.framee.in/";
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
                <Route
                  exact
                  path="/login/new/:img_url"
                  element={<OccasionPage />}
                />
                <Route exact path="/home" element={<PictureUpload />} />
                <Route exact path="/occasion" element={<Occasion />} />
                <Route exact path="/waBoot" element={<WaBoot />} />
                <Route exact path="/customInput" element={<CustomImage />} />
                <Route exact path="/adminTagsInput" element={<AdminTagsInput />} />

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
        <Route exact path="/login/new/:img_url" element={<ShareImage />} />
      </Routes>
    </div>
  );
}

export default App;
