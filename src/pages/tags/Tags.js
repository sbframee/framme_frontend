import React, { useState, useEffect, useMemo } from "react";
import "./tags.css";
import SideBar from "../../components/Sidebar/SideBar";
import { ArrowDropDown, ArrowDropUp, DeleteOutline } from "@mui/icons-material";
import axios from "axios";
import { v4 as uuid } from "uuid";
import Header from "../../components/Sidebar/Header";
const Tags = () => {
  const [tagsData, setTagsData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");

  const getTagsData = async () => {
    const response = await axios({ method: "get", url: "/tags/getTags" });
    console.log(response);
    if (response.data.success) setTagsData(response.data.result);
  };
  const deleteTagData = async (data) => {
    const response = await axios({
      method: "delete",
      data: deleteItem,
      url: "/tags/deleteTags",
    });
    console.log(response);
    if (response.data.success) getTagsData();
  };
  useEffect(() => {
    getTagsData();
  }, []);
  const filterItemsData = useMemo(
    () =>
      tagsData
        .filter((a) => a.tag_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        ),
    [filterTitle, tagsData]
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
        <div className="tags">
          <h1>Tags</h1>
          <div style={{ width: "80%" }}>
            <button
              className="add_button"
              type="button"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add Tags
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>SR. No</th>
                <th>Title</th>
                <th>Type</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {tagsData.length ? (
                tagsData.map((item, i) => (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{item?.tag_title || "-"}</td>
                    <td>
                      {item?.tag_type === "I"
                        ? "Image"
                        : item.tag_type === "T"
                        ? "Text"
                        : "-"}
                    </td>

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
          deleteHandler={deleteTagData}
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
          setTagsData={setTagsData}
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
              <span>Tag Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("tag_title");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("tag_title");
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
              <span>Type</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("tag_type");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("tag_type");
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
              <td colSpan={3}>{item.tag_title}</td>
              <td colSpan={3}>
                {" "}
                {item?.tag_type === "I"
                  ? "Image"
                  : item.tag_type === "T"
                  ? "Text"
                  : "-"}
              </td>

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
const Popup = ({ popupInfo, setTagsData, close }) => {
  const [data, setData] = useState({});
  useEffect(
    () =>
      popupInfo.type === "edit"
        ? setData(popupInfo.item)
        : setData({ tag_uuid: uuid(), tag_type: "T", min: "0", max: "1" }),
    []
  );
  console.log(data);
  const submitHandler = async () => {
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/tags/putTags",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setTagsData((prev) =>
          prev.map((i) => (i.tag_uuid === data.tag_uuid ? data : i))
        );
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/tags/postTags",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setTagsData((prev) => [...prev, data]);
        close();
      }
    }
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit" ? data?.tag_title || "-" : "New Tags"}
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
              value={data.tag_title}
              onChange={(e) => setData({ ...data, tag_title: e.target.value })}
            />
          </div>
          <div>
            Minimum
            <input
              placeholder="Min"
              value={data.min}
              onChange={(e) =>
                setData({ ...data, min: e.target.value.replace(/\D/, "") })
              }
            />
          </div>
          <div>
            Maximum
            <input
              placeholder="Max"
              value={data.max}
              onChange={(e) =>
                setData({ ...data, max: e.target.value.replace(/\D/, "") })
              }
            />
          </div>
          <div>
            Type
            <select
              value={data.tag_type}
              onChange={(e) => setData({ ...data, tag_type: e.target.value })}
            >
              <option value="T">Text</option>
              <option value="I">Image</option>
            </select>
          </div>
          <button
            onClick={submitHandler}
            type="button"
            className="item-sales-search"
          >
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Tags;
const ConfirmPopup = ({ close, deleteHandler }) => {
  const submitHandler = async () => {
    deleteHandler();
    close();
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_body">
          <h2>Confirm Delete?</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "30px",
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
