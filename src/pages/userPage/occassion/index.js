import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NoImage from "../../../assets/noImage.jpg";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { FaWhatsapp } from "react-icons/fa";
import ShareIcon from "@mui/icons-material/Share";
import Sliders from "../../../components/Sliders";
import "react-slideshow-image/dist/styles.css";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import {
  HiOutlineArrowCircleRight,
  HiOutlineArrowCircleLeft,
} from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import "./index.css";
import axios from "axios";
import useWindowDimensions from "../../../components/useWidthDimenshion";
import { MdFileDownload } from "react-icons/md";
import { ArrowBack, Cached } from "@mui/icons-material";
import { Box, CircularProgress, Slider } from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "../../../components/Sidebar/navbar";
import ImageUploadPopup from "../../../components/ImageUploadPopup";
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
const OccasionPage = () => {
  const [images, setImages] = useState([]);
  const [popupCrop, setPopupCrop] = useState();
  const [state, setState] = useState(false);
  const [baseImages, setBaseImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customHolders, setCustomHolders] = useState([]);

  const [tags, setTags] = useState([]);
  const [occasion, setOccasion] = useState({});
  const [updateImageData, setUpdateImageData] = useState({});
  const [selectedImage, setSelectedImage] = useState(false);
  const [mirrorRevert, setMirrorevert] = useState([]);
  const [deleteImage, setDeleteImage] = useState(null);
  const [switchBtn, setSwitchBtn] = useState("");
  const [deleteHolders, setDeleteHolders] = useState([]);
  const [CopyPopup, setCopyPopup] = useState("");
  const [usersData, setUsersData] = useState([]);
  const params = useParams();
  const [baseImage, setBaseImage] = useState();
  const [selectedCropFile, setSelectiveCropFile] = useState();
  const imageArea = useRef();
  const ref = useRef();
  console.log(customHolders);
  const [selectedHolder, setSeletedHolder] = useState("");
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const location = useLocation();
  useEffect(() => {
    setCustomHolders(selectedImage?.holder);
  }, [selectedImage?.holder]);
  useEffect(() => {
    if (selectedImage?.img_url) {
      setLoading(true);
      axios({
        method: "get",
        url: selectedImage?.img_url,
        responseType: "blob",
      }).then(function (response) {
        var reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = function () {
          var base64data = reader.result;
          //  console.log(base64data);
          setBaseImage(base64data);
          setLoading(false);
        };
      });
    }
  }, [selectedImage?.img_url]);
  const getSelectedBaseImageData = async (image) => {
    if (image.img_url) {
      setLoading(true);
      const response = await axios({
        method: "get",
        url: "/images/getBaseImages/" + image.img_url.split("/")[3],
      });
      if (response.data.success) {
        let data = response.data.result;
        data = {
          ...data,
          holder: data.holder.map((a) => ({
            ...a,
            scale: 1,
            _id: Math?.random(),
          })),
          sort_order: image?.sort_order || 1,
        };
        setSelectedImage(data);
        setLoading(false);
      }
    }
  };
  const getUsersData = async () => {
    const response = await axios({ method: "get", url: "/users/getUsers" });
    // console.log(response);
    if (response.data.success) setUsersData(response.data.result);
  };
  // console.log(params);
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
  //console.log("images", images);
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
    //console.log("baseImage", response);
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
            sort_order: i + 1,
          }))
          .map((a) => ({
            ...a,
            holder: a?.holder.map((b) => ({ ...b, index: 0 } || [])),
          }))
      );
      if (params.img_url)
        getSelectedBaseImageData({
          img_url:
            "https://framme-media.s3.ap-south-1.amazonaws.com/" +
            params.img_url,
        });
    }
  };
  const getTags = async () => {
    let data = localStorage.getItem("user_uuid");
    const response = await axios({
      method: "post",
      data: { user_uuid: data },
      url: "/tags/getUserTags",
    });
    //console.log(response);
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
      if (params?.user_uuid === "new" && !localStorage.getItem("user_uuid")) {
        navigate("/login");
      } else loginHandler();
    }
  }, [state]);
  // useEffect(() => {
  //   if (localStorage.getItem("user_uuid")) {
  //     setDeleteHolders([]);
  //     setSwitchBtn("");
  //   }
  // }, [selectedImage, state]);
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

    htmlToImage.toPng(ref.current).then(function (dataUrl) {
      //   console.log(dataUrl);
      download(dataUrl, "text-img.png");
    });
  };
  const handleShare = async () => {
    const canvas = await html2canvas(ref.current);
    canvas.toBlob(async (blob) => {
      // Even if you want to share just one file you need to
      // send them as an array of files.
      const files = [new File([blob], "image.png", { type: blob.type })];
      const shareData = {
        text: "",
        title: "",
        files,
      };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err.name, err.message);
          }
        }
      } else {
        console.warn("Sharing not supported", shareData);
      }
    });
  };
  const deleteHandler = async () => {
    const response = await axios({
      method: "delete",
      data: deleteImage,
      url: "/images/deleteImages",
    });
    // console.log(response);
    if (response.data.success) getImageData();
  };

  return localStorage.getItem("user_uuid") ? (
    selectedImage ? (
      <>
        <div className="container">
          <Navbar
            Tag={() => (
              <div
                className="flex"
                style={{
                  color: "#fff",
                  width: "85vw",
                  justifyContent: "flex-start",
                }}
              >
                <ArrowBack
                  className="backArrow"
                  onClick={() => {
                    if (params.img_url)
                      navigate(`/occasion/${occasion?.occ_uuid}`);
                    setSelectedImage(false);
                  }}
                />
              </div>
            )}
          />
          {loading ? (
            <div className="flex" style={{ marginTop: "100px" }}>
              <CircularProgress />
            </div>
          ) : (
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

                      // transform: mirrorRevert ? "scaleX(-1)" : "scaleX(1)",
                    }}
                    ref={imageArea}
                  />

                  {customHolders
                    ?.filter((a) => {
                      let value = deleteHolders?.filter(
                        (b) => a?._id === b?._id
                      )?.length
                        ? false
                        : true;

                      return value;
                    })
                    ?.map((item) => {
                      let url = tags.find(
                        (a) => a.tag_uuid === item.label_uuid
                      );

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
                      //       console.log(coordinates, width1, height);
                      if (url?.tag_type === "I") {
                        return (
                          <Tag
                            image={item?.image}
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
                            mirrorRevert={mirrorRevert}
                            deleteHandler={() =>
                              setDeleteHolders((prev) => [...prev, item])
                            }
                            scale={item?.scale}
                            selectedImage={selectedImage}
                          />
                        );
                      } else if (url?.tag_type === "T") {
                        return (
                          <Tag
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
          )}
          <div className="container_buttons">
            {selectedHolder ? (
              <>
                <div className="container_buttons_container">
                  <Box width={250}>
                    <PrettoSlider
                      aria-label="pretto slider"
                      valueLabelDisplay="auto"
                      value={
                        customHolders?.find((b) => b._id === selectedHolder._id)
                          ?.scale * 25 || 0
                      }
                      onChange={(e) =>
                        setCustomHolders((prev) =>
                          prev?.map((b) =>
                            b._id === selectedHolder._id
                              ? {
                                  ...b,
                                  scale: Math.abs(e.target.value / 25),
                                }
                              : b
                          )
                        )
                      }
                    />
                  </Box>
                </div>

                {selectedHolder?.tag_type === "I" ? (
                  <div className="container_buttons_container">
                    <label htmlFor="inputImage">
                      Change Image
                      <input
                        id="inputImage"
                        style={{ display: "none" }}
                        type="file"
                        // value={
                        //   selectedImage?.holder?.find(
                        //     (b) => b._id === selectedHolder._id
                        //   )?.image
                        // }
                        onChange={(e) => {
                          setPopupCrop(true);
                          setSelectiveCropFile({
                            file: e.target.files[0],
                            selectedHolder,
                          });
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}
            <div className="container_buttons_container">
              <button
                onClick={() =>
                  getSelectedBaseImageData(
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
                        ? { ...b, index: (b.index || 0) + 1 }
                        : b
                    ),
                  })
                }
              >
                <Cached />
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

              <button
                onClick={() =>
                  getSelectedBaseImageData(
                    baseImages?.find((a) => {
                      let b =
                        selectedImage?.sort_order + 1
                          ? selectedImage?.sort_order + 1
                          : baseImages?.length;

                      return a?.sort_order === b;
                    }) || baseImage[0]
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
            <div className="container_buttons_container">
              <ShareIcon
                style={{
                  fontSize: "40px",
                  marginRight: "40px",
                  border: "2px solid #fff",
                  borderRadius: "50%",
                  padding: "5px",
                }}
                onClick={handleShare}
              />
              <MdFileDownload
                className="backArrow"
                onClick={() => handlePng()}
                style={{
                  fontSize: "40px",
                  border: "2px solid #fff",
                  borderRadius: "50%",
                  padding: "5px",
                }}
              />
            </div>
          </div>
        </div>
        {selectedCropFile && popupCrop ? (
          <ImageUploadPopup
            file={selectedCropFile.file}
            selectedimage={selectedHolder}
            onClose={() => setPopupCrop(null)}
            setSelectedFile={(e) =>
              setSelectedImage((prev) => ({
                ...prev,
                holder: selectedImage?.holder?.map((b) =>
                  b._id === selectedHolder._id ? { ...b, image: e } : b
                ),
              }))
            }
          />
        ) : (
          ""
        )}
      </>
    ) : (
      <>
        <div className="userOccasion">
          <Navbar
            Tag={() => (
              <div className="flex">
                <ArrowBack
                  className="backArrow"
                  onClick={() => navigate("/users")}
                  style={{ color: "#fff" }}
                />
                <div className="h1" style={{ width: "80vw" }}>
                  {occasion?.title || "-"}
                </div>
              </div>
            )}
          />

          {occasion?.posters?.length ? (
            <div className="slide-container">
              {occasion?.posters.length ? (
                <Sliders item={occasion?.posters} />
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          {loading ? (
            <div className="flex" style={{ marginTop: "50px" }}>
              <CircularProgress />
            </div>
          ) : (
            <div className="occasion_container">
              {baseImages
                .sort((a, b) => +a.sort_order - b.sort_order)
                .map((imgItem, index) => (
                  <div className="image_container">
                    <img
                      onClick={() => getSelectedBaseImageData(imgItem)}
                      src={imgItem?.img_url ? imgItem?.img_url : NoImage}
                      alt=""
                      style={{
                        width: "44vw",
                        maxWidth: "200px",
                        height: "61vw",
                        maxHeight: "250px",
                        objectFit: "cover",
                      }}
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
          )}
        </div>
        {deleteImage ? (
          <Popup
            close={() => setDeleteImage(null)}
            type="delete"
            deleteHandler={deleteHandler}
            getBaseImageData={getBaseImageData}
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
const Popup = ({
  close,
  deleteHandler,
  type,
  usersData,
  item,
  getBaseImageData,
}) => {
  const [btnName, setBtnName] = useState("Copy");
  const [user, setUser] = useState("");
  const submitHandler = async () => {
    deleteHandler();
    getBaseImageData();
    close();
  };
  useEffect(() => {
    if (user) var input = document.getElementById("myTextInput");
    input?.focus();
    input?.select();
  }, [user]);
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>Delete Image</h3>
          <AiOutlineClose
            style={{ width: "20px", cursor: "pointer" }}
            onClick={close}
          />
        </div>
        {type === "delete" ? (
          <div className="popup_body">
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
                    "https://www.framee.in" +
                    `/login/${user}/${item.img_url.split("/")[3]}`
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
                        "http://www.framee.in" +
                        `/login/${user}/${item.img_url.split("/")[3]}`
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
                      "http://www.framee.in" +
                      `/login/${user}/${item.img_url.split("/")[3]}`;
                    navigator.clipboard
                      .writeText(copy)
                      .then(() => {
                        setBtnName("Copied!");
                        setTimeout(close, 2000);
                        // console.log("successfully copied");
                      })
                      .catch(() => {
                        setBtnName("Not Copied!");
                        // console.log("something went wrong");
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
  mirrorRevert,
  scale,
  image,
  selectedImage,
}) => {
  const [baseImage, setBaseImage] = useState();
  console.log(url);
  useEffect(() => {
    let img_url = url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)[
      (item?.index || 0) % url?.img_url?.length
    ]?.img_url;

    if (img_url) {
      axios({
        method: "get",
        url: img_url,
        responseType: "blob",
      }).then(function (response) {
        var reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = function () {
          var base64data = reader.result;
          //console.log(base64data);
          setBaseImage(base64data);
        };
      });
    }
  }, [item, item?.index, url, selectedImage]);
  const text = useMemo(() => {
    if (type === "I") return "";
    else {
      return url?.text?.sort((a, b) => +a.sort_order - +b.sort_order)[
        (item.index || 0) % url?.text?.length
      ];
    }
  }, [item.index, type, url?.text]);
  return (
    <motion.div
      dragConstraints={{
        top: -200,
        left: -200,
        right: 200,
        bottom: 200,
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
          ? `scaleX(-1)`
          : `scaleX(1)`,
      }}
      onTouchEnd={() => setSwitchBtn("resize")}
    >
      {type === "T" && text?.text ? (
        <div
          className="holders img"
          onMouseLeave={() => setSwitchBtn("resize")}
          onClick={
            switchBtn === "delete"
              ? deleteHandler
              : (e) => {
                  e.stopPropagation();
                  setSwitchBtn("position");
                  setSeletedHolder({ ...url, ...item });
                }
          }
          style={{
            border:
              selectedHolder?._id === item?._id ? "2px solid black" : "none",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="holders"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              textAlign: "center",
              color: text?.text_color || item?.text_color || "#000",
              fontFamily: text?.fontFamily || item?.fontFamily || "",
              fontSize: scale + "rem",
            }}
          >
            {text.text}
          </div>
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/alt-text
        <div
          className="holders img"
          onMouseLeave={() => setSwitchBtn("resize")}
          onClick={
            switchBtn === "delete"
              ? deleteHandler
              : (e) => {
                  e.stopPropagation();
                  setSwitchBtn("position");
                  setSeletedHolder({ ...url, ...item });
                }
          }
          style={{
            border:
              selectedHolder?._id === item?._id ? "2px solid black" : "none",
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
            borderRadius: url?.circle ? "50%" : 0,
            overflow: "hidden",
          }}
        >
          <img
            src={image ? URL.createObjectURL(image) : baseImage || NoImage}
            className="holders"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            alt={""}
          />
        </div>
      )}
    </motion.div>
  );
};
