import React, { useState, useEffect } from "react";
import SideBar from "../../components/Sidebar/SideBar";
import { MdDelete } from "react-icons/md";

import "./occasion.css";
import axios from "axios";
import { v4 as uuid } from "uuid";
import Compressor from "compressorjs";
import { useNavigate } from "react-router-dom";
import { Cancel, DeleteOutline, Image } from "@mui/icons-material";
import Header from "../../components/Sidebar/Header";

const Occasion = () => {
  const [occasionsData, setOccasionsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const navigate = useNavigate();
  const [pictureUploadPopup, setPictureUploadPopup] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);

  const [popup, setPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
  const getOccasionData = async () => {
    const response = await axios({
      method: "get",
      url: "/occasions/getOccasions",
    });
    console.log(response);
    if (response.data.success) setOccasionsData(response.data.result);
  };
  const deleteOccasionData = async (data) => {
    console.log(data);
    const response = await axios({
      method: "delete",
      data: deleteItem,
      url: "/occasions/deleteOccasions",
    });

    console.log(response);
    if (response.data.success) getOccasionData();
  };
  useEffect(() => {
    getOccasionData();
  }, []);
  const getCategoriesData = async () => {
    const response = await axios({
      method: "get",
      url: "/categories/getCategories",
    });
    console.log(response);
    if (response.data.success) setCategoriesData(response.data.result);
  };
  useEffect(() => {
    getCategoriesData();
  }, []);
  return (
    <>
      <SideBar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div className="occasion">
          <h1>Occasion</h1>
          <div style={{ width: "80%" }}>
            <button
              className="add_button"
              type="button"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add Occasion
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>SR. No</th>
                <th>Title</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {occasionsData.length ? (
                occasionsData.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item?.title || "-"}</td>
                    <td>{item?.sort_order || "-"}</td>
                    <td>{item?.status}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="edit_button"
                        type="button"
                        onClick={() => {
                          setPopupInfo({ type: "edit", item });
                          setPopup(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="edit_button"
                        type="button"
                        onClick={() => {
                          navigate(`/AdminOccasion/${item.occ_uuid}`);
                          setPopup(true);
                        }}
                      >
                        Images
                      </button>
                      <button
                        className="edit_button"
                        type="button"
                        onClick={() => {
                          setPictureUploadPopup(item);
                        }}
                      >
                        Posters
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <DeleteOutline onClick={() => setDeleteItem(item)}/>
                      
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No Content
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {deleteItem ? (
            <ConfirmPopup
              close={() => setDeleteItem(null)}
              deleteHandler={deleteOccasionData}
            />
          ) : (
            ""
          )}

          {popup ? (
            <Popup
              popupInfo={popupInfo}
              close={() => {
                setPopup(false);
                setPopupInfo({});
              }}
              setOccasionsData={setOccasionsData}
              categoriesData={categoriesData}
            />
          ) : (
            ""
          )}
        </div>
      </div>
      {pictureUploadPopup ? (
        <PicturesPopup
          onSave={() => setPictureUploadPopup(false)}
          popupInfo={pictureUploadPopup}
          getItem={getOccasionData}
        />
      ) : (
        ""
      )}
    </>
  );
};
const Popup = ({ popupInfo, setOccasionsData, close, categoriesData }) => {
  const [data, setData] = useState({});
  // const [posters, setPosters] = useState([]);
  // const [postersUpdate, setPostersUpdate] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (popupInfo.type === "edit") {
      setData(
        popupInfo?.item?.occ_date
          ? {
              ...popupInfo.item,
            }
          : popupInfo?.item
      );
      // setPosters(popupInfo?.item?.posters);
    } else {
      let time = new Date();
      setData({
        occ_uuid: uuid(),
        status: "1",
        expiry: time.getTime(),
        occ_date: time.getTime(),
      });
    }
  }, []);

  const submitHandler = async () => {
    let obj = data;
    if (obj.thumbnail) {
      let url = await axios.get("s3url");
      url = url.data.url;

      const result = await axios({
        url,
        method: "put",
        headers: { "Content-Type": "multipart/form-data" },
        data: obj?.thumbnail,
      });
      if (result.status === 200) {
        let thumbnail_url = url.split("?")[0];
        // bodyFormData.append("image", fileData);
        console.log("thumbnail", thumbnail_url);
        obj = { ...obj, thumbnail_url };
      }
    }
    // let postersData = [];
    // for (let item of posters) {
    //   console.log(item);
    //   if (item.img) {
    //     const mainThumbnailURL = await axios({
    //       url: "/s3Url",
    //       method: "get",
    //     });
    //     let UploadThumbnailURL = mainThumbnailURL.data.url;

    //     axios({
    //       url: UploadThumbnailURL,
    //       method: "put",
    //       headers: { "Content-Type": "multipart/form-data" },
    //       data: obj.thumbnail,
    //     })
    //       .then((response) => {
    //         console.log(response);
    //       })
    //       .catch((err) => console.log(err));
    //     let url = UploadThumbnailURL.split("?")[0];
    //     // bodyFormData.append("image", fileData);
    //     // bodyFormData.append("thumbnail", thumbnailData);
    //     postersData.push({ ...item, url });
    //   } else {
    //     postersData.push(item);
    //   }
    // }
    // obj = { ...obj, posters: postersData };
    console.log(obj);
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/occasions/putOccasion",
        data: obj,
      });
      if (response.data.success) {
        setOccasionsData((prev) =>
          prev?.map((i) => (i.occ_uuid === data.occ_uuid ? data : i))
        );
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/occasions/postOccasion",
        data: obj,
      });
      if (response.data.success) {
        setOccasionsData((prev) => [...prev, data]);
      }
      close();
    }
  };
  useEffect(() => {
    if (!data.thumbnail) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(data.thumbnail);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [data]);
  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      // setSelectedFile(undefined)
      return;
    }
    handleCompressedUpload(e);
    // setData(e.target.files[0])
  };
  // const onSelectFiles = (e) => {
  //   if (!e.target.files || e.target.files.length === 0) {
  //     // setSelectedFile(undefined)
  //     return;
  //   }
  //   setPosters((prev) => [
  //     ...(prev || []),
  //     {
  //       img: e.target.files[0],

  //       id: uuid(),
  //     },
  //   ]);
  //   setPostersUpdate((prev) => !prev);
  //   // setData(e.target.files[0])
  // };
  // useEffect(() => {
  //   setPosters((prev) =>
  //     prev?.map((a) => ({
  //       ...a,
  //       temp_url: a.img ? URL.createObjectURL(a.img) : a.temp_url || "",
  //     }))
  //   );
  // }, [postersUpdate]);
  const handleCompressedUpload = (e) => {
    const image = e.target.files[0];
    new Compressor(image, {
      quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        const id = uuid();
        let thumbnailData = new File(
          [compressedResult],
          id + "." + (compressedResult.name.split(".")[1] || "png")
        );
        console.log(thumbnailData);
        setData({ ...data, thumbnail: thumbnailData });
      },
    });
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
          setData({
            ...data,
            posters: [...(data?.posters || []), thumbnailData],
          });
        },
      });
    }
  };
  const onChangeHandler = (e) => {
    let catData = data?.cat_uuid || [];
    let options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    for (let i of options) {
      if (catData.filter((a) => a === i).length)
        catData = catData.filter((a) => a !== i);
      else
        catData = [
          ...catData,
          categoriesData.find((a) => a.cat_uuid == i)?.cat_uuid,
        ];
    }
    // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
    console.log(options, catData);

    setData({ ...data, cat_uuid: catData });
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit" ? data?.title || "-" : "New Occasion"}
          </h3>
          <div className="exit_btn" onClick={close}>
            X
          </div>
        </div>
        <div
          className="popup_body"
          style={{ maxHeight: "70vh", overflowY: "scroll" }}
        >
          <div className="row">
            <div>
              Title
              <input
                placeholder="Title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </div>
            <div>
              Sort Order
              <input
                placeholder="Sort Order"
                value={data.sort_order}
                onChange={(e) =>
                  setData({
                    ...data,
                    sort_order: e.target.value.replace(/\D/, ""),
                  })
                }
              />
            </div>
          </div>
          <div className="row">
            <div>
              Status
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
              >
                <option value="1">1</option>
                <option value="0">0</option>
              </select>
            </div>
            <div>
              Date
              <input
                type="date"
                placeholder="Date"
                value={
                  data.occ_date
                    ? "yy-mm-dd"
                        .replace(
                          "mm",
                          (
                            "00" +
                            (new Date(data.occ_date)?.getMonth() + 1).toString()
                          ).slice(-2)
                        )
                        .replace(
                          "yy",
                          (
                            "0000" +
                            new Date(data.occ_date)?.getFullYear().toString()
                          ).slice(-4)
                        )
                        .replace(
                          "dd",
                          (
                            "00" + new Date(data.occ_date)?.getDate().toString()
                          ).slice(-2)
                        )
                    : ""
                }
                onChange={(e) =>
                  setData({
                    ...data,
                    occ_date: new Date(
                      e.target.value + " 00:00:00 AM"
                    ).getTime(),
                  })
                }
              />
            </div>
          </div>

          <div className="row">
            <div>
              Category
              <select
                className="label_popup_input"
                style={{ width: "200px" }}
                value={data.cat_uuid}
                onChange={onChangeHandler}
                multiple
              >
                {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
                {categoriesData.map((cat) => (
                  <option value={cat.cat_uuid}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div>
              Expiry
              <input
                type="date"
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    expiry: new Date(e.target.value + " 00:00:00 AM").getTime(),
                  }))
                }
                value={
                  data.expiry
                    ? "yy-mm-dd"
                        .replace(
                          "mm",
                          (
                            "00" +
                            (new Date(data.expiry)?.getMonth() + 1).toString()
                          ).slice(-2)
                        )
                        .replace(
                          "yy",
                          (
                            "0000" +
                            new Date(data.expiry)?.getFullYear().toString()
                          ).slice(-4)
                        )
                        .replace(
                          "dd",
                          (
                            "00" + new Date(data.expiry)?.getDate().toString()
                          ).slice(-2)
                        )
                    : ""
                }
                className="searchInput"
              />
            </div>
          </div>
          <div className="row">
            <div>
              Thumbnail
              <input
                type="file"
                onChange={(e) =>
                  setData((prev) => ({ ...prev, thumbnail: e.target.files[0] }))
                }
                accept="image/png, image/jpeg"
              />
              <br />
              <img
                className="image"
                src={preview || data.thumbnail_url}
                alt="NoImage"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
          {/* <div>
            Posters
            <input
              type="file"
              onChange={onSelectFiles}
              accept="image/png, image/jpeg"
              multiple
            />
            <br />
            {posters?.length
              ? data?.posters?.map((a) => (
                  <img
                    className="image"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "contain",
                    }}
                    src={a.url}
                    alt={a.temp_url}
                  />
                ))
              : ""}
          </div> */}
          <button onClick={submitHandler} type="button" className="add_button">
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Occasion;
const ConfirmPopup = ({ close, deleteHandler }) => {
  const submitHandler = async () => {
    deleteHandler();
    close();
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header"></div>
        <div className="popup_body">
          <h2>Confirm Delete?</h2>
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
      </div>
    </div>
  );
};
function PicturesPopup({ onSave, popupInfo, getItem }) {
  const [data, setdata] = useState({});
  const [images, setImages] = useState();
  const [deleteImages, setDeletedImages] = useState([]);

  useEffect(() => {
    setdata(popupInfo || {});
  }, [popupInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    let itemData = {
      occ_uuid: data?.occ_uuid,
      posters: data?.posters,
    };
    let url = await axios.get("s3url");
    url = url.data.url;

    const result = await axios({
      url,
      method: "put",
      headers: { "Content-Type": "multipart/form-data" },
      data: images,
    });
    if (result.status === 200) {
      let image_url = { url: url?.split("?")[0], id: uuid() };
      itemData = {
        ...itemData,
        posters: itemData?.posters?.length
          ? [...itemData?.posters, image_url]
          : [image_url],
      };
    }

    const response = await axios({
      method: "put",
      url: "/occasions/putOccasion",
      data: itemData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getItem();
      onSave();
    }
  };
  const deleteSubmitHandler = async (e) => {
    e.preventDefault();
    let itemData = {
      occ_uuid: data?.occ_uuid,
      posters: data.posters.filter(
        (a) => !deleteImages.find((b) => b === a?.id)
      ),
    };

    const response = await axios({
      method: "put",
      url: "/occasions/putOccasion",
      data: itemData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getItem();
      onSave();
    }
  };

  return (
    <div className="overlay">
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
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Posters</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label
                    htmlFor="upload_image"
                    className="selectLabel file_upload"
                  >
                    <h2>
                      <Image />
                      Upload Image
                    </h2>

                    <input
                      type="file"
                      id="upload_image"
                      name="route_title"
                      className="numberInput"
                      style={{ display: "none" }}
                      onChange={
                        (e) => setImages(e.target.files[0])
                        // setImages((prev) =>
                        //   prev.length
                        //     ? [...prev, ...e.target.files]
                        //     : [...e.target.files]
                        // )
                      }
                      accept="image/*"
                      maxLength={60}
                    />
                  </label>
                  {images ? (
                    <div className="imageContainer">
                      <img
                        src={URL.createObjectURL(images)}
                        className="previwImages"
                        alt="yourimage"
                      />
                      <button
                        onClick={() => setImages(false)}
                        className="closeButton"
                        style={{
                          fontSize: "20px",
                          right: "5px",
                          padding: "0 10px",
                          width: "20px",
                          height: "20px",
                        }}
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="formGroup">
                <div className="row">
                  {data?.posters?.length ? (
                    data?.posters.map((img) => (
                      <div
                        className="imageContainer"
                        style={
                          deleteImages.find((b) => b === img?.id)
                            ? { border: "1px solid red" }
                            : {}
                        }
                      >
                        <img
                          src={img?.url}
                          alt="NoImage"
                          className="previwImages"
                        />
                        {deleteImages.find((b) => b === img?.id) ? (
                          <button
                            onClick={() =>
                              setDeletedImages((prev) =>
                                prev.filter((b) => b !== img?.id)
                              )
                            }
                            className="closeButton"
                            style={{
                              fontSize: "20px",
                              right: "5px",
                              padding: "0 10px",
                              width: "20px",
                              height: "20px",
                            }}
                            type="button"
                          >
                            <Cancel fontSize="5px" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setDeletedImages((prev) => [...prev, img?.id])
                            }
                            className="closeButton"
                            style={{
                              fontSize: "20px",
                              right: "5px",
                              padding: "0 10px",
                              width: "20px",
                              height: "20px",
                            }}
                            type="button"
                          >
                            <DeleteOutline fontSize="5px" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <h1>No Image Uploaded yet</h1>
                  )}
                </div>
              </div>

              {images ? (
                <button type="submit" className="submit">
                  Upload Image
                </button>
              ) : (
                ""
              )}
              {deleteImages.length ? (
                <button
                  type="button"
                  className="submit"
                  onClick={deleteSubmitHandler}
                >
                  Save
                </button>
              ) : (
                ""
              )}
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
