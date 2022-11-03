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

import "./index.css";
import axios from "axios";
import useWindowDimensions from "../../../components/useWidthDimenshion";
import { MdFileDownload } from "react-icons/md";
import { Home, Image } from "@mui/icons-material";

const ShareImage = () => {
  const [tags, setTags] = useState([]);
  const [selectedImage, setSelectedImage] = useState(false);
  const [mirrorRevert, setMirrorevert] = useState([]);
  const [baseImage, setBaseImage] = useState();
  const [switchBtn, setSwitchBtn] = useState("");
  const [deleteHolders, setDeleteHolders] = useState([]);
  const [mobilePopup, setMobilePopup] = useState(false);
  const [mobile, setMobile] = useState("");
  const [login, setLogin] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  const imageArea = useRef();
  const ref = useRef();
  const [selectedHolder, setSeletedHolder] = useState("");
  const [holdersImges, setHoldersImges] = useState([]);

  const { width } = useWindowDimensions();
  useEffect(() => {
    if (selectedImage?.img_url) {
      axios({
        method: "get",
        url: selectedImage?.img_url,
        responseType: "blob",
      }).then(function (response) {
        var reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = function () {
          var base64data = reader.result;
          console.log(base64data);
          setBaseImage(base64data);
        };
      });
    }
  }, [selectedImage]);
  const getBaseImageData = async () => {
    if (params.img_url) {
      const response = await axios({
        method: "get",
        url: "/images/getBaseImages/" + params.img_url,
      });
      if (response.data.success) {
        setSelectedImage(response.data.result);
      }
    }
  };

  const getTags = async () => {
    let data = localStorage.getItem("user_uuid");
    const response = await axios({
      method: "post",
      data: { user_uuid: data },
      url: "/tags/getUserTags",
    });
    // console.log(response);
    if (response.data.success) setTags(response.data.result);
  };

  // console.log(images.filter(a => a.img_type === "B" ))
  useEffect(() => {
    getBaseImageData();
  }, []);
  useEffect(() => {
    getTags();
  }, []);
  useEffect(() => {
    setDeleteHolders([]);
    setSwitchBtn("");
  }, [selectedImage]);
  const loginHandler = async () => {
    if (mobile?.length < 10) return;
    let data = { user_name: mobile };
    // console.log(data.user_name)
    const response = await axios({
      method: "post",
      url: `/users/varifyUser`,
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

      for (let data of holdersImges) {
        console.log("------------------", data);
        // let formData = new FormData();
        // formData.append("value", JSON.stringify(data));
        // formData.append("images", data.image);
        const mainThumbnailURL = await axios({
          url: "/s3Url",
          method: "get",
        });
        let UploadThumbnailURL = mainThumbnailURL.data.url;

        axios({
          url: UploadThumbnailURL,
          method: "put",
          headers: { "Content-Type": "multipart/form-data" },
          data: data.image,
        })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err));
        let img_url = UploadThumbnailURL.split("?")[0];
        // bodyFormData.append("image", fileData);
        // bodyFormData.append("thumbnail", thumbnailData);
        data = { ...data, img_url, user: [response.data.result.user_uuid] };
        let result = await axios({
          method: "post",
          url: "/tags/tagImages",
          data: data,
        });
        console.log(result);
      }

      handlePng();
    }
  };
  const handlePng = () => {
    setSeletedHolder("");
    setSwitchBtn("");

    htmlToImage.toPng(ref.current).then(function (dataUrl) {
      //   console.log(dataUrl);
      download(dataUrl, "text-img.png");
      setLogin(true);
    });
  };

  // console.log(occasion);
  return (
    <div className="container">
      {login ? (
        <div className="navbar" style={{ justifyContent: "space-between" }}>
          <Home
            className="backArrow"
            onClick={() => {
              if (params.img_url) navigate("/users");
            }}
            style={{ color: "#fff", marginLeft: "20px" }}
          />
        </div>
      ) : (
        ""
      )}
      <div className="display_image_container">
        {selectedImage.img_url ? (
          <div
            ref={ref}
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
            <img
              src={baseImage}
              alt={NoImage}
              style={{
                width: "100%",
                // height: "100%",
                position: "absolute",
                pointerEvents: "none",
                borderRadius: "20px",
                // transform: mirrorRevert ? "scaleX(-1)" : "scaleX(1)",
              }}
              ref={imageArea}
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
                        setHoldersImges={setHoldersImges}
                        setSwitchBtn={setSwitchBtn}
                        setSeletedHolder={setSeletedHolder}
                        selectedHolder={selectedHolder}
                        item={item}
                        url={url}
                        type="I"
                        coordinates={coordinates}
                        width={width1}
                        height={height}
                        mirrorRevert={mirrorRevert}
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
                        setHoldersImges={setHoldersImges}
                        setSeletedHolder={setSeletedHolder}
                        selectedHolder={selectedHolder}
                        item={item}
                        url={url}
                        mirrorRevert={mirrorRevert}
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
                        setHoldersImges={setHoldersImges}
                        setSeletedHolder={setSeletedHolder}
                        selectedHolder={selectedHolder}
                        item={item}
                        mirrorRevert={mirrorRevert}
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
                        mirrorRevert={mirrorRevert}
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
        ) : (
          ""
        )}
      </div>
      <div className="container_buttons" style={{ width: "100%" }}>
        <button
          className="image_btn"
          onClick={() =>
            setMirrorevert((prev) =>
              prev?.length
                ? prev?.find((a) => a === selectedHolder?.label_uuid)
                  ? prev?.filter((a) => a !== selectedHolder?.label_uuid)
                  : [...prev, selectedHolder?.label_uuid]
                : [selectedHolder?.label_uuid]
            )
          }
        >
          Mirror
        </button>
        <button
          className="image_btn"
          onClick={() =>
            setSelectedImage({
              ...selectedImage,
              holder: selectedImage.holder.map((b) =>
                b._id === selectedHolder._id ? { ...b, index: b.index + 1 } : b
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
              selectedImage.holder.find((a) => a._id === selectedHolder._id),
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
      </div>
      <div className="downloadBtnBackground">
        <ShareIcon style={{ fontSize: "20px", marginRight: "20px" }} />
        <MdFileDownload
          className="backArrow"
          onClick={() => setMobilePopup(true)}
          style={{ fontSize: "20px" }}
        />
      </div>
      {mobilePopup ? (
        <div
          className="overlay"
          // style={{ position: "fixed", top: 0, left: 0, zIndex: 9999999999 }}
        >
          <div
            className="modal"
            style={{ height: "fit-content", width: "fit-content" }}
          >
            <div
              className="content"
              style={{
                height: "fit-content",
                padding: "20px",
                width: "fit-content",
              }}
            >
              <div style={{ overflowY: "scroll" }}>
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginHandler();
                    setMobilePopup(false);
                  }}
                >
                  <div className="formGroup">
                    <div
                      className="row"
                      style={{ flexDirection: "column", alignItems: "start" }}
                    >
                      <label className="selectLabel flex">
                        Enter Mobile Number
                        <input
                          type="number"
                          name="route_title"
                          className="numberInput"
                          value={mobile}
                          //   style={{ height: "200px" }}
                          onChange={(e) =>
                            setMobile((prev) =>
                              e.target.value.length <= 10
                                ? e.target.value
                                : prev
                            )
                          }
                          onWheel={(e) => e.preventDefault()}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                    </div>

                    <div className="row">
                      <button className="simple_Logout_button" type="submit">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ShareImage;

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
  mirrorRevert,
  setHoldersImges,
}) => {
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);
  const sizeRef = useRef(null);
  const heightWeight = useWindowDimensions();
  const [image, setImage] = useState("");
  useEffect(() => {
    if (image)
      setHoldersImges((prev) => [
        ...(prev || []),
        { img_type: "UI", sort_order: 1, image, tag_uuid: url?.tag_uuid },
      ]);
  }, [image,url]);
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
        transform: mirrorRevert.find((a) => a === item?.label_uuid)
          ? "scaleX(-1)"
          : "scaleX(1)",
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
        {type === "I" ? (
          image ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={URL.createObjectURL(image)}
              className="holders"
              style={{ width: "100%", height: "100%", pointerEvents: "none" }}
              alt={NoImage}
            />
          ) : (
            <label
              htmlFor={url?.tag_uuid}
              className="flex"
              style={{
                // color: "rgba(142,198,13,255)",
                // border: "4px solid #fff",
                padding: "10px",
                backgroundColor: "#000",
                margin: "10px 0",
                width: "100%",
                textAlign: "left",
                fontSize: "10px",
                fontWeight: "1000",
                color: "#fff",
              }}
            >
              <span style={{ width: "250px" }} className="flex">
                <Image />
                Click Here
              </span>
              {item.value ? (
                <img
                  src={URL.createObjectURL(item.value)}
                  className="previwImages"
                  alt="yourimage"
                  style={{ width: "100px", objectFit: "contain" }}
                />
              ) : (
                ""
              )}
              <input
                id={url?.tag_uuid}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  setImage(e.target.files[0]);
                }}
              />
            </label>
          )
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
  setHoldersImges,
  coordinates,
  width,
  height,
  deleteHandler,
  switchBtn,
  item,
  selectedHolder,
  setSeletedHolder,
  setSwitchBtn,
  mirrorRevert,
}) => {
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);
  const heightWidth = useWindowDimensions();
  const sizeRef = useRef(null);
  const [image, setImage] = useState();
  useEffect(() => {
    if (image)
      setHoldersImges((prev) => [
        ...(prev || []),
        { img_type: "UI", sort_order: 1, image, tag_uuid: url?.tag_uuid },
      ]);
  }, [image,url]);
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
        transform: mirrorRevert.find((a) => a === item?.label_uuid)
          ? "scaleX(-1)"
          : "scaleX(1)",
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
        {type === "I" ? (
          image ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={URL.createObjectURL(image)}
              className="holders"
              style={{ width: "100%", height: "100%", pointerEvents: "none" }}
              alt={NoImage}
            />
          ) : (
            <label
              htmlFor={url?.tag_uuid}
              className="flex"
              style={{
                // color: "rgba(142,198,13,255)",
                // border: "4px solid #fff",
                padding: "10px",
                backgroundColor: "#000",
                margin: "10px 0",
                width: "100%",
                textAlign: "left",
                fontSize: "10px",
                fontWeight: "1000",
                color: "#fff",
              }}
            >
              <span style={{ width: "250px" }} className="flex">
                <Image />
                Click Here
              </span>
              {item.value ? (
                <img
                  src={URL.createObjectURL(item.value)}
                  className="previwImages"
                  alt="yourimage"
                  style={{ width: "100px", objectFit: "contain" }}
                />
              ) : (
                ""
              )}
              <input
                id={url?.tag_uuid}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  setImage(e.target.files[0]);
                }}
              />
            </label>
          )
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
