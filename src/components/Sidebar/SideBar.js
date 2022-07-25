import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import Compressor from "compressorjs";
import { v4 as uuid } from "uuid";
import axios from "axios";
const SideBar = () => {
  const [posterPopup, setPosterPopup] = useState(false);
  const [posters, setPosters] = useState([]);
  const [preview, setPreview] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!posters.length) {
      setPreview(undefined);
      return;
    }
    let previewData = [];
    let ImageData = [];
    posters.map((a, i) => {
      let time = new Date();
      let sort_order =
        data.length > 1
          ? +data.map((a) => a.sort_order).reduce((a, b) => Math.max(a, b)) + 1
          : data.length
          ? data[0]?.sort_order + 1
          : 1;
      previewData.push({ img: URL.createObjectURL(a), sort_order });
      ImageData.push({
        img: a,
        sort_order,
        expiry: "yy-mm-dd"
          .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
          .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
          .replace("dd", ("00" + time?.getDate().toString()).slice(-2)),
      });
    });
    setData(ImageData);
    setPreview(previewData);
  }, [posters]);
  const onSelectFiles = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      // setSelectedFile(undefined)
      return;
    }
    setPosters((prev) => [...(prev || []), ...e.target.files]);
    // setData(e.target.files[0])
  };
  const handleCompressedUploads = (e) => {
    const images = e.target.files;
    for (let image of images) {
      new Compressor(image, {
        quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
        success: (compressedResult) => {
          const id = uuid();
          let thumbnailData = new File(
            [compressedResult],
            id + "." + (compressedResult.name.split(".")[1] || "png")
          );
          console.log(thumbnailData);
          setPosters([...(posters || []), thumbnailData]);
        },
      });
    }
  };
  const submitHandler = async (temp, user_category_uuid) => {
    for (let selectedFile of data) {
      // e.preventDefault()
      // let thumbnail = await resizeFile(selectedFile)
      var bodyFormData = new FormData();
      const id = uuid();
      let fileData = new File(
        [selectedFile.img],
        id + "." + (selectedFile.img.name.split(".")[1] || "png")
      );

      let obj = {
        poster: fileData,
      };
      bodyFormData.append("posters", fileData);
      bodyFormData.append("expiry", selectedFile.expiry);
      bodyFormData.append("sort_order", selectedFile.sort_order);

      bodyFormData.append("value", JSON.stringify(obj));
      const response = await axios({
        method: "post",
        url: "/posters/postPosters",
        data: bodyFormData,
      });
      console.log(obj, response);
      if (response.data.success) {
        setPosterPopup(false);
      }
    }
  };
  return (
    <>
      <div className="sidebar">
        <NavLink
          to="/home"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/occasion"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Occasion
        </NavLink>
        <NavLink
          to="/category"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Category
        </NavLink>
        <NavLink
          to="/tags"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Tags
        </NavLink>
        <NavLink
          to="/user_data"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          Users
        </NavLink>
        <NavLink
          to="/user_category"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
        >
          User Category
        </NavLink>
        <NavLink
          to="#"
          className={(isActive) => "nav-link" + (isActive ? " selected" : "")}
          onClick={() => setPosterPopup(true)}
        >
          Posters
        </NavLink>
      </div>
      {posterPopup ? (
        <div className="popup_bg">
          <div className="popup">
            <div className="popup_header">
              <h3>Posters</h3>
              <div className="exit_btn" onClick={() => setPosterPopup(false)}>
                X
              </div>
            </div>
            <div className="popup_body">
              <div>
                Posters
                <input
                  type="file"
                  onChange={onSelectFiles}
                  accept="image/png, image/jpeg"
                  multiple
                />
                <br />
                {preview?.length
                  ? preview?.map((a, i) => (
                      <div>
                        <img className="image" src={a.img} alt="No Image" />
                        <div>
                          Expiry
                          <input
                            type="date"
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((b, index) =>
                                  index === i
                                    ? { ...b, expiry: e.target.value }
                                    : b
                                )
                              )
                            }
                            value={data[i].expiry}
                            className="searchInput"
                          />
                        </div>
                      </div>
                    ))
                  : ""}
              </div>
              <button
                onClick={submitHandler}
                type="button"
                className="add_button"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default SideBar;
