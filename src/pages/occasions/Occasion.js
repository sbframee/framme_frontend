import React, { useState, useEffect } from "react";
import SideBar from "../../components/Sidebar/SideBar";
import { MdDelete } from "react-icons/md";

import "./occasion.css";
import axios from "axios";
import { v4 as uuid } from "uuid";
import Compressor from "compressorjs";
import { useNavigate } from "react-router-dom";

const Occasion = () => {
  const [occasionsData, setOccasionsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const navigate = useNavigate();
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
      {" "}
      <SideBar />
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
                <tr>
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
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <MdDelete
                      style={{ backgroundColor: "red" }}
                      className="edit_button"
                      type="button"
                      onClick={() => setDeleteItem(item)}
                    >
                      Edit
                    </MdDelete>
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
      </div>{" "}
    </>
  );
};
const Popup = ({ popupInfo, setOccasionsData, close, categoriesData }) => {
  const [data, setData] = useState({});
  const [posters, setPosters] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (popupInfo.type === "edit") {
      setData(
        popupInfo?.item?.occ_date
          ? {
              ...popupInfo.item,
              occ_date: "yy-mm-dd"
                ?.replace(
                  "mm",
                  (
                    "00" +
                    (
                      new Date(popupInfo?.item?.occ_date)?.getMonth() + 1
                    )?.toString()
                  )?.slice(-2)
                )
                ?.replace(
                  "yy",
                  (
                    "0000" +
                    new Date(popupInfo?.item?.occ_date)
                      ?.getFullYear()
                      ?.toString()
                  )?.slice(-4)
                )
                ?.replace(
                  "dd",
                  (
                    "00" +
                    new Date(popupInfo?.item?.occ_date)?.getDate()?.toString()
                  )?.slice(-2)
                ),
            }
          : popupInfo?.item
      );
    } else {
      let time = new Date();
      let curTime = "yy-mm-dd"
        .replace("mm", ("00" + (time?.getMonth() + 1).toString()).slice(-2))
        .replace("yy", ("0000" + time?.getFullYear().toString()).slice(-4))
        .replace("dd", ("00" + time?.getDate().toString()).slice(-2));
      setData({ occ_uuid: uuid(), status: "1", expiry: curTime });
    }
  }, []);

  const submitHandler = async () => {
    var bodyFormData = new FormData();
    console.log("thumbnail", data.thumbnail);
    bodyFormData.append("thumbnail", data.thumbnail);
    bodyFormData.append(
      "value",
      JSON.stringify(
        data?.occ_date
          ? {
              ...data,
              occ_date: new Date(data?.occ_date).getTime(),
              expiry: new Date(data?.expiry).getTime(),
            }
          : data
      )
    );
    console.log(await bodyFormData.getAll("value"));
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/occasions/putOccasion",
        data: bodyFormData,
      });
      if (response.data.success) {
        setOccasionsData((prev) =>
          prev?.map((i) => (i.occ_uuid === data.occ_uuid ? data : i))
        );
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/occasions/postOccasion",
        data: bodyFormData,
      });
      if (response.data.success) {
        setOccasionsData((prev) => [...prev, data]);
      }
    }
    for (let selectedFile of posters) {
      // e.preventDefault()
      // let thumbnail = await resizeFile(selectedFile)
      bodyFormData = new FormData();
      const id = uuid();
      let fileData = new File(
        [selectedFile],
        id + "." + (selectedFile.name.split(".")[1] || "png")
      );

      let obj = {
        occ_uuid: data.occ_uuid,
        poster: fileData,
      };
      bodyFormData.append("posters", fileData);

      bodyFormData.append("value", JSON.stringify(obj));
      const response = await axios({
        method: "post",
        url: "/occasions/putOccasionPosters",
        data: bodyFormData,
      });
      console.log(obj, response);
      if (response.data.success) {
      }
    }
    close();
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
  const onSelectFiles = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      // setSelectedFile(undefined)
      return;
    }
    setPosters((prev) => [...(prev.poster || []), ...e.target.files]);
    // setData(e.target.files[0])
  };

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
    <div className="popup_bg">
      <div className="popup">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit" ? data?.title || "-" : "New Occasion"}
          </h3>
          <div className="exit_btn" onClick={close}>
            X
          </div>
        </div>
        <div className="popup_body">
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
                value={data.occ_date}
                onChange={(e) => setData({ ...data, occ_date: e.target.value })}
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
                    expiry: e.target.value,
                  }))
                }
                value={data.expiry}
                className="searchInput"
              />
            </div>
          </div>
          <div className="row">
            <div>
              Thumbnail
              <input
                type="file"
                onChange={onSelectFile}
                accept="image/png, image/jpeg"
              />
              <br />
              <img
                className="image"
                src={preview || data.thumbnail_url}
                alt="No Image"
              />
            </div>
          </div>
          <div>
            Posters
            <input
              type="file"
              onChange={onSelectFiles}
              accept="image/png, image/jpeg"
              multiple
            />
            <br />
            {console.log(data)}
            {posters?.length
              ? data?.posters?.map((a) => (
                  <img className="image" src={a} alt="No Image" />
                ))
              : ""}
          </div>
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
    <div className="popup_bg">
      <div className="popup">
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
