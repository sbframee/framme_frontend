import React, { useState, useEffect, useRef, useMemo } from "react";
import NoImage from "../../../assets/noImage.jpg";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Slider } from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import {
  HiOutlineArrowCircleRight,
  HiOutlineArrowCircleLeft,
} from "react-icons/hi";
import html2canvas from "html2canvas";

import { MdFileDownload } from "react-icons/md";

import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import "./index.css";
import Navbar from "../../../components/Sidebar/navbar";
import { ArrowBack, Cached } from "@mui/icons-material";
import useWindowDimensions from "../../../components/useWidthDimenshion";
import ShareIcon from "@mui/icons-material/Share";
import Sliders from "../../../components/Sliders";
import ImageUploadPopup from "../../../components/ImageUploadPopup";
const tagsInitials = {
  a: "0,0",
  b: "100,10",
  c: "100,100",
  d: "0,100",
  fontFamily: "sans-serif",

  scale: 1,
  text_color: "#000",
};
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
const CustomImage = () => {
  const inputFile = useRef(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [tagPopup, setTagPopup] = useState(false);
  const [popupCrop, setPopupCrop] = useState();
  const [selectedCropFile, setSelectiveCropFile] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [switchBtn, setSwitchBtn] = useState();
  const [customHolders, setCustomHolders] = useState([]);
  const [deleteHolders, setDeleteHolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedHolder, setSeletedHolder] = useState("");
  const [mirrorRevert, setMirrorevert] = useState([]);
  const [baseImage, setBaseImage] = useState();
  const { width } = useWindowDimensions();
  const ref = useRef();
  const [data, setData] = useState([]);
  const [type, setType] = useState("");
  const [uploadMsg, setUploadMsg] = useState(false);
  const [baseImages, setBaseImages] = useState([]);
  console.log(selectedImage);
  useEffect(() => {
    inputFile.current.click();
  }, []);
  const handlePng = () => {
    setSeletedHolder("");
    setSwitchBtn("");

    htmlToImage.toPng(ref.current).then(function (dataUrl) {
      console.log("dataurl", dataUrl);
      download(dataUrl, "text-img.png");
    });
  };
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
          console.log(base64data);
          setBaseImage(base64data);
          setLoading(false);
        };
      });
    }
  }, [selectedImage?.img_url]);
  const imageArea = useRef();
  const getBaseImageData = async () => {
    let user_category_uuid = localStorage.getItem("user_category_uuid");
    let user_uuid = localStorage.getItem("user_uuid");
    user_category_uuid = user_category_uuid
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
          .filter((a) => a.img_type === "B")
          .sort((a, b) => +a.sort_order - b.sort_order)
          .map((a, i) => ({
            ...a,
            sort_order: a.sort_order ? a.sort_order : i + 1,
          }))
      );
    }
  };
  useEffect(() => {
    getBaseImageData();
  }, []);
  const getTags = async () => {
    let data = localStorage.getItem("user_uuid");
    const response = await axios({
      method: "post",
      data: { user_uuid: data },
      url: "/tags/getUserTags",
    });
    console.log(response);
    if (response.data.success) {
      setTags(response.data.result);
    }
  };
  useEffect(() => {
    getTags();
  }, []);
  useEffect(() => {
    if (!selectedFile) {
      setSelectedImage(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setSelectedImage(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);
  const onSelectFile = (e) => {
    setType("new");
    if (!e.target.files || e.target.files.length === 0) {
      setSelectiveCropFile(undefined);
      return;
    }
    setPopupCrop(true);
    setSelectiveCropFile(e.target.files[0]);
  };
  const submitHandler = async (temp, user_category_uuid) => {
    // e.preventDefault()
    // let thumbnail = await resizeFile(selectedFile)
    var bodyFormData = new FormData();
    const id = uuid();
    let fileData = new File(
      [selectedFile],
      id + "." + (selectedCropFile.name.split(".")[1] || "png")
    );
    let user_uuid = localStorage.getItem("user_uuid");
    let obj = {
      image: fileData,
      img_type: "B",
      remarks: "",
      acc_uuid: "",
      occ_uuid: temp,
      user: [user_uuid],
      coordinates: [
        {
          base_img_url: "",
          a: `0,0`,
          b: `${imageArea?.current?.offsetWidth},0`,
          c: `${imageArea?.current?.offsetWidth},${imageArea?.current?.offsetHeight}`,
          d: `0,${imageArea?.current?.offsetHeight}`,
        },
      ],
      holder: customHolders,
    };
    bodyFormData.append("image", fileData);
    bodyFormData.append("value", JSON.stringify(obj));
    const response = await axios({
      method: "post",
      url: "/images/postImage",
      data: bodyFormData,
    });
    console.log(obj, response);
    if (response.data.success) {
      setUploadMsg(true);
      setTimeout(() => setUploadMsg(false), 2000);
    }
  };

  const onChangeHandler = (e) => {
    if (e.target.value === "none") {
      setData([]);
      return;
    }
    let catData = data || [];
    let options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    for (let i of options) {
      if (catData.filter((a) => a === i).length)
        catData = catData.filter((a) => a !== i);
      else catData = [...catData, tags.find((a) => a.tag_uuid == i)?.tag_uuid];
    }
    // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
    console.log(options, catData);

    setData(catData);
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
  useEffect(() => {
    setCustomHolders(selectedImage?.holder);
  }, [selectedImage?.holder]);
  console.log(selectedHolder);
  return (
    <>
      {selectedImage ? (
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
                    setSelectedImage(false);
                  }}
                />
                    <button
                  className="submit"
                  onClick={() => setTagPopup(true)}
                  style={{
                    marginTop: 0,
                    backgroundColor: "transparent",
                    border: "2px solid #fff",
                  }}
                >
                  Add Tag
                </button>
              </div>
            )}
          />
          {loading ? (
            <div className="flex" style={{ marginTop: "100px" }}>
              <CircularProgress />
            </div>
          ) : (
            <div className="display_image_container">
              <div
                id="my-img"
                ref={ref}
                className="DisplayImg"
                style={
                  type === "new"
                    ? {
                        width: "100vw",

                        height: imageArea?.current?.offsetHeight,
                        maxHeight: "100%",
                        minHeight: "400px",
                        backgroundColor: "#000",
                      }
                    : {
                        width:
                          (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                            selectedImage?.coordinates[0]?.a?.split(",")[0] <
                          width
                            ? selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]
                            : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                                1.5 <
                              width
                            ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                              1.5
                            : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                                2 <
                              width
                            ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                              2
                            : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                              2.5) + "px",
                        height:
                          (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                            selectedImage?.coordinates[0]?.a?.split(",")[0] <
                          width
                            ? selectedImage?.coordinates[0]?.d?.split(",")[1] -
                              selectedImage?.coordinates[0]?.a?.split(",")[1]
                            : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                                1.5 <
                              width
                            ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[1]) /
                              1.5
                            : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[0]) /
                                2 <
                              width
                            ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[1]) /
                              2
                            : (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                                selectedImage?.coordinates[0]?.a?.split(
                                  ","
                                )[1]) /
                              2.5) + "px",
                        maxHeight: "100%",
                      }
                }
              >
                <img
                  src={type === "new" ? selectedImage : baseImage}
                  ref={imageArea}
                  style={{
                    width: "100%",
                    // height: "100%",
                    position: "absolute",
                    pointerEvents: "none",
                    minHeight: "400px",

                    // transform: mirrorRevert ? "scaleX(-1)" : "scaleX(1)",
                  }}
                  unselectable="on"
                  alt=""
                />

                {customHolders
                  ?.filter((a) => {
                    let value = deleteHolders?.filter((b) => a?._id === b?._id)
                      ?.length
                      ? false
                      : true;

                    return value;
                  })
                  ?.map((item) => {
                    let url = tags.find((a) => a.tag_uuid === item.label_uuid);
                    let coordinates;
                    let height;
                    let width1;
                    console.log("urls", item?.type, url);
                    if (item?.type === "new") {
                      coordinates = [100, 100];
                      height = url?.height || 100;
                      width1 = url?.width || 100;
                    } else {
                      coordinates = item.a.split(",");
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

                      width1 =
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

                      height =
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
                    }
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
              {/* <div
                type="button"
                className={`uploadMsg ${uploadMsg ? "uploadActive" : ""}`}
              >
                Saved
              </div> */}
              <div className="container_buttons">
            
                {selectedHolder ? (
                  <>
                    <div className="container_buttons_container">
                      <Box width={250}>
                        <PrettoSlider
                          aria-label="pretto slider"
                          valueLabelDisplay="auto"
                          value={
                            customHolders?.find(
                              (b) => b._id === selectedHolder._id
                            )?.scale * 25 || 0
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
                            accept="image/png, image/jpeg"
                            // value={
                            //   selectedImage?.holder?.find(
                            //     (b) => b._id === selectedHolder._id
                            //   )?.image
                            // }

                            onChange={(e) => {
                              setPopupCrop(true);
                              setSelectiveCropFile(e.target.files[0]);
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
                {selectedHolder ? (
                  <div className="container_buttons_container">
                    <button
                      className="image_btn"
                      onClick={() =>
                        setMirrorevert((prev) =>
                          prev?.length
                            ? prev?.find(
                                (a) => a === selectedHolder?._id
                              )
                              ? prev?.filter(
                                  (a) => a !== selectedHolder?._id
                                )
                              : [...prev, selectedHolder?._id]
                            : [selectedHolder?._id]
                        )
                      }
                    >
                      Mirror
                    </button>
                    <button
                      className="image_btn"
                      onClick={() =>
                        setCustomHolders((prev) =>
                          prev.map((b) =>
                            b._id === selectedHolder._id
                              ? { ...b, index: (b.index || 0) + 1 }
                              : b
                          )
                        )
                      }
                    >
                      <Cached />
                    </button>
                    <button
                      className="image_btn"
                      onClick={() =>
                        setDeleteHolders((prev) => [
                          ...prev,
                          customHolders.find(
                            (a) => a._id === selectedHolder._id
                          ),
                        ])
                      }
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  ""
                )}

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

                    position: "fixed",
                    bottom: "15vh",
                    left: "5px",
                  }}
                >
                  <HiOutlineArrowCircleLeft />
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
                    position: "fixed",
                    bottom: "15vh",
                    right: "5px",
                  }}
                >
                  <HiOutlineArrowCircleRight />
                </button>

                <div
                  className="container_buttons_container"
                  style={{ position: "fixed", bottom: "10px", right: "10px" }}
                >
                  {/* <ShareIcon
                    style={{
                      fontSize: "40px",
                      marginRight: "40px",
                      border: "2px solid #fff",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                    onClick={handleShare}
                  /> */}
                  {/* <button
                    type="button"
                    onClick={submitHandler}
                    style={{
                      fontSize: "15px",
                      marginRight: "40px",
                      border: "2px solid #fff",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                  >
                    Save
                  </button> */}
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
              </div>{" "}
            </div>
          )}
        </div>
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
                    Customs
                  </div>
                </div>
              )}
            />

            {loading ? (
              <div className="flex" style={{ marginTop: "50px" }}>
                <CircularProgress />
              </div>
            ) : (
              <div className="occasion_container">
                {console.log(baseImages)}
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
                          height: "61vw",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
          <label
            htmlFor="new_image"
            className="save_button"
            style={{ position: "fixed", bottom: "0px" }}
          >
            <input
              type="file"
              id="new_image"
              style={{ display: "none" }}
              onChange={onSelectFile}
              accept="image/png, image/jpeg"
              ref={inputFile}
            />
            Add New
          </label>
        </>
      )}
        {tagPopup ? (
          <div className="overlay" style={{ zIndex: 9999999999999 }}>
            <Navbar
              logo={false}
              Tag={() => (
                <div
                  className="flex"
                  style={{
                    color: "#fff",
                    width: "100%",
                    justifyContent: "space-between",
                    padding: "0 10px",
                  }}
                >
                  <ArrowBack
                    className="backArrow"
                    onClick={() => {
 
                      setSelectedImage(false);
                    }}
                  />
                  <h1 style={{ width: "70%" }}>Tags</h1>
                </div>
              )}
            />

            <div className="occasion_container_new">
              {tags?.map((tag) =>
                tag?.img_url?.length ? (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: tag?.circle ? "100%" : "",
                    }}
                    className="image_container"
                    onClick={() =>
                      setCustomHolders((prev) => {
                        let data = {
                          label_uuid: tag?.tag_uuid,
                          ...tagsInitials,
                          ...(tag || {}),
                          type: "new",
                          _id: Math.random(),
                        };
                        setSeletedHolder(data);
                        setTagPopup(false);

                        return [...(prev || []), data];
                      })
                    }
                  >
                    {console.log(tag)}
                    <img
                      src={tag.img_url?.length ? tag.img_url[0]?.img_url : ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: tag?.circle ? "100%" : "",
                      }}
                      alt=""
                    />
                  </div>
                ) : tag?.text?.length ? (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      color: "#000",
                      backgroundColor: "#fff",
                    }}
                    className="image_container flex"
                    onClick={() =>
                      setCustomHolders((prev) => {
                        let data = {
                          label_uuid: tag?.tag_uuid,
                          ...tagsInitials,
                          _id: Math.random(),
                          ...(tag || {}),
                          type: "new",
                        };
                        setSeletedHolder(data);
                        setTagPopup(false);
                        return [...(prev || []), data];
                      })
                    }
                  >
                    <h4>{tag?.text?.length ? tag.text[0]?.text : ""}</h4>
                  </div>
                ) : (
                  ""
                )
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      {selectedCropFile && popupCrop ? (
        <ImageUploadPopup
          selectedimage={selectedHolder}
          file={selectedCropFile}
          onClose={() => setPopupCrop(null)}
          fixed={false}
          setSelectedFile={
            selectedHolder
              ? (e) =>
                  setCustomHolders((prev) =>
                    prev?.map((b) =>
                      b._id === selectedHolder._id ? { ...b, image: e } : b
                    )
                  )
              : setSelectedFile
          }
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CustomImage;
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
          console.log(base64data);
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
  console.log(mirrorRevert.find((a) => a === item?._id))
  return (
    <motion.div
      dragConstraints={{
        top: -300,
        left: -300,
        right: 300,
        bottom: 300,
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
            transform: mirrorRevert.find((a) => a === item?._id)
            ? `scaleX(-1)`
            : `scaleX(1)`,
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
      ) : image || baseImage ? (
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
            src={image ? URL.createObjectURL(image) : baseImage}
            className="holders"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              transform: mirrorRevert.find((a) => a === item?._id)
              ? `scaleX(-1)`
              : `scaleX(1)`,
            }}
            alt={NoImage}
          />
        </div>
      ) : (
        <></>
      )}
    </motion.div>
  );
};
