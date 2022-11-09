import React, { useState, useEffect, useMemo } from "react";
import "./category.css";
import SideBar from "../../components/Sidebar/SideBar";
import Compressor from "compressorjs";

import axios from "axios";
import { v4 as uuid } from "uuid";

import Header from "../../components/Sidebar/Header";

import { ArrowDropDown, ArrowDropUp, DeleteOutline } from "@mui/icons-material";

const Category = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");

  const getCategoriesData = async (data) => {
    const response = await axios({
      method: "get",
      url: "/categories/getCategories",
      data,
    });
    console.log(response);
    if (response.data.success) setCategoriesData(response.data.result || []);
  };
  const deleteCategoriesData = async (data) => {
    const response = await axios({
      method: "delete",
      data: deleteItem,
      url: "/categories/deleteCategory",
    });
    console.log(deleteItem);
    if (response.data.success) getCategoriesData();
  };
  useEffect(() => {
    getCategoriesData();
  }, []);
  const filterItemsData = useMemo(
    () =>
      categoriesData
        .filter((a) => a.title)
        .filter(
          (a) =>
            !filterTitle ||
            a.title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        ),
    [filterTitle, categoriesData]
  );
  return (
    <>
      <SideBar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div id="heading">
          <h2>Tags</h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <input
              type="text"
              onChange={(e) => setFilterTitle(e.target.value)}
              value={filterTitle}
              placeholder="Search Tag Title..."
              className="searchInput"
            />

            <div>Total Items: {filterItemsData.length}</div>

            <button
              className="item-sales-search"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div className="table-container-user item-sales-container">
          <Table
            itemsDetails={filterItemsData}
            setPopupInfo={setPopupInfo}
            setDeleteItem={setDeleteItem}
            setPopup={setPopup}
          />
        </div>
      </div>
      {/* <div className="item-sales-container orders-report-container">
        <div className="occasion">
          <h1>Categories</h1>
          <div style={{ width: "80%" }}>
            <button
              className="add_button"
              type="button"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add Category
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
              {categoriesData.length ? (
                categoriesData.map((item, i) => (
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
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <DeleteOutline onClick={() => setDeleteItem(item)} />
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
        </div>
      </div> */}
          {deleteItem ? (
            <ConfirmPopup
              close={() => setDeleteItem(null)}
              deleteHandler={deleteCategoriesData}
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
              setCategoriesData={setCategoriesData}
            />
          ) : (
            ""
          )}
    </>
  );
};
function Table({
  itemsDetails,

  setPopupInfo,
  setDeleteItem,

  setPopup,
}) {
  const [items, setItems] = useState("sort_order");
  const [order, setOrder] = useState("");

  console.log(items);
  return (
    <table
      className="user-table"
      style={{ maxWidth: "100vw", height: "fit-content", overflowX: "scroll" }}
    >
      <thead>
        <tr>
          <th>S.N</th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>Category Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("title");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("title");
                    setOrder("desc");
                  }}
                >
                  <ArrowDropDown className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>Sort Order</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("sort_order");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("sort_order");
                    setOrder("desc");
                  }}
                >
                  <ArrowDropDown className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>
          <th colSpan={3}>
            <div className="t-head-element">
              <span>Status</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("status");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("status");
                    setOrder("desc");
                  }}
                >
                  <ArrowDropDown className="sort-down sort-button" />
                </button>
              </div>
            </div>
          </th>

          <th colSpan={2} style={{ width: "30vw" }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="tbody">
        {itemsDetails
          .sort((a, b) =>
            order === "asc"
              ? typeof a[items] === "string"
                ? a[items]?.localeCompare(b[items])
                : a[items] - b[items]
              : typeof a[items] === "string"
              ? b[items]?.localeCompare(a[items])
              : b[items] - a[items]
          )
          ?.map((item, i) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td colSpan={3}>{item.title}</td>
              <td colSpan={3}>{item?.sort_order}</td>
              <td colSpan={3}>{item?.status}</td>

              <td>
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
              </td>

              <td
                colSpan={1}
                onClick={(e) => {
                  e.stopPropagation();

                  setDeleteItem(item);
                }}
              >
                <DeleteOutline />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
const Popup = ({ popupInfo, setCategoriesData, close }) => {
  const [data, setData] = useState({});
  const [preview, setPreview] = useState();
  useEffect(
    () =>
      popupInfo.type === "edit"
        ? setData(popupInfo.item)
        : setData({ cat_uuid: uuid(), status: "1", square: 0 }),
    []
  );
  const submitHandler = async () => {
    let obj = data;
    if (!obj.thumbnail_url && obj.thumbnail) {
      const mainThumbnailURL = await axios({ url: "/s3Url", method: "get" });
      let UploadThumbnailURL = mainThumbnailURL.data.url;

      axios({
        url: UploadThumbnailURL,
        method: "put",
        headers: { "Content-Type": "multipart/form-data" },
        data: obj.thumbnail,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => console.log(err));
      let thumbnail_url = UploadThumbnailURL.split("?")[0];
      // bodyFormData.append("image", fileData);
      // bodyFormData.append("thumbnail", thumbnailData);
      obj = { ...obj, thumbnail_url };
    }
    console.log(obj);
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/categories/putCategory",
        data: obj,
      });
      if (response.data.success) {
        setCategoriesData((prev) =>
          prev.map((i) => (i.cat_uuid === data.cat_uuid ? data : i))
        );
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/categories/postCategory",
        data: obj,
      });
      if (response.data.success) {
        setCategoriesData((prev) => [...prev, data]);
        close();
      }
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
  const handleCompressedUpload = (e) => {
    const image = e.target.files[0];
    new Compressor(image, {
      quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        const id = uuid();
        let thumbnailData = new File([compressedResult], id);
        console.log(thumbnailData);
        setData({ ...data, thumbnail: thumbnailData });
      },
    });
  };

  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit" ? data?.title || "-" : "New Category"}
          </h3>
          <div className="exit_btn" onClick={close}>
            X
          </div>
        </div>
        <div className="popup_body">
          <div>
            Title
            <input
              placeholder="Title"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          {/* <div>
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
              alt="NoImage"
            />
          </div> */}
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
            Thumbnail Style
            <select
              value={data.square}
              onChange={(e) => setData({ ...data, square: e.target.value })}
            >
              <option value="1">Square</option>
              <option value="0">Circle</option>
            </select>
          </div>
          <button onClick={submitHandler} type="button" className="add_button">
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Category;
const ConfirmPopup = ({ close, deleteHandler }) => {
  const submitHandler = async () => {
    deleteHandler();
    close();
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3></h3>
        </div>
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
