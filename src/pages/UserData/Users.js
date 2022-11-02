import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../../components/Sidebar/SideBar";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Sidebar/Header";
const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({});
  const [categoriesData, setCategoriesData] = useState([]);
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const navigate = useNavigate();
  const getUsersData = async () => {
    const response = await axios({ method: "get", url: "/users/getUsers" });
    console.log(response);
    if (response.data.success) setUsersData(response.data.result);
  };
  const getSubCategoriesData = async () => {
    const response = await axios({
      method: "get",
      url: "/userSubCategory/getUserSubCategory",
    });

    console.log(response);
    if (response.data.success) setSubCategoriesData(response.data.result);
  };
  useEffect(() => {
    getUsersData();
    getSubCategoriesData();
  }, []);
  const getCategoriesData = async () => {
    const response = await axios({
      method: "get",
      url: "/userCategory/getUserCategory",
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
        <div className="tags">
          <h1>Users</h1>
          <div style={{ width: "80%" }}>
            <button
              className="add_button"
              type="button"
              onClick={() => {
                setPopupInfo({ type: "new" });
                setPopup(true);
              }}
            >
              Add User
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>SR. No</th>
                <th>Title</th>
                <th>User Name</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {usersData.length ? (
                usersData.map((item, i) => (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{item?.user_title || "-"}</td>
                    <td>{item?.user_name || "-"}</td>

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
                          localStorage.setItem("user_uuid", item.user_uuid);
                          localStorage.setItem(
                            "user_category_uuid",
                            JSON.stringify(item.user_category_uuid)
                          );
                          navigate("/tagInput");
                        }}
                      >
                        Upload
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
              categoriesData={categoriesData}
              popupInfo={popupInfo}
              close={() => {
                setPopup(false);
                setPopupInfo({});
              }}
              setUsersData={setUsersData}
              subCategoriesData={subCategoriesData}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
const Popup = ({
  popupInfo,
  setUsersData,
  close,
  categoriesData,
  subCategoriesData = [],
}) => {
  const [data, setData] = useState({});
  useEffect(
    () =>
      popupInfo.type === "edit"
        ? setData(popupInfo.item)
        : setData({ user_uuid: uuid(), tag_type: "T" }),
    []
  );
  const submitHandler = async () => {
    if (popupInfo.type === "edit") {
      const response = await axios({
        method: "put",
        url: "/users/putUser",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setUsersData((prev) =>
          prev.map((i) => (i.user_uuid === data.user_uuid ? data : i))
        );
        close();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/users/postUser",
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
  const onChangeHandler = (e) => {
    if (e.target.value === "none") {
      setData({ ...data, user_category_uuid: [] });
      return;
    }
    let catData = data?.user_category_uuid || [];
    let subCatData = data?.user_sub_category_uuid || [];
    let options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    for (let i of options) {
      if (catData.filter((a) => a === i).length) {
        catData = catData.filter((a) => a !== i);
        subCatData = data.user_sub_category_uuid.filter(
          (a) =>
            subCategoriesData?.find((b) => b.user_sub_category_uuid === a)
              ?.user_category_uuid !== i
        );
      } else
        catData = [
          ...catData,
          categoriesData.find((a) => a.user_category_uuid == i)
            ?.user_category_uuid,
        ];
    }
    // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
    console.log(options, catData);

    setData({
      ...data,
      user_category_uuid: catData,
      user_sub_category_uuid: subCatData,
    });
  };
  const onSubCategoryChangeHandler = (e) => {
    if (e.target.value === "none") {
      setData({ ...data, user_sub_category_uuid: [] });
      return;
    }
    let catData = data?.user_sub_category_uuid || [];
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
          subCategoriesData.find((a) => a.user_sub_category_uuid == i)
            ?.user_sub_category_uuid,
        ];
    }
    // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
    console.log(options, catData, e.target);

    setData({ ...data, user_sub_category_uuid: catData });
  };
  return (
    <div className="popup_bg overlay">
      <div className="popup_img" style={{ width: "400px" }}>
        <div className="popup_header">
          <h3>
            {popupInfo.type === "edit"
              ? data?.user_title || data?.user_name || "-"
              : "New Tags"}
          </h3>
          <div className="exit_btn" onClick={close}>
            X
          </div>
        </div>
        <div className="popup_body">
          <div>
            Title
            <input
              placeholder="User Name"
              value={data.user_title}
              onChange={(e) => setData({ ...data, user_title: e.target.value })}
            />
          </div>
          <div>
            User Name
            <input
              placeholder="User Name"
              value={data.user_name}
              onChange={(e) => setData({ ...data, user_name: e.target.value })}
            />
          </div>
          <div>
            User Category
            <select
              className="label_popup_input"
              style={{ width: "200px" }}
              value={data.user_category_uuid}
              onChange={onChangeHandler}
              multiple
            >
              {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
              <option value="none">None</option>
              {categoriesData.map((cat) => (
                <option value={cat.user_category_uuid}>
                  {cat.user_category_title}
                </option>
              ))}
            </select>
            {subCategoriesData?.filter(
              (a) =>
                data?.user_category_uuid?.filter(
                  (b) => b === a.user_category_uuid
                ).length
            ).length ? (
              <div>
                User Sub Category
                <select
                  className="label_popup_input"
                  style={{ width: "200px" }}
                  value={data.user_sub_category_uuid}
                  onChange={onSubCategoryChangeHandler}
                  multiple
                >
                  {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
                  <option value="none">None</option>
                  {subCategoriesData
                    ?.filter(
                      (a) =>
                        data.user_category_uuid.filter(
                          (b) => b === a.user_category_uuid
                        ).length
                    )
                    .map((cat) => (
                      <option value={cat.user_sub_category_uuid}>
                        {cat.user_sub_category_title}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              ""
            )}
          </div>
          <button onClick={submitHandler} type="button" className="add_button">
            {popupInfo.type === "edit" ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
