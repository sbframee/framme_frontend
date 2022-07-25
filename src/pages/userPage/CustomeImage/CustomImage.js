import React, { useState, useEffect, useRef } from "react";
import NoImage from "../../../assets/noImage.jpg";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import "./index.css";
import ImageUploadPopup from "../../../components/ImageUploadPopup";
const CustomImage = () => {
  const [selectedFile, setSelectedFile] = useState("");
  const [popupCrop, setPopupCrop] = useState();
  const [selectedCropFile, setSelectiveCropFile] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [switchBtn, setSwitchBtn] = useState();
  const [customHolders, setCustomHolders] = useState([]);
  const [deleteHolders, setDeleteHolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [data, setData] = useState([]);
  const [type, setType] = useState("");
  const [uploadMsg, setUploadMsg] = useState(false);
  const [baseImages, setBaseImages] = useState([]);
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
          .filter(
            (a) =>
              a.img_type === "B" && a.user.filter((a) => a === user_uuid).length
          )
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
  const handlePng = () => {
    setSwitchBtn("");
    htmlToImage
      .toPng(document.getElementById("my-img"))
      .then(function (dataUrl) {
        console.log(dataUrl);
        download(dataUrl, "text-img.png");
      });
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
  console.log(selectedImage);
  return (
    <>
      {selectedImage ? (
        <div className="customImage">
          <div style={{ position: "fixed", bottom: "0", right: "100px" }}>
            <input
              type="radio"
              id="delete-selection"
              checked={switchBtn === "delete"}
              onClick={() =>
                setSwitchBtn((prev) => (prev === "delete" ? "" : "delete"))
              }
            />
            <label htmlFor="delete-selection">Delete</label>
            <input
              type="radio"
              id="resize-selection"
              checked={switchBtn === "resize"}
              onClick={() =>
                setSwitchBtn((prev) => (prev === "resize" ? "" : "resize"))
              }
            />
            <label htmlFor="resize-selection">Resize</label>
            <input
              type="radio"
              id="position-selection"
              checked={switchBtn === "position"}
              onClick={() =>
                setSwitchBtn((prev) => (prev === "position" ? "" : "position"))
              }
            />
            <label htmlFor="position-selection">Position</label>
          </div>
          <div
            onClick={() => setSelectedImage(false)}
            style={{
              position: "absolute",
              right: "100px",
              top: "50px",
              cursor: "pointer",
              fontSize: "25px",
              backgroundColor: "black",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "30px",
            }}
          >
            X
          </div>

          <div
            id="my-img"
            className="image_container"
            style={
              type === "new"
                ? {}
                : {
                    width:
                      selectedImage?.coordinates[0]?.b?.split(",")[0] -
                      selectedImage?.coordinates[0]?.a?.split(",")[0] +
                      "px",
                  }
            }
          >
            <img
              src={type === "new" ? selectedImage : `${selectedImage?.img_url}`}
              ref={imageArea}
              style={{ maxWidth: "100vw", maxHeight: "100vh" }}
              unselectable="on"
            />

            {type === "new"
              ? customHolders
                  ?.filter((a) => {
                    let value = deleteHolders?.filter((b) => a?._id === b?._id)
                      ?.length
                      ? false
                      : true;
                    console.log("value", deleteHolders, a, value);
                    return value;
                  })
                  ?.map((item) => {
                    let url = tags.find((a) => a.tag_uuid === item.label_uuid);

                    let width = 100;
                    let height = 100;

                    if (url?.tag_type === "I")
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          url={url}
                          type="I"
                          width={width}
                          height={height}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                    else if (url?.tag_type === "T")
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          item={item}
                          type="T"
                          width={width}
                          height={height}
                          url={url}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                  })
              : selectedImage.holder
                  ?.filter((a) => {
                    let value = deleteHolders?.filter((b) => a?._id === b?._id)
                      ?.length
                      ? false
                      : true;
                    console.log("value", deleteHolders, a, value);
                    return value;
                  })
                  ?.map((item) => {
                    let url = tags.find((a) => a.tag_uuid === item.label_uuid);
                    let coordinates = [100, 100];
                    let width = 100;
                    let height = 100;
                    console.log(item, url, tags);
                    if (url?.tag_type === "I")
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          url={url}
                          type="I"
                          coordinates={coordinates}
                          width={width}
                          height={height}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                    else if (url?.tag_type === "T")
                      return (
                        <Tag
                          switchBtn={switchBtn}
                          item={item}
                          type="T"
                          coordinates={coordinates}
                          width={width}
                          height={height}
                          url={url}
                          deleteHandler={() =>
                            setDeleteHolders((prev) => [...prev, item])
                          }
                        />
                      );
                  })}
          </div>
          <button
            type="button"
            className="downloadButton"
            style={{ position: "fixed" }}
            onClick={() => handlePng()}
          >
            Download
          </button>
          <button
            type="button"
            className="downloadButton"
            style={{ position: "fixed", left: "150px" }}
            onClick={() => submitHandler()}
          >
            Save
          </button>
          <div
            type="button"
            className={`uploadMsg ${uploadMsg ? "uploadActive" : ""}`}
          >
            Saved
          </div>
          <div className="tags_popup">
            <h1>Add Tags</h1>
            <select
              className="label_popup_input"
              style={{ width: "200px" }}
              value={data}
              onChange={onChangeHandler}
              multiple
            >
              {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
              <option value="none">None</option>
              {tags.map((cat) => (
                <option value={cat.tag_uuid}>{cat.tag_title}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setCustomHolders([
                  ...customHolders,
                  ...data.map((a) => ({ label_uuid: a })),
                ]);
                setData([]);
              }}
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="userOccasion">
            <div className="occasion_container">
              {baseImages
                .sort((a, b) => +a.sort_order - b.sort_order)
                .map((imgItem, index) => (
                  <div className="image_container">
                    <img
                      onClick={() => setSelectedImage(imgItem)}
                      src={imgItem.img_url ? imgItem.img_url : NoImage}
                    />
                  </div>
                ))}
            </div>
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
            />
            Add New
          </label>
        </>
      )}
      {selectedCropFile && popupCrop ? (
        <ImageUploadPopup
          file={selectedCropFile}
          onClose={() => setPopupCrop(null)}
          setSelectedFile={setSelectedFile}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default CustomImage;
const Tag = ({ url, type, width, height, deleteHandler, switchBtn, item }) => {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);

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
      resizeableEle.style.top = clientY + "px";
      resizeableEle.style.left = clientX + "px";
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
      resizeableEle.style.top = y + "px";
      resizeableEle.style.left = x + "px";
    };

    const onMouseUpSelectResize = (event) => {
      document.removeEventListener("mousemove", onMouseSelectResize);
    };

    // Add mouse down event listener
    if (switchBtn === "resize") {
      const resizerRight = refRight.current;
      resizerRight.addEventListener("mousedown", onMouseDownRightResize);
      const resizerTop = refTop.current;
      resizerTop.addEventListener("mousedown", onMouseDownTopResize);
      const resizerBottom = refBottom.current;
      resizerBottom.addEventListener("mousedown", onMouseDownBottomResize);
      const resizerLeft = refLeft.current;
      resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);
      return () => {
        resizerRight.removeEventListener("mousedown", onMouseDownRightResize);
        resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
        resizerBottom.removeEventListener("mousedown", onMouseDownBottomResize);
        resizerLeft.removeEventListener("mousedown", onMouseDownLeftResize);
      };
    } else if (switchBtn === "position") {
      const reposition = ref.current;
      reposition.addEventListener("mousedown", onMouseSelect);
      return () => reposition.removeEventListener("mousedown", onMouseSelect);
    }
  }, [switchBtn]);
  console.log(url);
  return type === "T" &&
    url?.text?.sort((a, b) => +a.sort_order - +b.sort_order)[index]?.text ? (
    <div
      ref={ref}
      className="resizeable"
      style={{
        // overflow: "visible",
        fontSize: width / 100 + "rem",
        overflow: "hidden",
        left: 100 + "px",
        top: 100 + "px",
        width: width + "px",
        height: height + "px",
        position: "absolute",
        color: item.text_color,
        fontFamily: item.fontFamily||"sans-serif",
      }}
    >
      <div
        style={{ cursor: "pointer", overflow: "visible" }}
        onClick={() =>
          switchBtn === "delete"
            ? deleteHandler()
            : setIndex(
                (prev) =>
                  (prev + 1) %
                  url.text.sort((a, b) => +a.sort_order - +b.sort_order).length
              )
        }
      >
        {url?.text.sort((a, b) => +a.sort_order - +b.sort_order)[index].text}
      </div>
      <div
        ref={refLeft}
        style={
          switchBtn === "resize"
            ? { width: `5px`, height: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-l"
      ></div>
      <div
        ref={refTop}
        style={
          switchBtn === "resize"
            ? { height: `5px`, width: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-t"
      ></div>
      <div
        ref={refRight}
        style={
          switchBtn === "resize" ? { width: `5px`, background: `#000` } : {}
        }
        className="resizer resizer-r"
      ></div>
      <div
        ref={refBottom}
        style={
          switchBtn === "resize"
            ? { height: `5px`, width: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-b"
      ></div>
    </div>
  ) : (
    <div
      ref={ref}
      className="resizeable"
      style={{
        cursor: "pointer",
        left: 100 + "px",
        top: 100 + "px",
        width: width + "px",
        height: height + "px",
        position: "absolute",
      }}
    >
      {url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)[index]
        ?.img_url ? (
        <img
          onClick={() =>
            switchBtn === "delete"
              ? deleteHandler()
              : setIndex(
                  (prev) =>
                    (prev + 1) %
                    url?.img_url?.sort((a, b) => +a.sort_order - +b.sort_order)
                      ?.length
                )
          }
          src={
            url.img_url.sort((a, b) => +a.sort_order - +b.sort_order)[index]
              ?.img_url
          }
          className="holders"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <></>
      )}

      <div
        ref={refLeft}
        style={
          switchBtn === "resize"
            ? { width: `5px`, height: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-l"
      ></div>
      <div
        ref={refTop}
        style={
          switchBtn === "resize"
            ? { height: `5px`, width: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-t"
      ></div>
      <div
        ref={refRight}
        style={
          switchBtn === "resize" ? { width: `5px`, background: `#000` } : {}
        }
        className="resizer resizer-r"
      ></div>
      <div
        ref={refBottom}
        style={
          switchBtn === "resize"
            ? { height: `5px`, width: "100%", background: `#000` }
            : {}
        }
        className="resizer resizer-b"
      ></div>
    </div>
  );
};
