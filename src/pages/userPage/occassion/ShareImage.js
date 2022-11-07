import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoImage from "../../../assets/noImage.jpg";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { motion } from "framer-motion";
import ShareIcon from "@mui/icons-material/Share";
import "react-slideshow-image/dist/styles.css";
import "./index.css";
import axios from "axios";
import useWindowDimensions from "../../../components/useWidthDimenshion";
import { MdFileDownload } from "react-icons/md";
import { Home, Image } from "@mui/icons-material";
import { Box, Slider } from "@mui/material";
import { styled } from "@mui/system";
const PrettoSlider = styled(Slider)({
  color: "#fff",
  height: 4,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 15,
    width: 15,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
      height: 24,
      width: 24,
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    color: "var(--main-color)",
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#fff",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});
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
                  return (
                    <Tag
                      holdersImges={holdersImges}
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
                      scale={item?.scale}
                    />
                  );
                } else if (url?.tag_type === "T") {
                  return (
                    <Tag
                      switchBtn={switchBtn}
                      holdersImges={holdersImges}
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
                      scale={item?.scale}
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
      <div className="container_buttons">
        <div className="container_buttons_container">
          <Box width={250}>
            <PrettoSlider
              aria-label="pretto slider"
              valueLabelDisplay="auto"
              value={
                selectedImage?.holder?.find((b) => b._id === selectedHolder._id)
                  ?.scale * 25 || 0
              }
              onChange={(e) =>
                setSelectedImage((prev) => ({
                  ...prev,
                  holder: selectedImage?.holder?.map((b) =>
                    b._id === selectedHolder._id
                      ? { ...b, scale: Math.abs(e.target.value / 25) }
                      : b
                  ),
                }))
              }
            />
          </Box>
        </div>
        <div className="container_buttons_container">
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
                selectedImage.holder.find((a) => a._id === selectedHolder._id),
              ])
            }
          >
            Delete
          </button>
        </div>
        <div className="container_buttons_container">
          <ShareIcon
            style={{
              fontSize: "40px",
              marginRight: "40px",
              border: "2px solid #fff",
              borderRadius: "50%",
              padding: "5px",
            }}
          />
          <MdFileDownload
            className="backArrow"
            onClick={() => setMobilePopup(true)}
            style={{
              fontSize: "40px",
              border: "2px solid #fff",
              borderRadius: "50%",
              padding: "5px",
            }}
          />
        </div>
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
  scale,
  holdersImges,
}) => {
  const [image, setImage] = useState();
  useEffect(() => {
    if (image)
      setHoldersImges((prev) => [
        ...(prev || []),
        { img_type: "UI", sort_order: 1, image, tag_uuid: url?.tag_uuid },
      ]);
  }, [image, url]);

  return (
    <motion.div
      dragConstraints={{
        top: -100,
        left: -150,
        right: 150,
        bottom: 100,
      }}
      drag
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
          transform: `scale(${scale})`,
        }}
      >
        {type === "I" ? (
           holdersImges.find((a) => a.tag_uuid === url?.tag_uuid)?.image ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={URL.createObjectURL(
                holdersImges.find((a) => a.tag_uuid === url?.tag_uuid)?.image
              )}
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
    </motion.div>
  );
};
