import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import SideBar from "../../components/Sidebar/SideBar";
import { v4 as uuid } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../components/Sidebar/Header";
import { ArrowDropDown, ArrowDropUp, DeleteOutline } from "@mui/icons-material";

const UserCategory = () => {
  const [usersData, setUsersData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [subCategoryPopup, setSubCategoryPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
  const [filterTitle, setFilterTitle] = useState("");

  const getUsersData = async () => {
    const response = await axios({
      method: "get",
      url: "/userCategory/getUserCategory",
    });
    console.log(response);
    if (response.data.success) setUsersData(response.data.result);
  };
  useEffect(() => {
    getUsersData();
  }, []);
  const filterItemsData = useMemo(
    () =>
      usersData
        .filter((a) => a.user_category_title)
        .filter(
          (a) =>
            !filterTitle ||
            a.user_category_title
              .toLocaleLowerCase()
              .includes(filterTitle.toLocaleLowerCase())
        ),
    [filterTitle, usersData]
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
            setSubCategoryPopup={setSubCategoryPopup}
            setPopup={setPopup}
          />
        </div>
      </div>
      {/* <div className="item-sales-container orders-report-container">
        <div className="tags">
          <h1>Users Categories</h1>
          <div style={{ width: "80%" }}>
            <button
              className="add_button"
              type="button"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add User Category
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>SR. No</th>
                <th>User Category Name</th>

                <th colSpan={2} style={{ textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {usersData.length ? (
                usersData.map((item, i) => (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{item?.user_category_title || "-"}</td>

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
      {popup ? (
        <Popup
          popupInfo={popupInfo}
          close={() => {
            setPopup(false);
            setPopupInfo({});
          }}
          setUsersData={setUsersData}
        />
      ) : (
        ""
      )}
      {subCategoryPopup ? (
        <SubCategory
          user_category_uuid={subCategoryPopup}
          close={() => {
            setSubCategoryPopup(false);
          }}
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
  setSubCategoryPopup,

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
              <span>User Category Title</span>
              <div className="sort-buttons-container">
                <button
                  onClick={() => {
                    setItems("user_category_title");
                    setOrder("asc");
                  }}
                >
                  <ArrowDropUp className="sort-up sort-button" />
                </button>
                <button
                  onClick={() => {
                    setItems("user_category_title");
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
              <td colSpan={3}>{item.user_category_title}</td>

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

              <td colSpan={1}>
                <button
                  className="edit_button"
                  type="button"
                  onClick={() => {
                    setSubCategoryPopup(item.user_category_uuid);
                  }}
                >
                  Sub Categories
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
export default UserCategory;
const Popup = ({ popupInfo, setUsersData, close }) => {
  const [data, setData] = useState({});
  useEffect(
    () =>
      popupInfo.type === "edit"
        ? setData(popupInfo.item)
        : setData({ user_category_uuid: uuid(), tag_type: "T" }),
    []
  );
  const submitHandler = async () => {
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/userCategory/putUserCategory",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setUsersData((prev) =>
          prev.map((i) =>
            i.user_category_uuid === data.user_category_uuid ? data : i
          )
        );
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/userCategory/postUserCategory",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setUsersData((prev) => [...prev, data]);
        close();
      }
    }
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit"
              ? data?.user_category_title || "-"
              : "New Tags"}
          </h3>
          <div className="exit_btn" onClick={close}>
            <getUserSubCategory />
          </div>
        </div>
        <div className="popup_body">
          <div>
            Category Name
            <input
              placeholder="Category Name"
              value={data.user_category_title}
              onChange={(e) =>
                setData({ ...data, user_category_title: e.target.value })
              }
            />
          </div>

          <button onClick={submitHandler} type="button" className="add_button">
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
const SubCategory = ({ user_category_uuid, close }) => {
  const [popup, setPopup] = useState(false);
  const [items, setItems] = useState({});
  const getUsersData = async () => {
    const response = await axios({
      method: "post",
      data: { user_category_uuid },
      url: "/userSubCategory/getUserSubCategory",
    });
    console.log(response);
    if (response.data.success) setItems(response.data.result);
  };
  useEffect(() => {
    getUsersData();
  }, []);
  return (
    <div className="popup_bg overlay">
      <div className="popup_img" style={{ width: "600px" }}>
        <div className="popup_header">
          <h3>Sub Categories</h3>
          <div className="exit_btn" onClick={close}>
            <CloseIcon />
          </div>
        </div>
        <div className="popup_body">
          <div style={{ width: "80%" }}>
            <AddIcon
              className="add_button"
              type="button"
              onClick={() => {
                setPopup({ type: "new" });
              }}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>SR. No</th>
                <th>User Sub Category</th>

                <th colSpan={2} style={{ textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((item, i) => (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{item?.user_sub_category_title || "-"}</td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        className="edit_button"
                        type="button"
                        onClick={() => {
                          setPopup({ type: "edit", item });
                        }}
                      >
                        Edit
                      </button>
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
      </div>
      {popup ? (
        <EditSubCategory
          popupInfo={popup}
          close={() => {
            setPopup(false);
            getUsersData();
          }}
          user_category_uuid={user_category_uuid}
        />
      ) : (
        ""
      )}
    </div>
  );
};
const EditSubCategory = ({ popupInfo, close, user_category_uuid }) => {
  const [data, setData] = useState({});
  useEffect(
    () =>
      popupInfo.type === "edit"
        ? setData(popupInfo.item)
        : setData({ user_sub_category_uuid: uuid(), user_category_uuid }),
    []
  );
  const submitHandler = async () => {
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/userSubCategory/putUserSubCategory",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/userSubCategory/postUserSubCategory",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        close();
      }
    }
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img">
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit"
              ? data?.user_sub_category_title || "-"
              : "New Tags"}
          </h3>
          <div className="exit_btn" onClick={close}>
            <getUserSubCategory />
          </div>
        </div>
        <div className="popup_body">
          <div>
            Sub Category Name
            <input
              placeholder="Category Name"
              value={data.user_sub_category_title}
              onChange={(e) =>
                setData({ ...data, user_sub_category_title: e.target.value })
              }
            />
          </div>

          <button onClick={submitHandler} type="button" className="add_button">
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
