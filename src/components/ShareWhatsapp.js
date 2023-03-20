import {
  Add,
  ArrowDropDown,
  ArrowDropUp,
  CopyAll,
  DeleteOutline,
} from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
const ShareWhatsapp = ({ onSave }) => {
  const [objData, setObgData] = useState({
    message: [],

    contacts: [],
  });
  const [contacts, setContacts] = useState([]);

  const [active, setActive] = useState("");

  const [step, setStep] = useState(0);
  const [orderForm, setOrderForm] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [filterCounterTitle, setFilterCounterTitle] = useState("");
  const [filterRouteTitle, setFilterRouteTitle] = useState("");
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
    getContact();
  }, []);
  console.log(objData);
  const submitHandler = async (e) => {
    e.preventDefault();
    let data = [];
    const file = [];
    for (let contact of objData.contacts) {
      let messages = [];
      for (let messageobj of objData.message) {
        let message = "";
        if (messageobj?.type === "text") {
          message = messageobj.text;

          messages.push({ text: message });
        } else {
          file.push(messageobj?.img);
          console.log(messageobj?.img);
          messages.push({
            file: messageobj?.img?.name,
            sendAsDocument: false,
            caption: messageobj?.caption || "",
          });
        }
      }
      data.push({ contact: contact, messages });
    }
    console.log(data);
    console.log(file);
    try {
      if (file.length) {
        const form = new FormData();
        form.append("instructions", JSON.stringify(data));
        for (let item of file) form.append("file", item);
        const result = await axios.post(
          `http://13.232.99.217:2000/send`,
          form,
          {
            "Content-Type": "multipart/form-data",
          }
        );
        // console.yellow("WHATCRAFT API RESPONDED:");
        console.log(result.data, data);
      } else {
        let msgResponse = await axios({
          url: `http://13.232.99.217:2000/sendMessage`,
          method: "post",
          data,
        });
        //   console.yellow("WHATCRAFT API RESPONDED:");
        console.log(msgResponse.data, data);
      }
      onSave()
    } catch (error) {
      //   console.red("ERROR IN WHATCRAFT API REQUEST.");
      console.error(error.message);
    }
  };
  const filteredCounter = useMemo(
    () =>
      contacts.filter(
        (a) =>
          !filterCounterTitle ||
          a.name
            ?.toLocaleLowerCase()
            ?.includes(filterCounterTitle?.toLocaleLowerCase())
      ),
    [contacts, filterCounterTitle]
  );

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
          <div
            className="flex"
            style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
          >
            {step === 0 ? (
              <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
                <table
                  className="user-table"
                  style={{
                    width: "80vw",
                    maxWidth: "400px",
                  }}
                >
                  <tbody>
                    <>
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <b style={{ width: "100px" }}>Message : </b>
                          <span
                            onClick={(e) => {
                              setObgData((prev) => ({
                                ...prev,
                                message: [
                                  ...(prev.message || []),
                                  { type: "text", uuid: uuid() },
                                ],
                              }));
                            }}
                            className="fieldEditButton"
                          >
                            <Add />
                          </span>
                        </td>
                      </tr>
                      <div style={{ overflowY: "scroll", maxHeight: "150px" }}>
                        {objData?.message
                          ?.filter((item) => !item.delete)
                          ?.map((item, i) => (
                            <tr key={item.uuid}>
                              <td
                                colSpan={2}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                }}
                              >
                                {i + 1})
                                <span
                                  onClick={() =>
                                    setObgData((prev) => ({
                                      ...prev,
                                      message: prev.message.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, delete: true }
                                          : a
                                      ),
                                    }))
                                  }
                                >
                                  <DeleteOutline />
                                </span>
                                <select
                                  className="searchInput"
                                  value={item.type}
                                  onChange={(e) => {
                                    setObgData((prev) => ({
                                      ...prev,
                                      message: prev.message.map((a) =>
                                        a.uuid === item.uuid
                                          ? { ...a, type: e.target.value }
                                          : a
                                      ),
                                    }));
                                  }}
                                >
                                  <option value="text">Text</option>
                                  <option value="img">Image</option>
                                </select>
                                {item?.type === "text" ? (
                                  <textarea
                                    onWheel={(e) => e.target.blur()}
                                    className="searchInput"
                                    style={{
                                      border: "none",
                                      borderBottom: "2px solid black",
                                      borderRadius: "0px",
                                      height: "100px",
                                      width: "150px",
                                    }}
                                    id={item.uuid}
                                    onFocus={() => {
                                      setActive(item.uuid);
                                    }}
                                    placeholder=""
                                    value={item.text}
                                    onChange={(e) => {
                                      setObgData((prev) => ({
                                        ...prev,
                                        message: prev.message.map((a) =>
                                          a.uuid === item.uuid
                                            ? { ...a, text: e.target.value }
                                            : a
                                        ),
                                      }));
                                    }}
                                  />
                                ) : (
                                  <div>
                                    <label htmlFor={item.uuid} className="flex">
                                      Upload Image
                                      <input
                                        className="searchInput"
                                        type="file"
                                        accept="image/*"
                                        id={item.uuid}
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          setObgData((prev) => ({
                                            ...prev,
                                            message: prev.message.map((a) =>
                                              a.uuid === item.uuid
                                                ? {
                                                    ...a,
                                                    img: e.target.files[0],
                                                  }
                                                : a
                                            ),
                                          }))
                                        }
                                      />
                                    </label>
                                    <input
                                      type="text"
                                      onWheel={(e) => e.target.blur()}
                                      className="searchInput"
                                      style={{
                                        border: "none",
                                        borderBottom: "2px solid black",
                                        borderRadius: "0px",
                                      }}
                                      placeholder="caption"
                                      value={item.caption}
                                      onChange={(e) => {
                                        setObgData((prev) => ({
                                          ...prev,
                                          message: prev.message.map((a) =>
                                            a.uuid === item.uuid
                                              ? {
                                                  ...a,
                                                  caption: e.target.value,
                                                }
                                              : a
                                          ),
                                        }));
                                      }}
                                    />
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </div>

                      {/* <tr>
                        <td
                          colSpan={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }}
                        >
                          <b style={{ width: "100px" }}>Mobile : </b>
                          <textarea
                            onWheel={(e) => e.target.blur()}
                            className="searchInput"
                            style={{
                              border: "none",
                              borderBottom: "2px solid black",
                              borderRadius: "0px",
                              height: "100px",
                            }}
                            placeholder=""
                            value={objData?.mobile
                              ?.toString()
                              ?.replace(/,/g, "\n")}
                            onChange={(e) =>
                              setObgData((prev) => ({
                                ...prev,
                                mobile: e.target.value.split("\n"),
                              }))
                            }
                          />
                        </td>
                      </tr> */}
                    </>
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: "500px", overflowY: "scroll" }}>
                  <input
                    type="text"
                    onChange={(e) => setFilterCounterTitle(e.target.value)}
                    value={filterCounterTitle}
                    placeholder="Search Name..."
                    className="searchInput"
                  />

                  <table
                    className="user-table"
                    style={{
                      maxWidth: "500px",
                      height: "fit-content",
                      overflowX: "scroll",
                    }}
                  >
                    <thead>
                      <tr>
                        <th>S.N</th>
                        <th colSpan={2}>Name</th>
                      </tr>
                    </thead>
                    <tbody className="tbody">
                      {filteredCounter

                        ?.sort((a, b) => a.name?.localeCompare(b.name))
                        ?.map((item, i, array) => {
                          return (
                            <tr key={Math.random()} style={{ height: "30px" }}>
                              <td
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let mobile = item.mobile.find(
                                    (a) => a.mobile
                                  )?.mobile;
                                  if (mobile)
                                    setObgData((prev) => ({
                                      ...prev,
                                      contacts: prev.contacts.filter(
                                        (a) => a === mobile
                                      ).length
                                        ? prev.contacts.filter(
                                            (a) => a !== mobile
                                          )
                                        : [...(prev.contacts || []), mobile],
                                    }));
                                }}
                                className="flex"
                                style={{
                                  justifyContent: "space-between",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={objData.contacts.find((a) =>
                                    item.mobile.find((b) => b.mobile === a)
                                  )}
                                  style={{ transform: "scale(1.3)" }}
                                />
                                {i + 1}
                              </td>

                              <td colSpan={2}>{item.name || ""}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {step === 0 ? (
              <button className="fieldEditButton" onClick={() => setStep(1)}>
                Next
              </button>
            ) : (
              <button className="fieldEditButton" onClick={submitHandler}>
                Send
              </button>
            )}
          </div>

          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareWhatsapp;
