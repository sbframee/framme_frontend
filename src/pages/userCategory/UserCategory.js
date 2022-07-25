import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../../components/Sidebar/SideBar";
import { v4 as uuid } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const UserCategory = () => {
  const [usersData, setUsersData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [subCategoryPopup, setSubCategoryPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
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
  return (
    <>
      <SideBar />
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
      </div>
    </>
  );
};

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
    <div className="popup_bg">
      <div className="popup">
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
    <div className="popup_bg">
      <div className="popup" style={{ width: "600px" }}>
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
const EditSubCategory = ({
  popupInfo,
  close,
  user_category_uuid,
}) => {
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
    <div className="popup_bg">
      <div className="popup">
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
