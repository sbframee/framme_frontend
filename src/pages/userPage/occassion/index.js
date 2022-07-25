import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NoImage from "../../../assets/noImage.jpg";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { FaWhatsapp } from "react-icons/fa";
import ShareIcon from "@mui/icons-material/Share";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
} from "react-icons/md";
import {
  HiOutlineArrowCircleRight,
  HiOutlineArrowCircleLeft,
} from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { TiArrowBack } from "react-icons/ti";
import "./index.css";
import axios from "axios";
import useWindowDimensions from "../../../components/useWidthDimenshion";
import { MdFileDownload } from "react-icons/md";
import { baseURL } from "../../../App";
const OccasionPage = () => {
  const [images, setImages] = useState([]);
  const [state, setState] = useState(false);
  const [baseImages, setBaseImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [occasion, setOccasion] = useState({});
  const [updateImageData, setUpdateImageData] = useState({});
  const [selectedImage, setSelectedImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(null);
  const [switchBtn, setSwitchBtn] = useState("");
  const [deleteHolders, setDeleteHolders] = useState([]);
  const [CopyPopup, setCopyPopup] = useState("");
  const [usersData, setUsersData] = useState([]);
  const params = useParams();
  const imageArea = useRef();
  const [selectedHolder, setSeletedHolder] = useState("");
  const navigate = useNavigate();
  const { width, height } = useWindowDimensions();
  const location = useLocation();
  const getUsersData = async () => {
    const response = await axios({ method: "get", url: "/users/getUsers" });
    console.log(response);
    if (response.data.success) setUsersData(response.data.result);
  };

  const updateImage = async (data) => {
    const response = await axios({
      method: "put",
      url: "/images/putImage",
      data,
    });
    // console.log(response)
    if (response.data.success) {
      getBaseImageData();
      setUpdateImageData({});
    }
  };
  console.log("images", images);
  const loginHandler = async () => {
    let data = { user_uuid: params.user_uuid };
    // console.log(data.user_name)
    const response = await axios({
      method: "post",
      url: `/users/getUser`,
      data,
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
      setState((prev) => !prev);
    }
  };
  const getImageData = async () => {
    const response = await axios({ method: "get", url: "/images/getImages" });
    // console.log(response)
    if (response.data.success) {
      setImages(response.data.result);
    }
  };
  const getBaseImageData = async () => {
    let user_category_uuid = localStorage.getItem("user_category_uuid");
    user_category_uuid = location.pathname.includes("AdminOccasion")
      ? []
      : user_category_uuid
      ? JSON.parse(user_category_uuid)
      : [];
    const response = await axios({
      method: "post",
      url: "/images/getBaseImages",
      data: { user_category_uuid },
    });
    console.log("baseImage", response);
    if (response.data.success) {
      setBaseImages(
        response.data.result
          .filter(
            (a) =>
              a.img_type === "B" &&
              a?.occ_uuid?.filter((b) => b.occ_uuid === occasion.occ_uuid)
                .length
          )
          .sort((a, b) => +a.sort_order - b.sort_order)
          .map((a, i) => ({
            ...a,
            sort_order: a.sort_order ? a.sort_order : i + 1,
          }))
          .map((a) => ({
            ...a,
            holder: a?.holder.map((b) => ({ ...b, index: 0 } || [])),
          }))
      );
      if (params.img_url)
        setSelectedImage(
          response.data.result.find((a) => a.img_url.includes(params.img_url))
        );
    }
  };

  const getTags = async () => {
    let data = localStorage.getItem("user_uuid");
    const response = await axios({
      method: "post",
      data: { user_uuid: data },
      url: "/tags/getUserTags",
    });
    console.log(response);
    if (response.data.success) setTags(response.data.result);
  };
  const getOccasionData = async (occ_uuid) => {
    const response = await axios({
      method: "get",
      url: "/occasions/getOccasion/" + occ_uuid,
    });
    // console.log(response)
    if (response.data.success) setOccasion(response.data.result);
  };
  // console.log(images.filter(a => a.img_type === "B" ))
  useEffect(() => {
    if (localStorage.getItem("user_uuid")) {
      getBaseImageData();
    }
  }, [occasion, state]);
  useEffect(() => {
    if (localStorage.getItem("user_uuid")) {
      getTags();
      getImageData();
      if (location.pathname.includes("AdminOccasion")) getUsersData();
    } else if (params.user_uuid) {
      loginHandler();
    }
  }, [state]);
  useEffect(() => {
    if (localStorage.getItem("user_uuid")) {
      setDeleteHolders([]);
      setSwitchBtn("");
    }
  }, [selectedImage, state]);
  useEffect(() => {
    if (localStorage.getItem("user_uuid")) {
      if (params.occ_uuid) getOccasionData(params.occ_uuid);
      else if (
        params.img_url &&
        selectedImage &&
        Object.keys(occasion).length === 0
      )
        getOccasionData(selectedImage.occ_uuid[0].occ_uuid);
    }
  }, [params, state, selectedImage]);
  const handlePng = () => {
    setSeletedHolder("");
    setSwitchBtn("");
    htmlToImage
      .toPng(document.getElementById("my-img"))
      .then(function (dataUrl) {
        console.log(dataUrl);
        download(dataUrl, "text-img.png");
      });
  };
  const deleteHandler = async () => {
    const response = await axios({
      method: "delete",
      data: deleteImage,
      url: "/images/deleteImages",
    });
    console.log(response);
    if (response.data.success) getImageData();
  };

  console.log(occasion);
  return localStorage.getItem("user_uuid") ? (
    selectedImage ? (
      <>
        <div className="container">
          <div className="navbar" style={{ justifyContent: "space-between" }}>
            <TiArrowBack
              className="backArrow"
              onClick={() => {
                if (params.img_url) navigate(`/occasion/${occasion?.occ_uuid}`);
                setSelectedImage(false);
              }}
              style={{ color: "#fff" }}
            />
          </div>
          <div className="display_image_container">
            <div
              id="my-img"
              className="DisplayImg"
              style={{
                width:
                  (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                    selectedImage?.coordinates[0]?.a?.split(",")[0] <
                  width
                    ? selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0]
                    : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.5 <
                      width
                    ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                      1.5
                    : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        2 <
                      width
                    ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                      2
                    : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                      2.5) + "px",
                height:
                  (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                    selectedImage?.coordinates[0]?.a?.split(",")[0] <
                  width
                    ? selectedImage?.coordinates[0]?.d?.split(",")[1] -
                      selectedImage?.coordinates[0]?.a?.split(",")[1]
                    : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.5 <
                      width
                    ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                        selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                      1.5
                    : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        2 <
                      width
                    ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                        selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                      2
                    : (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                        selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                      2.5) + "px",
                maxHeight: "100%",
                backgroundColor: "#000",
              }}
            >
              {console.log(baseURL + "/" + selectedImage?.img_url)}
              <img
                src={`${baseURL + "/" + selectedImage?.img_url}`}
                style={{
                  width: "100%",
                  // height: "100%",
                  position: "absolute",
                  pointerEvents: "none",
                  borderRadius: "20px",
                }}
                ref={imageArea}
                alt=""
              />

              {selectedImage.holder
                ?.filter((a) => {
                  let value = deleteHolders?.filter((b) => a?._id === b?._id)
                    ?.length
                    ? false
                    : true;

                  return value;
                })
                ?.map((item) => {
                  let url = tags.find((a) => a.tag_uuid === item.label_uuid);

                  let coordinates = item.a.split(",");
                  coordinates[0] =
                    selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0] <
                    width
                      ? coordinates[0]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.5 <
                        width
                      ? coordinates[0] / 1.5
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          2 <
                        width
                      ? coordinates[0] / 2
                      : coordinates[0] / 2.5;

                  coordinates[1] =
                    selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0] <
                    width
                      ? coordinates[1]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.5 <
                        width
                      ? coordinates[1] / 1.5
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          2 <
                        width
                      ? coordinates[1] / 2
                      : coordinates[1] / 2.5;

                  let width1 =
                    selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0] <
                    width
                      ? item.b.split(",")[0] - coordinates[0]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.5 <
                        width
                      ? item.b.split(",")[0] / 1.5 - coordinates[0]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          2 <
                        width
                      ? item.b.split(",")[0] / 2 - coordinates[0]
                      : item.b.split(",")[0] / 2.5 - coordinates[0];

                  let height =
                    selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0] <
                    width
                      ? item.d.split(",")[1] - coordinates[1]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.5 <
                        width
                      ? item.d.split(",")[1] / 1.5 - coordinates[1]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          2 <
                        width
                      ? item.d.split(",")[1] / 2 - coordinates[1]
                      : item.d.split(",")[1] / 2.5 - coordinates[1];

                  if (url?.tag_type === "I") {
                    if (width > 1000)
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          setSwitchBtn={setSwitchBtn}
                          setSeletedHolder={setSeletedHolder}
                          selectedHolder={selectedHolder}
                          item={item}
                          url={url}
                          type="I"
                          coordinates={coordinates}
                          width={width1}
                          height={height}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                    else
                      return (
                        <TagMobile
                          switchBtn={switchBtn}
                          setSwitchBtn={setSwitchBtn}
                          setSeletedHolder={setSeletedHolder}
                          selectedHolder={selectedHolder}
                          item={item}
                          url={url}
                          type="I"
                          coordinates={coordinates}
                          width={width1}
                          height={height}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                  } else if (url?.tag_type === "T") {
                    if (width > 1000)
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          setSwitchBtn={setSwitchBtn}
                          setSeletedHolder={setSeletedHolder}
                          selectedHolder={selectedHolder}
                          item={item}
                          type="T"
                          coordinates={coordinates}
                          width={width1}
                          height={height}
                          url={url}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                    else
                      return (
                        <TagMobile
                          switchBtn={switchBtn}
                          setSwitchBtn={setSwitchBtn}
                          setSeletedHolder={setSeletedHolder}
                          selectedHolder={selectedHolder}
                          item={item}
                          type="T"
                          coordinates={coordinates}
                          width={width1}
                          height={height}
                          url={url}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                  }
                })}
            </div>
          </div>
          <div className="container_buttons">
            <button
              onClick={() =>
                setSelectedImage(
                  baseImages?.find((a) => {
                    let b =
                      selectedImage?.sort_order - 1
                        ? selectedImage?.sort_order - 1
                        : baseImages?.length;
                    return a?.sort_order === b;
                  }) || selectedImage
                )
              }
              style={{
                cursor: "pointer",
                fontSize: "35px",
                color: "#fff",
                borderRadius: "30px",
                backgroundColor: "transparent",
                border: "none",
              }}
            >
              <HiOutlineArrowCircleLeft />
            </button>
            <button className="image_btn">Mirror</button>
            <button
              className="image_btn"
              onClick={() =>
                setSelectedImage({
                  ...selectedImage,
                  holder: selectedImage.holder.map((b) =>
                    b._id === selectedHolder._id
                      ? { ...b, index: b.index + 1 }
                      : b
                  ),
                })
              }
            >
              Swap
            </button>
            <button
              className="image_btn"
              onClick={() =>
                setDeleteHolders((prev) => [
                  ...prev,
                  selectedImage.holder.find(
                    (a) => a._id === selectedHolder._id
                  ),
                ])
              }
            >
              Delete
            </button>
            {/* <button
           className="image_btn"
          >
            Share
          </button> */}
            <button
              onClick={() =>
                setSelectedImage(
                  baseImages?.find((a) => {
                    let b =
                      selectedImage?.sort_order + 1 < baseImages?.length
                        ? selectedImage?.sort_order + 1
                        : 0;
                    return a?.sort_order === b;
                  }) || selectedImage
                )
              }
              style={{
                cursor: "pointer",
                fontSize: "35px",
                color: "#fff",
                borderRadius: "30px",
                backgroundColor: "transparent",
                border: "none",
              }}
            >
              <HiOutlineArrowCircleRight />
            </button>
          </div>
          <div className="downloadBtnBackground">
            <ShareIcon style={{ fontSize: "20px", marginRight: "20px" }} />
            <MdFileDownload
              className="backArrow"
              onClick={() => handlePng()}
              style={{ fontSize: "20px" }}
            />
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="userOccasion">
          <div className="navbar">
            <TiArrowBack
              className="backArrow"
              onClick={() => navigate("/users")}
              style={{ color: "#fff" }}
            />
            <div className="h1">{occasion?.title || "-"}</div>
          </div>
          {occasion?.posters?.length ? (
            <div className="slide-container">
              <Slide
                indicators={(index) => (
                  <div className="indicator">{index + 1}</div>
                )}
              >
                {occasion?.posters?.map((slideImage, index) => (
                  <div className="each-slide" key={index}>
                    <div
                      style={{
                        backgroundImage: `url(${baseURL + slideImage.url})`,
                        width: "100%",
                        height: "200px",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                      }}
                    ></div>
                  </div>
                ))}
              </Slide>
            </div>
          ) : (
            ""
          )}
          <div className="occasion_container">
            {baseImages
              .sort((a, b) => +a.sort_order - b.sort_order)
              .map((imgItem, index) => (
                <div className="image_container">
                  <img
                    onClick={() => setSelectedImage(imgItem)}
                    src={
                      imgItem.img_url.replace("images", "thumbnail")
                        ? baseURL +
                          imgItem.img_url.replace("images", "thumbnail")
                        : NoImage
                    }
                    alt=""
                  />
                  {location.pathname.includes("AdminOccasion") ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setDeleteImage(imgItem)}
                        className="deleteBtn"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setCopyPopup(imgItem)}
                        className="deleteBtn copybtn"
                      >
                        Copy
                      </button>
                      <div className="updateContainer">
                        <input
                          style={{ width: "30px" }}
                          placeholder={imgItem.sort_order || index + 1}
                          onChange={(e) =>
                            setUpdateImageData({
                              ...imgItem,
                              sort_order: e.target.value,
                            })
                          }
                        />
                        {updateImageData?._id === imgItem?._id ? (
                          <button
                            type="button"
                            onClick={() => updateImage(updateImageData)}
                            className="updateButton"
                          >
                            Update
                          </button>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
          </div>
        </div>
        {deleteImage ? (
          <Popup
            close={() => setDeleteImage(null)}
            type="delete"
            deleteHandler={deleteHandler}
          />
        ) : (
          ""
        )}
        {CopyPopup ? (
          <Popup
            close={() => setCopyPopup(null)}
            item={CopyPopup}
            type="copy"
            usersData={usersData}
          />
        ) : (
          ""
        )}
      </>
    )
  ) : (
    <div />
  );
};

export default OccasionPage;
const Popup = ({ close, deleteHandler, type, usersData, item }) => {
  const [btnName, setBtnName] = useState("Copy");
  const [user, setUser] = useState("");
  const submitHandler = async () => {
    deleteHandler();
    close();
  };
  useEffect(
    user
      ? () => {
          var input = document.getElementById("myTextInput");
          input.focus();
          input.select();
        }
      : () => {},
    [user]
  );
  return (
    <div className="popup_bg">
      <div className="popup">
        <div className="popup_header">
          <h3></h3>
          <AiOutlineClose
            style={{ width: "20px", cursor: "pointer" }}
            onClick={close}
          />
        </div>
        {type === "delete" ? (
          <div className="popup_body">
            <h2>Delete Image?</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <button
                onClick={close}
                type="button"
                className="inputButton"
                style={{ position: "static" }}
              >
                No
              </button>
              <button
                onClick={submitHandler}
                type="button"
                className="inputButton"
                style={{ position: "static" }}
              >
                Yes
              </button>
            </div>
          </div>
        ) : (
          <div className="popup_body">
            <h2>Copy Image Url For</h2>

            <select
              className="label_popup_input"
              style={{ width: "200px" }}
              value={user}
              onChange={(e) => setUser(e.target.value)}
            >
              {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
              <option value="">None</option>
              {usersData.map((cat) => (
                <option value={cat.user_uuid}>{cat.user_name}</option>
              ))}
            </select>
            <div>
              {user ? (
                <textarea
                  id="myTextInput"
                  value={
                    "http://localhost:3000" +
                    `/login/${user}/${item.img_url
                      .replace("thumbnail/", "")
                      .replace("/images/", "")}`
                  }
                  rows={7}
                  style={{ width: "fit-content", height: "fit-content" }}
                />
              ) : (
                ""
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                position: "relative",
              }}
            >
              {user ? (
                <FaWhatsapp
                  style={{
                    position: "absolute",
                    left: "20px",
                    fontSize: "25px",
                    top: "10px",
                    color: "green",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.open(
                      `https://api.whatsapp.com/send/?phone=91${
                        usersData.find((a) => a.user_uuid === user)?.user_name
                      }&text=${
                        "http://localhost:3000" +
                        `/login/${user}/${item.img_url.replace("/images/", "")}`
                      }`,
                      "_blank"
                    )
                  }
                />
              ) : (
                ""
              )}
              <button
                onClick={() => {
                  if (user) {
                    // console.log(user,item.img_url.replace("/images/",""),navigator.clipboard.writeText)
                    let copy =
                      "http://localhost:3000" +
                      `/login/${user}/${item.img_url.replace("/images/", "").replace("/thumbnail/", "")}`;
                    navigator.clipboard
                      .writeText(copy)
                      .then(() => {
                        setBtnName("Copied!");
                        setTimeout(close, 2000);
                        console.log("successfully copied");
                      })
                      .catch(() => {
                        setBtnName("Not Copied!");
                        console.log("something went wrong");
                      });
                    // navigator?.clipboard?.writeText(`http://44.202.77.101:3000/login/${user}/${item.img_url.replace("/images/","")}`);
                  }
                }}
                type="button"
                className="inputButton"
                style={{ position: "static" }}
              >
                {btnName}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const Tag = ({
  url,
  type,
  coordinates,
  width,
  height,
  deleteHandler,
  switchBtn,
  item,
  selectedHolder,
  setSeletedHolder,
  setSwitchBtn,
}) => {
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);
  const sizeRef = useRef(null);
  const heightWeight = useWindowDimensions();
  useEffect(() => {
    const resizeableEle = ref.current;
    const styles = window.getComputedStyle(resizeableEle);
    let width = parseInt(styles.width, 10);
    let height = parseInt(styles.height, 10);
    let x = 0;
    let y = 0;

    resizeableEle.style.top = styles.top;
    resizeableEle.style.left = styles.left;
    // Right resize
    const onMouseMoveRightResize = (event) => {
      const dx = event.clientX - x;
      x = event.clientX;
      width = width + dx;
      resizeableEle.style.width = `${width}px`;
      resizeableEle.style.fontSize = width / 100 + "rem";
    };

    const onMouseUpRightResize = (event) => {
      document.removeEventListener("mousemove", onMouseMoveRightResize);
    };

    const onMouseDownRightResize = (event) => {
      x = event.clientX;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.right = null;
      document.addEventListener("mousemove", onMouseMoveRightResize);
      document.addEventListener("mouseup", onMouseUpRightResize);
    };

    // Top resize
    const onMouseMoveTopResize = (event) => {
      const dy = event.clientY - y;
      height = height - dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpTopResize = (event) => {
      document.removeEventListener("mousemove", onMouseMoveTopResize);
    };

    const onMouseDownTopResize = (event) => {
      y = event.clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.bottom = styles.bottom;
      resizeableEle.style.top = null;
      document.addEventListener("mousemove", onMouseMoveTopResize);
      document.addEventListener("mouseup", onMouseUpTopResize);
    };

    // Bottom resize
    const onMouseMoveBottomResize = (event) => {
      const dy = event.clientY - y;
      height = height + dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpBottomResize = (event) => {
      document.removeEventListener("mousemove", onMouseMoveBottomResize);
    };

    const onMouseDownBottomResize = (event) => {
      y = event.clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = null;
      document.addEventListener("mousemove", onMouseMoveBottomResize);
      document.addEventListener("mouseup", onMouseUpBottomResize);
    };

    // Left resize
    const onMouseMoveLeftResize = (event) => {
      const dx = event.clientX - x;
      x = event.clientX;
      width = width - dx;
      resizeableEle.style.width = `${width}px`;
      resizeableEle.style.fontSize = width / 100 + "rem";
    };

    const onMouseUpLeftResize = (event) => {
      document.removeEventListener("mousemove", onMouseMoveLeftResize);
    };

    const onMouseDownLeftResize = (event) => {
      x = event.clientX;
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = null;
      document.addEventListener("mousemove", onMouseMoveLeftResize);
      document.addEventListener("mouseup", onMouseUpLeftResize);
    };
    const onMouseSelect = (event) => {
      const { clientX, clientY } = event;
      resizeableEle.style.top = clientY - 100 + "px";
      resizeableEle.style.left =
        heightWeight.width >= 1000
          ? clientX - heightWeight.width / 4 + "px"
          : clientX - 100 + "px";
      document.addEventListener("mousemove", onMouseSelectResize);
      document.addEventListener("mouseup", onMouseUpSelectResize);
    };
    const onMouseSelectResize = (event) => {
      const dx = event.clientX - x;
      x = event.clientX;
      width = width - dx;
      const dy = event.clientY - y;
      height = height + dy;
      y = event.clientY;
      resizeableEle.style.top = y - 100 + "px";
      resizeableEle.style.left =
        heightWeight.width >= 1000
          ? x - heightWeight.width / 4 + "px"
          : x - 100 + "px";
    };

    const onMouseUpSelectResize = (event) => {
      document.removeEventListener("mousemove", onMouseSelectResize);
    };

    // Add mouse down event listener

    if (selectedHolder?._id === item?._id) {
      const resizerRight = refRight.current;
      resizerRight.addEventListener("mousedown", onMouseDownRightResize);
      const resizerTop = refTop.current;
      resizerTop.addEventListener("mousedown", onMouseDownTopResize);
      const resizerBottom = refBottom.current;
      resizerBottom.addEventListener("mousedown", onMouseDownBottomResize);
      const resizerLeft = refLeft.current;
      resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);
      const reposition = sizeRef.current;
      reposition.addEventListener("mousedown", onMouseSelect);
      return () => {
        resizerRight.removeEventListener("mousedown", onMouseDownRightResize);
        resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
        resizerBottom.removeEventListener("mousedown", onMouseDownBottomResize);
        resizerLeft.removeEventListener("mousedown", onMouseDownLeftResize);
        reposition.removeEventListener("mousedown", onMouseSelect);
      };
    }
  }, [switchBtn, selectedHolder]);
  console.log(
    "selectedHolder",
    selectedHolder,
    item,
    selectedHolder?._id === item._id
  );
  return (
    <div
      ref={ref}
      className="resizeable"
      style={{
        cursor: "pointer",
        left: coordinates[0] + "px",
        top: coordinates[1] + "px",
        width: width + "px",
        height: height + "px",
        position: "absolute",
      }}
    >
      <div
        ref={sizeRef}
        className="holders img"
        onClick={
          switchBtn === "delete"
            ? deleteHandler
            : (e) => {
                e.stopPropagation();
                setSwitchBtn("position");
                setSeletedHolder(item);
              }
        }
        style={{
          border:
            selectedHolder?._id === item?._id ? "2px solid black" : "none",
          width: "100%",
          height: "100%",
        }}
      >
        {type === "T" &&
        url?.text?.sort((a, b) => +a.sort_order - +b.sort_order)[
          item.index % url?.text?.length
        ]?.text ? (
          <div
            className="holders"
            style={{
              border:
                selectedHolder?._id === item?._id ? "2px solid black" : "none",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              textAlign: "center",
              color: item?.text_color || "#000",
            }}
          >
            {
              url?.text.sort((a, b) => +a.sort_order - +b.sort_order)[
                item.index % url?.text?.length
              ].text
            }
          </div>
        ) : baseURL +
          url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)[
            item.index % url?.img_url?.length
          ]?.img_url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={
              baseURL +
              url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)[
                item.index % url?.img_url?.length
              ]?.img_url
            }
            className="holders"
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            alt=""
          />
        ) : (
          <></>
        )}
      </div>
      <div
        ref={refLeft}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-l"
      >
        <MdKeyboardArrowLeft style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refTop}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-t"
      >
        <MdKeyboardArrowUp style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refRight}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-r"
      >
        <MdKeyboardArrowRight style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refBottom}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-b"
      >
        <MdKeyboardArrowDown style={{ fontSize: "30px" }} />
      </div>
    </div>
  );
};

const TagMobile = ({
  url,
  type,
  coordinates,
  width,
  height,
  deleteHandler,
  switchBtn,
  item,
  selectedHolder,
  setSeletedHolder,
  setSwitchBtn,
}) => {
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);
  const heightWidth = useWindowDimensions();
  const sizeRef = useRef(null);
  useEffect(() => {
    const resizeableEle = ref.current;
    const styles = window.getComputedStyle(resizeableEle);
    let width = parseInt(styles.width, 10);
    let height = parseInt(styles.height, 10);
    let x = 0;
    let y = 0;

    resizeableEle.style.top = styles.top;
    resizeableEle.style.left = styles.left;
    // Right resize
    const onMouseMoveRightResize = (event) => {
      const dx = event.changedTouches[0].clientX - x;
      x = event.changedTouches[0].clientX;
      width = width + dx;
      resizeableEle.style.width = `${width}px`;
      resizeableEle.style.fontSize = width / 100 + "rem";
    };

    const onMouseUpRightResize = (event) => {
      document.removeEventListener("touchmove", onMouseMoveRightResize);
    };

    const onMouseDownRightResize = (event) => {
      x = event.changedTouches[0].clientX;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.right = null;
      document.addEventListener("touchmove", onMouseMoveRightResize);
      document.addEventListener("touchend", onMouseUpRightResize);
    };

    // Top resize
    const onMouseMoveTopResize = (event) => {
      const dy = event.changedTouches[0].clientY - y;
      height = height - dy;
      y = event.changedTouches[0].clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpTopResize = (event) => {
      document.removeEventListener("touchmove", onMouseMoveTopResize);
    };

    const onMouseDownTopResize = (event) => {
      y = event.changedTouches[0].clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.bottom = styles.bottom;
      resizeableEle.style.top = null;
      document.addEventListener("touchmove", onMouseMoveTopResize);
      document.addEventListener("touchend", onMouseUpTopResize);
    };

    // Bottom resize
    const onMouseMoveBottomResize = (event) => {
      const dy = event.changedTouches[0].clientY - y;
      height = height + dy;
      y = event.changedTouches[0].clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpBottomResize = (event) => {
      document.removeEventListener("touchmove", onMouseMoveBottomResize);
    };

    const onMouseDownBottomResize = (event) => {
      y = event.changedTouches[0].clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = null;
      document.addEventListener("touchmove", onMouseMoveBottomResize);
      document.addEventListener("touchend", onMouseUpBottomResize);
    };

    // Left resize
    const onMouseMoveLeftResize = (event) => {
      const dx = event.changedTouches[0].clientX - x;
      x = event.changedTouches[0].clientX;
      width = width - dx;
      resizeableEle.style.width = `${width}px`;
      resizeableEle.style.fontSize = width / 100 + "rem";
    };

    const onMouseUpLeftResize = (event) => {
      document.removeEventListener("touchmove", onMouseMoveLeftResize);
    };

    const onMouseDownLeftResize = (event) => {
      x = event.changedTouches[0].clientX;
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = null;
      document.addEventListener("touchmove", onMouseMoveLeftResize);
      document.addEventListener("touchend", onMouseUpLeftResize);
    };
    const onMouseSelect = (event) => {
      console.log(event);
      const { clientX, clientY } = event.changedTouches[0];
      resizeableEle.style.top = clientY - 100 + "px";
      resizeableEle.style.left =
        heightWidth.width >= 1000
          ? clientX - heightWidth.width / 4 + "px"
          : clientX - 100 + "px";
      document.addEventListener("touchmove", onMouseSelectResize);
      document.addEventListener("touchend", onMouseUpSelectResize);
    };
    const onMouseSelectResize = (event) => {
      const dx = event.changedTouches[0].clientX - x;
      x = event.changedTouches[0].clientX;
      width = width - dx;
      const dy = event.changedTouches[0].clientY - y;
      height = height + dy;
      y = event.changedTouches[0].clientY;
      resizeableEle.style.top = y - 100 + "px";
      resizeableEle.style.left =
        heightWidth.width >= 1000
          ? x - heightWidth.width / 4 + "px"
          : x - 100 + "px";
    };

    const onMouseUpSelectResize = (event) => {
      document.removeEventListener("touchmove", onMouseSelectResize);
    };

    // Add mouse down event listener

    if (selectedHolder?._id === item?._id) {
      const resizerRight = refRight.current;
      resizerRight.addEventListener("touchstart", onMouseDownRightResize);
      const resizerTop = refTop.current;
      resizerTop.addEventListener("touchstart", onMouseDownTopResize);
      const resizerBottom = refBottom.current;
      resizerBottom.addEventListener("touchstart", onMouseDownBottomResize);
      const resizerLeft = refLeft.current;
      resizerLeft.addEventListener("touchstart", onMouseDownLeftResize);
      const reposition = sizeRef.current;
      reposition.addEventListener("touchstart", onMouseSelect);
      return () => {
        resizerRight.removeEventListener("touchstart", onMouseDownRightResize);
        resizerTop.removeEventListener("touchstart", onMouseDownTopResize);
        resizerBottom.removeEventListener(
          "touchstart",
          onMouseDownBottomResize
        );
        resizerLeft.removeEventListener("touchstart", onMouseDownLeftResize);
        reposition.removeEventListener("touchstart", onMouseSelect);
      };
    }
  }, [switchBtn, selectedHolder]);

  return (
    <div
      ref={ref}
      className="resizeable"
      style={{
        cursor: "pointer",
        left: coordinates[0] + "px",
        top: coordinates[1] + "px",
        width: width + "px",
        height: height + "px",
        position: "absolute",
      }}
      onTouchEnd={() => setSwitchBtn("resize")}
    >
      <div
        ref={sizeRef}
        className="holders img"
        onMouseLeave={() => setSwitchBtn("resize")}
        onClick={
          switchBtn === "delete"
            ? deleteHandler
            : (e) => {
                e.stopPropagation();
                setSwitchBtn("position");
                setSeletedHolder(item);
              }
        }
        style={{
          border:
            selectedHolder?._id === item?._id ? "2px solid black" : "none",
          width: "100%",
          height: "100%",
        }}
      >
        {type === "T" &&
        url?.text?.sort((a, b) => +a.sort_order - +b.sort_order)[
          item.index % url?.text?.length
        ]?.text ? (
          <div
            className="holders"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              textAlign: "center",
              color: item?.text_color || "#000",
            }}
          >
            {
              url?.text.sort((a, b) => +a.sort_order - +b.sort_order)[
                item.index % url?.text?.length
              ].text
            }
          </div>
        ) : baseURL +
          url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)[
            item.index % url?.img_url?.length
          ]?.img_url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={
              baseURL +
              url.img_url.sort((a, b) => +a.sort_order - +b.sort_order)[
                item.index % url?.img_url?.length
              ]?.img_url
            }
            className="holders"
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            alt=""
          />
        ) : (
          <></>
        )}
      </div>
      <div
        ref={refLeft}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-l"
      >
        <MdKeyboardArrowLeft style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refTop}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-t"
      >
        <MdKeyboardArrowUp style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refRight}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-r"
      >
        <MdKeyboardArrowRight style={{ fontSize: "30px" }} />
      </div>
      <div
        ref={refBottom}
        onClick={(e) => {
          e.stopPropagation();
          setSwitchBtn("resize");
        }}
        style={
          selectedHolder?._id === item?._id
            ? { display: "flex" }
            : { display: "none" }
        }
        className="resizer resizer-b"
      >
        <MdKeyboardArrowDown style={{ fontSize: "30px" }} />
      </div>
    </div>
  );
};
