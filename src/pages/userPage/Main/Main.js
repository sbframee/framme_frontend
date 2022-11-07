import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import Carousel from "carousel-react-rcdev";
import PersonIcon from "@mui/icons-material/Person";
import NavigationBar from "../../../components/usersComponent/NavigationBar";
import Sliders from "../../../components/Sliders";
import "react-slideshow-image/dist/styles.css";
const Main = () => {
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [user, setUser] = useState({});
  const [posters, setPosters] = useState(false);
  const getImageData = async () => {
    const response = await axios({ method: "get", url: "/posters/getPoster" });
    // console.log(response)
    if (response.data.success) {
      setPosters(response.data.result);
    }
  };
  const navigate = useNavigate();
  const getOccasionData = async () => {
    let user_category_uuid = localStorage.getItem("user_category_uuid") || [];
    let user_sub_category_uuid =
      localStorage.getItem("user_sub_category_uuid") || [];
    const response = await axios({
      method: "post",
      data: { user_category_uuid, user_sub_category_uuid },
      url: "/occasions/getOccasionsUser",
    });
    console.log(response);
    if (response.data.success) setOccasions(response.data.result);
  };
  const getUser = async (user_uuid) => {
    // console.log(data.user_name)
    const response = await axios({
      method: "post",
      url: `/users/getUser`,
      data: { user_uuid },
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
      setUser(response.data.result);
    }
  };
  useEffect(() => {
    let user_uuid = localStorage.getItem("user_uuid");

    getUser(user_uuid);
  }, []);

  useEffect(() => {
    if (user?.user_name) {
      getOccasionData();
      getImageData();
    }
  }, [user]);
  const getCategoriesData = async (occasionData) => {
    const response = await axios({
      method: "get",
      url: "/categories/getCategories",
    });
    console.log(response);
    if (response.data.success)
      setCategories(
        response.data.result.filter(
          (a) =>
            occasionData.filter(
              (b) => b.cat_uuid?.filter((c) => c === a.cat_uuid)?.length
            )?.length
        )
      );
  };
  useEffect(() => {
    if (user?.user_name) getCategoriesData(occasions);
  }, [occasions, user]);
  const getDayName = (dateStr, locale, type) => {
    var date = new Date(dateStr);
    if (type === "month") return date.toLocaleString(locale, { month: "long" });
    return date.toLocaleDateString(locale, { weekday: "long" });
  };
  return (
    <>
      <div className="main">
        <div className="navbar">
          <div className="h1" style={{ width: "100%", textAlign: "right" }}>
            {user?.user_title || "Test"}
          </div>
        </div>
        <div className="slide-container">
          {posters.length ? <Sliders item={posters} /> : ""}
        </div>

        {categories

          .sort((a, b) => +a.sort_order - +b.sort_order)
          .map((item, index) => (
            <div
              className="occasion_container"
              style={index===0? { marginTop: "40px" } :
                index + 1 === categories?.length ? { marginBottom: "100px" } : {}
              }
              key={Math.random()}
            >
              <div className="cat_title">{item.title}</div>
              <div style={{ width: "100vw", overflowX: "scroll" }}>
                <div className="images_container">
                  {occasions
                    ?.sort((a, b) => +a.sort_order - +b.sort_order)
                    .filter(
                      (a) =>
                        a.cat_uuid?.filter((b) => b === item.cat_uuid)?.length
                    )
                    .map((imgItem) => (
                      <div
                        className="image_container"
                        onClick={() =>
                          navigate(`/occasion/${imgItem.occ_uuid}`)
                        }
                      >
                        <img
                          src={imgItem.thumbnail_url}
                          alt=""
                          style={
                            item?.square
                              ? {
                                  borderRadius: "10px",
                                  width: "120px",
                                  height: "120px",
                                  marginRight:"20px"
                                }
                              : {}
                          }
                        />

                        <div className="occ_title">{imgItem.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div style={{ width: "100vw", position: "fixed", bottom: "0" }}>
        <NavigationBar />
      </div>
      {/* 
      <button
        type="button"
        className="customButtons"
        
      >
        Custom Images
      </button> */}
      {/* {popup ? <Popup close={() => setPopup(false)} setUser={setUser} /> : ""} */}
    </>
  );
};

export default Main;
// const Popup = ({ close, setUser }) => {
//   const [data, setData] = useState({});
//   useEffect(() => {
//     let user_uuid = localStorage.getItem("user_uuid");

//     if (user_uuid) close();
//   }, []);
//   const submitHandler = async () => {
//     if (data.user_name === "") return;
//     // console.log(data.user_name)
//     const response = await axios({
//       method: "post",
//       url: `/users/getUser`,
//       data,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     if (response.data.success) {
//       localStorage.setItem("user_uuid", response.data.result.user_uuid);
//       localStorage.setItem(
//         "user_category_uuid",
//         JSON.stringify(response.data.result.user_category_uuid || [])
//       );

//       localStorage.setItem(
//         "user_sub_category_uuid",
//         JSON.stringify(response.data.result.user_sub_category_uuid || [])
//       );
//       setUser(response.data.result);
//       close();
//     }
//   };
//   return (
//     <div className="popup_bg">
//       <div className="popup">
//         <div className="popup_header">
//           <h3>Login</h3>
//         </div>
//         <div className="popup_body">
//           <div>
//             Title
//             <input
//               placeholder="Title"
//               value={data.title}
//               onChange={(e) => setData({ ...data, user_name: e.target.value })}
//             />
//           </div>
//           <button
//             onClick={submitHandler}
//             type="button"
//             className="inputButton"
//             style={{ position: "sticky" }}
//           >
//             Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
