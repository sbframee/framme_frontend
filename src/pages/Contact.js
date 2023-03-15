import {
  Add,
  ArrowBack,
  Delete,

} from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Sidebar/navbar";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [popupInfo, setPopupInfo] = useState(false);
  const [filterItemTitle, setFilterItemTile] = useState("");
  const [deletePopup, setDeletePopup] = useState("");
  const navigate = useNavigate();
  const getContact = async (user_uuid = localStorage.getItem("user_uuid")) => {
    // console.log(data.user_name)
    const response = await axios({
      method: "get",
      url: `/contact_list/getContactList/${user_uuid}`,
      data: { user_uuid },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setContacts(response.data.result);
    }
  };
  useEffect(() => {
    getContact(localStorage.getItem("user_uuid"));
  }, []);
  const filteredContacts = useMemo(() => {
    return contacts?.filter(
      (a) =>
        !filterItemTitle ||
        a.name
          ?.toLocaleLowerCase()
          .includes(filterItemTitle.toLocaleLowerCase())
    );
  }, [contacts, filterItemTitle]);
  console.count("render");
  return (
    <>
      <div className="main">
        <Navbar
          logo={false}
          Tag={() => (
            <div className="flex" style={{ color: "#fff" }}>
              <ArrowBack
                className="backArrow"
                onClick={() => navigate("/users")}
                style={{ color: "#fff" }}
              />
            </div>
          )}
        />
        <span className="flex" style={{ width: "100vw", maxWidth: "500px" }}>
          <input
            style={{ width: "200px" }}
            className="searchInput"
            type="text"
            placeholder="search"
            value={filterItemTitle}
            onChange={(e) => setFilterItemTile(e.target.value)}
          />
        </span>
        <div
          className="flex"
          style={{
            justifyContent: "space-between",
            width: "100vw",
            maxWidth: "500px",
          }}
        >
          <h1>Contacts</h1>
          <div className="icon-container flex">
            <button
              className="customeGoldenButton flex"
              style={{ padding: "5px 10px", fontSize: "1rem" }}
              onClick={() => setPopupInfo({})}
            >
              Add
            </button>
          </div>
        </div>
        <table
          className="user-table"
          style={{
            width: "100vw",
            maxWidth: "500px",
          }}
        >
          <thead>
            <tr>
              <td>
                <div className="t-head-element">Name</div>
              </td>
              <td colSpan={2}>
                <div className="t-head-element">Actions</div>
              </td>
            </tr>
          </thead>
          <tbody className="tbody">
            {filteredContacts?.map((contact) => (
              <tr>
                <td>{contact?.name || ""}</td>
                <td>
                  <button
                    className="customeGoldenButton flex"
                    style={{ padding: "5px 10px", fontSize: "1rem" }}
                    onClick={() => setPopupInfo(contact)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <div
                    // className="customeGoldenButton flex"
                    style={{
                      padding: "5px 10px",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                    onClick={() => setDeletePopup(contact)}
                  >
                    <Delete />
                  </div>
                </td>
              </tr>
            )) || ""}
          </tbody>
        </table>
      </div>
      {popupInfo ? (
        <NewUserForm
          onSave={() => {
            setPopupInfo(false);
            getContact();
          }}
          popupInfo={popupInfo}
        />
      ) : (
        ""
      )}
      {deletePopup ? (
        <DeleteCounterPopup
          onSave={() => {
            setDeletePopup(false);
            getContact();
          }}
          popupInfo={deletePopup}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Contact;
function NewUserForm({ onSave, popupInfo }) {
  const [data, setdata] = useState({});
  const [otppoup, setOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [counterGroup, setCounterGroup] = useState([]);
  const [TripsData, setTripData] = useState([]);
  const [orderFrom, setOrderFrom] = useState([]);
  const [errMassage, setErrorMassage] = useState("");
  const getTripData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "post",
      url: "/trips/GetTripData",
      data: {
        params: ["trip_uuid", "trip_title"],
        trips: [],
        conditions: [{ status: 1 }],
      },
      signal: controller.signal,

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      setTripData(response.data.result);
    }
  };
  const getItemsData = async (controller = new AbortController()) => {
    const response = await axios({
      method: "get",
      url: "/orderForm/GetFormList",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) setOrderFrom(response.data.result);
  };
  useEffect(() => {
    const controller = new AbortController();
    getItemsData(controller);
    getTripData(controller);
    return () => {
      controller.abort();
    };
  }, []);
  const getCounterGroup = async () => {
    const response = await axios({
      method: "get",
      url: "/counterGroup/GetCounterGroupList",

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success)
      setCounterGroup(
        response.data.result.filter(
          (a) => a.counter_group_uuid && a.counter_group_title
        )
      );
  };

  useEffect(() => {
    getCounterGroup();
  }, []);
  useEffect(() => {
    setdata(popupInfo);
  }, [popupInfo]);
  console.log(data);
  const submitHandler = async (e) => {
    e?.preventDefault();
    let json = {
      ...data,
      name: data.name.trim(),
      user_uuid: localStorage.getItem("user_uuid"),
    };
    if (!json.name) {
      setErrorMassage("Please insert  name");
      return;
    }

    // if (data?.mobile?.length !== 10) {
    //   setErrorMassage("Please enter 10 Numbers in Mobile");
    //   return;
    // }

    if (popupInfo?.contact_uuid) {
      const response = await axios({
        method: "put",
        url: "/contact_list/putContactList",
        data: [json],
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } else {
      const response = await axios({
        method: "post",
        url: "/contact_list/postContactList",
        data: json,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    }
  };

  return (
    <>
      <div className="overlay" style={{ zIndex: "9999999" }}>
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
            <div style={{ overflowY: "scroll", height: "fit-content" }}>
              <form
                className="form"
                onSubmit={submitHandler}
                style={{ width: "240px" }}
              >
                <div className="row">
                  <h1>{popupInfo.contact_uuid ? "Edit" : "Add"} Contact </h1>
                </div>

                <div className="form">
                  <div className="row">
                    <label className="selectLabel">
                      Name
                      <input
                        type="text"
                        name="route_title"
                        className="numberInput"
                        style={{ width: "230px" }}
                        value={data?.name}
                        onChange={(e) =>
                          setdata({
                            ...data,
                            name: e.target.value,
                          })
                        }
                        maxLength={42}
                      />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div
                    className="flex"
                    style={{ justifyContent: "space-between", width: "230px" }}
                  >
                    <h2>Mobile</h2>
                    <span
                      className="submit flex"
                      style={{ padding: "5px 10px" }}
                      onClick={() => {
                        setdata((prev) => ({
                          ...prev,
                          mobile: [
                            ...(prev?.mobile || []),
                            { uuid: uuid(), mobile: "" },
                          ],
                        }));
                      }}
                    >
                      <Add />
                    </span>
                  </div>
                </div>
                <div>
                  {data?.mobile?.map((a) => (
                    <div className="row" key={a.uuid}>
                      <label className="selectLabel">
                        <input
                          type="number"
                          name="route_title"
                          className="numberInput"
                          value={a?.mobile}
                          style={{ width: "230px", margin: "5px 0" }}
                          onChange={(e) => {
                            if (e.target.value.length > 10) {
                              return;
                            }
                            setdata((prev) => ({
                              ...prev,
                              mobile: prev.mobile.map((b) =>
                                b.uuid === a.uuid
                                  ? { ...b, mobile: e.target.value }
                                  : b
                              ),
                            }));
                          }}
                          maxLength={10}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <i style={{ color: "red" }}>
                  {errMassage === "" ? "" : "Error: " + errMassage}
                </i>

                <button type="submit" className="submit">
                  Save changes
                </button>
              </form>
            </div>

            <button onClick={onSave} className="closeButton">
              x
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
function DeleteCounterPopup({ onSave, popupInfo, setItemsData }) {
  const [errMassage, setErrorMassage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const response = await axios({
        method: "delete",
        url: "/contact_list/deleteContactList",
        data: { contact_uuid: popupInfo.contact_uuid },
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        onSave();
      }
    } catch (err) {
      console.log(err);
      //   setErrorMassage("Order already exist");
    }
    setLoading(false);
  };

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ width: "fit-content", maxHeight: "200px" }}
      >
        <div
          className="content"
          style={{
            maxHeight: "200px",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Delete Contact</h1>
              </div>
              <div className="row">
                <h1>{popupInfo.name}</h1>
              </div>

              <i style={{ color: "red" }}>
                {errMassage === "" ? "" : "Error: " + errMassage}
              </i>
              <div className="flex" style={{ justifyContent: "space-between" }}>
                {loading ? (
                  <button
                    className="submit"
                    id="loading-screen"
                    style={{ background: "red", width: "120px" }}
                  >
                    <svg viewBox="0 0 100 100">
                      <path
                        d="M10 50A40 40 0 0 0 90 50A40 44.8 0 0 1 10 50"
                        fill="#ffffff"
                        stroke="none"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          dur="1s"
                          repeatCount="indefinite"
                          keyTimes="0;1"
                          values="0 50 51;360 50 51"
                        ></animateTransform>
                      </path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit"
                    style={{ background: "red" }}
                  >
                    Confirm
                  </button>
                )}
                <button type="button" className="submit" onClick={onSave}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
