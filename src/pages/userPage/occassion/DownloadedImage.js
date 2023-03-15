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
import Select from "react-select";
import { height, styled } from "@mui/system";

const DownloadedImage = ({ params }) => {
  const [images, setImages] = useState([]);
  const [popupCrop, setPopupCrop] = useState();
  const [state, setState] = useState(false);
  const [baseImages, setBaseImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagPopup, setTagPopup] = useState(false);
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

  const [baseImage, setBaseImage] = useState();
  const [selectedCropFile, setSelectiveCropFile] = useState();
  const imageArea = useRef();
  const ref = useRef();

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
    setSeletedHolder("");
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

  return selectedImage ? (
    <>
      <div className="container">
        {loading ? (
          <div className="flex" style={{ marginTop: "100px" }}>
            <CircularProgress />
          </div>
        ) : (
          <div
            className="display_image_container"
            style={{ marginTop: "0" }}
            id={params.user_uuid}
          >
            {selectedImage.img_url ? (
              <div
                ref={ref}
                id="my-img"
                className="DisplayImg"
                style={{
                  width:
                    ((selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                      2 <
                    width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                        2
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                          1.5 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                        1.5
                      : selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0] <
                        width
                      ? selectedImage?.coordinates[0]?.b?.split(",")[0] -
                        selectedImage?.coordinates[0]?.a?.split(",")[0]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.1 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.1
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.2 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.2
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.3 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.3
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.4 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        1.4
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
                          2.2 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        2.2
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                        2.5) + "px",
                  height:
                    ((selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                      2 <
                    width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                        2
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                          1.5 <
                        width
                      ? (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                        1.5
                      : selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0] <
                        width
                      ? selectedImage?.coordinates[0]?.d?.split(",")[1] -
                        selectedImage?.coordinates[0]?.a?.split(",")[1]
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.1 <
                        width
                      ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        1.1
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.2 <
                        width
                      ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        1.2
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.3 <
                        width
                      ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        1.3
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          1.4 <
                        width
                      ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        1.4
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
                      : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                          2.5 <
                        width
                      ? (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        2.5
                      : (selectedImage?.coordinates[0]?.d?.split(",")[1] -
                          selectedImage?.coordinates[0]?.a?.split(",")[1]) /
                        3) + "px",
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
                    zIndex: "99",
                    // transform: mirrorRevert ? "scaleX(-1)" : "scaleX(1)",
                  }}
                  ref={imageArea}
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
                        (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                          2 <
                        width
                          ? coordinates[0] * 2
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                              1.5 <
                            width
                          ? coordinates[0] * 1.5
                          : selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0] <
                            width
                          ? coordinates[0]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.1 <
                            width
                          ? coordinates[0] / 1.1
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.2 <
                            width
                          ? coordinates[0] / 1.2
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.3 <
                            width
                          ? coordinates[0] / 1.3
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.4 <
                            width
                          ? coordinates[0] / 1.4
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
                        (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                          selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                          2 <
                        width
                          ? coordinates[1] * 2
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) *
                              1.5 <
                            width
                          ? coordinates[1] * 1.5
                          : selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0] <
                            width
                          ? coordinates[1]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.1 <
                            width
                          ? coordinates[1] / 1.1
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.2 <
                            width
                          ? coordinates[1] / 1.2
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.3 <
                            width
                          ? coordinates[1] / 1.3
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.4 <
                            width
                          ? coordinates[1] / 1.4
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
                              1.1 <
                            width
                          ? item.b.split(",")[0] / 1.1 - coordinates[0]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.2 <
                            width
                          ? item.b.split(",")[0] / 1.2 - coordinates[0]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.3 <
                            width
                          ? item.b.split(",")[0] / 1.3 - coordinates[0]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.4 <
                            width
                          ? item.b.split(",")[0] / 1.4 - coordinates[0]
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
                              1.1 <
                            width
                          ? item.d.split(",")[1] / 1.1 - coordinates[1]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.2 <
                            width
                          ? item.d.split(",")[1] / 1.2 - coordinates[1]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.3 <
                            width
                          ? item.d.split(",")[1] / 1.3 - coordinates[1]
                          : (selectedImage?.coordinates[0]?.b?.split(",")[0] -
                              selectedImage?.coordinates[0]?.a?.split(",")[0]) /
                              1.4 <
                            width
                          ? item.d.split(",")[1] / 1.4 - coordinates[1]
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
                          popupCrop={popupCrop}
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
                          popupCrop={popupCrop}
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
      </div>
    </>
  ) : (
    <div />
  );
};

export default DownloadedImage;

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
  popupCrop,
}) => {
  const [baseImage, setBaseImage] = useState();
  const revert = useMemo(
    () => mirrorRevert.find((a) => a === item?._id),
    [item?.label_uuid, mirrorRevert]
  );
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
      className="resizeable"
      style={{
        cursor: "pointer",
        left: coordinates[0] + "px",
        top: coordinates[1] + "px",
        width: width + "px",
        height: height + "px",
        position: "absolute",
        zIndex: url?.back ? "0" : "99999999",
      }}
      onTouchEnd={() => setSwitchBtn("resize")}
    >
      {type === "T" && text?.text ? (
        <div
          className="holders img"
          style={{
            border:
              selectedHolder?._id === item?._id ? "2px solid black" : "none",
            width: "100%",
            height: "100%",
            transform: revert ? `scaleX(-1)` : `scaleX(1)`,
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
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              className="holders"
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                transform: revert ? `scaleX(-1)` : `scaleX(1)`,
              }}
              alt={""}
            />
          ) : (
            ""
          )}
        </div>
      )}
    </motion.div>
  );
};
