import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Sidebar/Header";
import SideBar from "../components/Sidebar/SideBar";
import Card from "../components/Card";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
const fileExtension = ".xlsx";
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const WaBoot = () => {
  const [noOrder, setNoOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [occasionsData, setOccasionsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [userSubCategory, setSubCategoriesData] = useState([]);
  const [Custome, setCustome] = useState(false);
  const [userCategory, setCategoriesData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [mssage, setMessage] = useState("{link}");
  const [mssagePopup, setMessagePopup] = useState("");
  const [step, setStep] = useState(0);
  let finalLink = useMemo(() => {
    let lastmsg = mssage
      ?.replace("{link}", `http://www.framee.in/login/{user_uuid}/{img_uuid}`)
      .replace(/\n/g, "%0A")
      .replace(/ /g, "%20")
      .replace(/,/g, "%2C")
      .replace(/:/g, "%3A")
      .replace(/ /g, "%20")
      .replace(/\//g, "%2F");
    console.log(lastmsg);
    return "https://api.whatsapp.com/send/?phone=91{phone}&text=" + lastmsg;
  }, [mssage]);
  const getUsersData = async () => {
    const response = await axios({ method: "get", url: "/users/getUsers" });
    console.log(response);
    if (response.data.success) setUsersData(response.data.result);
    else {
      setNoOrder("No User");
    }
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

  const getImageData = async () => {
    const response = await axios({
      method: "get",
      url: "/images/getAllBaseImages",
    });
    // console.log("images", response);
    if (response.data.success) {
      setOrders(response.data.result);
    } else {
      setNoOrder("No Image");
    }
  };
  useEffect(() => {
    getImageData();
    getOccasionData();
  }, []);
  const getOccasionData = async () => {
    const response = await axios({
      method: "get",
      url: "/occasions/getOccasions",
    });
    // console.log(response);
    if (response.data.success) setOccasionsData(response.data.result);
  };
  const BaseImagesOccasionLength = useMemo(() => {
    let data = [
      {
        occ_uuid: 0,
        title: "Unknown",
        orderLength: orders.filter((a) => !a?.occ_uuid?.length)?.length,
      },
    ];

    for (let trip of occasionsData) {
      data.push({
        ...trip,
        orderLength: orders.filter((b) =>
          b.occ_uuid?.find((c) => c.occ_uuid === trip.occ_uuid)
        )?.length,
      });
    }
    return data;
  }, [orders, occasionsData]);
  const UserCategoryLength = useMemo(() => {
    let data = [
      {
        user_category_uuid: 0,
        title: "Unknown",
        orderLength: usersData.filter((a) => !a?.user_category_uuid?.length)
          ?.length,
      },
    ];

    for (let trip of userCategory) {
      data.push({
        ...trip,
        orderLength: usersData.filter((b) =>
          b.user_category_uuid?.find((c) => c === trip.user_category_uuid)
        )?.length,
      });
    }
    return data;
  }, [usersData, userCategory]);

  const downloadExel = () => {
    // console.log(selectedOrder);
    // console.log(selectedUser);
    let sheetData = [];
    for (let [index, order] of selectedUser.entries()) {
      // console.log(selectedOrder[index % selectedOrder?.length].img_url.split("/")[3])
      sheetData.push({
        Link: finalLink
          ?.replace("{phone}", order?.user_name)
          .replace("{user_uuid}", order?.user_uuid || "new")
          .replace(
            "{img_uuid}",
            selectedOrder[index % selectedOrder?.length].img_url.split("/")[3]
          ),
      });
    }
    // console.log(sheetData)
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "Book" + fileExtension);
    setSelectedOrder([]);
    setSelectedUser([]);
    setStep(0);
    setMessage("{link}");
  };
  return (
    <>
      <SideBar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <h1 className="flex">WA Bot</h1>

        <div className="content-container" id="content-file-container">
          {noOrder ? (
            <div className="noOrder">{noOrder}</div>
          ) : step === 0 ? (
            <>
              {orders.filter((a) => !a?.occ_uuid?.length)?.length ? (
                <div key={Math.random()} className="sectionDiv">
                  <h2>
                    <span style={{ cursor: "pointer" }}>UnKnown</span>
                    <input
                      type="checkbox"
                      style={{
                        marginLeft: "10px",
                        transform: "scale(1.5)",
                      }}
                      defaultChecked={
                        selectedOrder.filter(
                          (a) =>
                            !a?.occ_uuid?.length &&
                            selectedOrder.filter((b) => b.img_url === a.img_url)
                              ?.length
                        )?.length ===
                        orders.filter((a) => !a?.occ_uuid?.length)?.length
                      }
                      onClick={() =>
                        selectedOrder.filter((a) => !a?.occ_uuid?.length)
                          ?.length ===
                        orders.filter((a) => !a?.occ_uuid?.length)?.length
                          ? setSelectedOrder((prev) =>
                              prev.filter(
                                (b) =>
                                  !orders.filter(
                                    (a) =>
                                      !a?.occ_uuid?.length &&
                                      b.img_url === a.img_url
                                  )?.length
                              )
                            )
                          : setSelectedOrder((prev) =>
                              prev?.length
                                ? [
                                    ...prev.filter(
                                      (b) =>
                                        !orders.filter(
                                          (a) =>
                                            !a?.occ_uuid?.length &&
                                            b.img_url === a.img_url
                                        )?.length
                                    ),
                                    ...orders.filter(
                                      (a) => !a?.occ_uuid?.length
                                    ),
                                  ]
                                : orders?.filter((a) => !a?.occ_uuid?.length)
                            )
                      }
                    />
                  </h2>
                  <div
                    className="content"
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: "0",
                      marginBottom: "10px",
                    }}
                    id="seats_container"
                  >
                    {orders
                      ?.filter((a) => !a?.occ_uuid?.length)
                      ?.map((item) => {
                        return (
                          <div
                            className={`seatSearchTarget`}
                            style={{ height: "fit-content" }}
                            key={Math.random()}
                            // section={section.section_uuid}
                            // section-name={section?.section_name}
                            // outlet={outletIdState}
                            onClick={(e) =>
                              setSelectedOrder((prev) =>
                                prev.filter((a) => a.img_url === item.img_url)
                                  ?.length
                                  ? prev.filter(
                                      (a) => a.img_url !== item.img_url
                                    )
                                  : prev?.length
                                  ? [...prev, item]
                                  : [item]
                              )
                            }
                          >
                            <span
                              className="dblClickTrigger"
                              style={{ display: "none" }}
                              // onClick={() =>
                              //   menuOpenHandler(item)
                              // }
                            />

                            <Card
                              order={item}
                              selectedCounter={
                                selectedOrder.filter((a) =>
                                  item.occ_uuid?.find(
                                    (b) => b.occ_uuid === a.occ_uuid
                                  )
                                )?.length
                              }
                              selectedOrder={
                                selectedOrder.filter(
                                  (a) => a.img_url === item.img_url
                                )?.length
                              }
                              rounded
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                ""
              )}
              {BaseImagesOccasionLength?.length ? (
                <>
                  {BaseImagesOccasionLength.map((trip) => {
                    if (
                      orders.filter((b) =>
                        b.occ_uuid?.find((c) => c.occ_uuid === trip.occ_uuid)
                      )?.length
                    )
                      return (
                        <div key={Math.random()} className="sectionDiv">
                          <h1>
                            <span style={{ cursor: "pointer" }}>
                              {trip.title}
                            </span>

                            <input
                              type="checkbox"
                              style={{
                                marginLeft: "10px",
                                transform: "scale(1.5)",
                              }}
                              defaultChecked={
                                orders.filter((a) =>
                                  a.occ_uuid?.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length ===
                                selectedOrder.filter((a) =>
                                  a.occ_uuid?.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length
                              }
                              onClick={() =>
                                orders.filter((a) =>
                                  a.occ_uuid?.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length ===
                                selectedOrder.filter((a) =>
                                  a.occ_uuid?.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length
                                  ? setSelectedOrder((prev) =>
                                      prev.filter(
                                        (b) =>
                                          !b.occ_uuid?.find(
                                            (c) => c.occ_uuid === trip.occ_uuid
                                          )
                                      )
                                    )
                                  : setSelectedOrder((prev) =>
                                      prev?.length
                                        ? [
                                            ...prev.filter(
                                              (b) =>
                                                !b.occ_uuid?.find(
                                                  (c) =>
                                                    c.occ_uuid === trip.occ_uuid
                                                )
                                            ),
                                            ...orders.filter((a) =>
                                              a.occ_uuid?.find(
                                                (c) =>
                                                  c.occ_uuid === trip.occ_uuid
                                              )
                                            ),
                                          ]
                                        : orders?.filter((a) =>
                                            a.occ_uuid?.find(
                                              (c) =>
                                                c.occ_uuid === trip.occ_uuid
                                            )
                                          )
                                    )
                              }
                            />
                          </h1>
                          <div
                            className="content"
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: "0",
                              marginBottom: "10px",
                            }}
                            id="seats_container"
                          >
                            {orders
                              .filter((b) =>
                                b.occ_uuid?.find(
                                  (c) => c.occ_uuid === trip.occ_uuid
                                )
                              )

                              .map((item) => {
                                return (
                                  <div
                                    className={`seatSearchTarget`}
                                    style={{ height: "fit-content" }}
                                    key={Math.random()}
                                    seat-name={item.seat_name}
                                    seat-code={item.seat_uuid}
                                    seat={item.seat_uuid}
                                    // section={section.section_uuid}
                                    // section-name={section?.section_name}
                                    // outlet={outletIdState}
                                    onClick={(e) =>
                                      setSelectedOrder((prev) =>
                                        prev.filter(
                                          (a) => a.img_url === item.img_url
                                        )?.length
                                          ? prev.filter(
                                              (a) => a.img_url !== item.img_url
                                            )
                                          : prev?.length
                                          ? [...prev, item]
                                          : [item]
                                      )
                                    }
                                  >
                                    <span
                                      className="dblClickTrigger"
                                      style={{ display: "none" }}
                                      // onClick={() =>
                                      //   menuOpenHandler(item)
                                      // }
                                    />
                                    <Card
                                      order={item}
                                      selectedOrder={
                                        selectedOrder.filter(
                                          (a) => a.img_url === item.img_url
                                        )?.length
                                      }
                                      selectedCounter={
                                        selectedOrder.filter((a) =>
                                          item.occ_uuid?.find(
                                            (b) => b.occ_uuid === a.counter_uuid
                                          )
                                        )?.length
                                      }
                                      rounded
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                  })}
                </>
              ) : (
                ""
              )}
            </>
          ) : step === 1 ? (
            <>
              {usersData.filter((a) => !a?.user_category_uuid?.length)
                ?.length ? (
                <div key={Math.random()} className="sectionDiv">
                  <h2>
                    <span style={{ cursor: "pointer" }}>UnKnown</span>
                    <input
                      type="checkbox"
                      style={{
                        marginLeft: "10px",
                        transform: "scale(1.5)",
                      }}
                      defaultChecked={
                        selectedUser?.filter(
                          (a) =>
                            !a?.user_category_uuid?.length &&
                            selectedUser.filter(
                              (b) => b.user_uuid === a.user_uuid
                            )?.length
                        )?.length ===
                        usersData?.filter((a) => !a?.user_category_uuid?.length)
                          ?.length
                      }
                      onClick={() =>
                        selectedUser.filter(
                          (a) => !a?.user_category_uuid?.length
                        )?.length ===
                        usersData.filter((a) => !a?.user_category_uuid?.length)
                          ?.length
                          ? setSelectedUser((prev) =>
                              prev.filter((b) => !b?.user_category_uuid?.length)
                            )
                          : setSelectedUser((prev) =>
                              prev?.length
                                ? [
                                    ...prev.filter(
                                      (b) => !b?.user_category_uuid?.length
                                    ),
                                    ...usersData.filter(
                                      (a) => !a?.user_category_uuid?.length
                                    ),
                                  ]
                                : usersData?.filter(
                                    (a) => !a?.user_category_uuid?.length
                                  )
                            )
                      }
                    />
                  </h2>
                  <div
                    className="content"
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: "0",
                      marginBottom: "10px",
                    }}
                    id="seats_container"
                  >
                    {usersData
                      ?.filter((a) => !a?.user_category_uuid?.length)
                      ?.map((item) => {
                        return (
                          <div
                            className={`seatSearchTarget`}
                            style={{ height: "fit-content" }}
                            key={Math.random()}
                            // section={section.section_uuid}
                            // section-name={section?.section_name}
                            // outlet={outletIdState}
                            onClick={(e) =>
                              setSelectedUser((prev) =>
                                prev.filter(
                                  (a) => a.user_uuid === item.user_uuid
                                )?.length
                                  ? prev.filter(
                                      (a) => a.user_uuid !== item.user_uuid
                                    )
                                  : prev?.length
                                  ? [...prev, item]
                                  : [item]
                              )
                            }
                          >
                            <span
                              className="dblClickTrigger"
                              style={{ display: "none" }}
                              // onClick={() =>
                              //   menuOpenHandler(item)
                              // }
                            />

                            <Card
                              order={item}
                              selectedCounter={
                                selectedUser.filter((a) =>
                                  item.user_category_uuid?.find(
                                    (b) =>
                                      b.user_category_uuid === a.counter_uuid
                                  )
                                )?.length
                              }
                              selectedOrder={
                                selectedUser.filter(
                                  (a) => a.user_uuid === item.user_uuid
                                )?.length
                              }
                              rounded
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                ""
              )}
              {UserCategoryLength.filter((a) => a.user_category_uuid)
                ?.length ? (
                <>
                  {UserCategoryLength.filter((a) => a.user_category_uuid).map(
                    (trip) => {
                      if (trip?.orderLength)
                        return (
                          <div key={Math.random()} className="sectionDiv">
                            <h1>
                              <span style={{ cursor: "pointer" }}>
                                {trip.user_category_title}
                              </span>

                              <input
                                type="checkbox"
                                style={{
                                  marginLeft: "10px",
                                  transform: "scale(1.5)",
                                }}
                                defaultChecked={
                                  usersData.filter((a) =>
                                    a.user_category_uuid?.find(
                                      (c) => c === trip.user_category_uuid
                                    )
                                  )?.length ===
                                  selectedUser.filter((a) =>
                                    a.user_category_uuid?.find(
                                      (c) => c === trip.user_category_uuid
                                    )
                                  )?.length
                                }
                                onClick={() =>
                                  usersData.filter((a) =>
                                    a.user_category_uuid?.find(
                                      (c) => c === trip.user_category_uuid
                                    )
                                  )?.length ===
                                  selectedUser.filter((a) =>
                                    a.user_category_uuid?.find(
                                      (c) => c === trip.user_category_uuid
                                    )
                                  )?.length
                                    ? setSelectedUser((prev) =>
                                        prev.filter(
                                          (b) =>
                                            !b.user_category_uuid?.find(
                                              (c) =>
                                                c === trip.user_category_uuid
                                            )
                                        )
                                      )
                                    : setSelectedUser((prev) =>
                                        prev?.length
                                          ? [
                                              ...prev.filter(
                                                (b) =>
                                                  !b.user_category_uuid?.find(
                                                    (c) =>
                                                      c ===
                                                      trip.user_category_uuid
                                                  )
                                              ),
                                              ...usersData.filter((a) =>
                                                a.user_category_uuid?.find(
                                                  (c) =>
                                                    c ===
                                                    trip.user_category_uuid
                                                )
                                              ),
                                            ]
                                          : usersData?.filter((a) =>
                                              a.user_category_uuid?.find(
                                                (c) =>
                                                  c === trip.user_category_uuid
                                              )
                                            )
                                      )
                                }
                              />
                            </h1>
                            <div
                              className="content"
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "0",
                                marginBottom: "10px",
                              }}
                              id="seats_container"
                            >
                              {usersData
                                .filter((b) =>
                                  b.user_category_uuid?.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )

                                .map((item) => {
                                  return (
                                    <div
                                      className={`seatSearchTarget`}
                                      style={{ height: "fit-content" }}
                                      key={Math.random()}
                                      seat-name={item.seat_name}
                                      seat-code={item.seat_uuid}
                                      seat={item.seat_uuid}
                                      // section={section.section_uuid}
                                      // section-name={section?.section_name}
                                      // outlet={outletIdState}
                                      onClick={(e) =>
                                        setSelectedUser((prev) =>
                                          prev.filter(
                                            (a) =>
                                              a.user_uuid === item.user_uuid
                                          )?.length
                                            ? prev.filter(
                                                (a) =>
                                                  a.user_uuid !== item.user_uuid
                                              )
                                            : prev?.length
                                            ? [...prev, item]
                                            : [item]
                                        )
                                      }
                                    >
                                      <span
                                        className="dblClickTrigger"
                                        style={{ display: "none" }}
                                        // onClick={() =>
                                        //   menuOpenHandler(item)
                                        // }
                                      />
                                      <Card
                                        order={item}
                                        selectedOrder={
                                          selectedUser.filter(
                                            (a) =>
                                              a.user_uuid === item.user_uuid
                                          )?.length
                                        }
                                        selectedCounter={
                                          selectedUser.filter((a) =>
                                            item.user_category_uuid?.find(
                                              (b) =>
                                                b.user_category_uuid ===
                                                a.counter_uuid
                                            )
                                          )?.length
                                        }
                                        rounded
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                    }
                  )}
                </>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
          {(step === 0 && selectedOrder?.length) ||
          (step === 1 && selectedUser?.length) ||
          step === 2 ? (
            <button
              className="imageselectnextBtn"
              onClick={
                step === 0
                  ? () => setStep(1)
                  : step === 1
                  ? () => setMessagePopup(2)
                  : () => downloadExel()
              }
            >
              {step === 0 || step === 1 ? "Next" : "Download Excel"}
            </button>
          ) : (
            ""
          )}
          {step === 1 ? (
            <button
              className="imageselectnextBtn"
              style={
                Custome
                  ? {
                      right: "250px",
                      fontSize: "1rem",
                      backgroundColor: "#fff",
                      color: "#44cd4a",
                    }
                  : { right: "250px", fontSize: "1rem" }
              }
              onClick={() => {
                setCustome(true);
                setSelectedUser([]);
              }}
            >
              Custome Users
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      {mssagePopup ? (
        <div
          className="overlay"
          style={{ zIndex: 9999999999 }}
          // style={{ position: "fixed", top: 0, left: 0, zIndex: 9999999999 }}
        >
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
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMessagePopup(false);
                    setStep(2);
                  }}
                >
                  <div className="formGroup">
                    <div
                      className="row"
                      style={{ flexDirection: "column", alignItems: "start" }}
                    >
                      <label className="selectLabel flex">
                        <textarea
                          type="text"
                          name="route_title"
                          className="numberInput"
                          value={mssage}
                          style={{ height: "200px" }}
                          onChange={(e) =>
                            setMessage((prev) =>
                              e.target.value.includes("{link}")
                                ? e.target.value
                                : prev
                            )
                          }
                          onWheel={(e) => e.preventDefault()}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                    </div>

                    <div className="row">
                      <button className="simple_Logout_button" type="submit">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {Custome ? (
        <div className="overlay" style={{ zIndex: 9999999999 }}>
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
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCustome(false);
                    setMessagePopup(true);
                  }}
                >
                  <div className="formGroup">
                    <div
                      className="row"
                      style={{ flexDirection: "column", alignItems: "start" }}
                    >
                      {console.log(selectedUser)}
                      <label className="selectLabel flex">
                        <textarea
                          type="text"
                          name="route_title"
                          className="numberInput"
                          // value={selectedUser?.map((a, i) =>
                          //   i !== 0 ? a.user_name + "\n" : a.user_name
                          // )}
                          style={{ height: "200px" }}
                          onChange={(e) =>
                            setSelectedUser(
                              e.target.value
                                ?.split("\n")
                                ?.map((a) => ({ user_name: a })) || []
                            )
                          }
                          onWheel={(e) => e.preventDefault()}
                        />
                        {/* {popupInfo.conversion || 0} */}
                      </label>
                    </div>

                    <div className="row">
                      {selectedUser?.length ? (
                        <button className="simple_Logout_button" type="submit">
                          Next
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </form>
                <button
                  onClick={() => setCustome(false)}
                  className="closeButton"
                >
                  x
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default WaBoot;
