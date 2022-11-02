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
  const [userCategory, setCategoriesData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [step, setStep] = useState(0);
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
        orderLength: orders.filter((a) => !a?.occ_uuid.length)?.length,
      },
    ];

    for (let trip of occasionsData) {
      data.push({
        ...trip,
        orderLength: orders.filter((b) =>
          b.occ_uuid.find((c) => c.occ_uuid === trip.occ_uuid)
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
        orderLength: usersData.filter((a) => !a?.user_category_uuid.length)
          ?.length,
      },
    ];

    for (let trip of userCategory) {
      data.push({
        ...trip,
        orderLength: usersData.filter((b) =>
          b.user_category_uuid.find((c) => c === trip.user_category_uuid)
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
      // console.log(selectedOrder[index % selectedOrder.length].img_url.split("/")[3])
      sheetData.push({
        Link: `https://api.whatsapp.com/send/?phone=91${
          order?.user_name
        }&text=${
          "http://www.framee.in" +
          `/login/${order?.user_uuid}/${
            selectedOrder[index % selectedOrder.length].img_url.split("/")[3]
          }`
        }`,
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
  };
  return (
    <>
      <SideBar />
      <Header />
      <div className="item-sales-container orders-report-container">
        <div className="content-container" id="content-file-container">
          {noOrder ? (
            <div className="noOrder">{noOrder}</div>
          ) : step === 0 ? (
            <>
              {orders.filter((a) => !a?.occ_uuid.length)?.length ? (
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
                            !a?.occ_uuid.length &&
                            selectedOrder.filter((b) => b.img_url === a.img_url)
                              ?.length
                        )?.length ===
                        orders.filter((a) => !a?.occ_uuid.length)?.length
                      }
                      onClick={() =>
                        selectedOrder.filter((a) => !a?.occ_uuid.length)
                          ?.length ===
                        orders.filter((a) => !a?.occ_uuid.length)?.length
                          ? setSelectedOrder((prev) =>
                              prev.filter(
                                (b) =>
                                  !orders.filter(
                                    (a) =>
                                      !a?.occ_uuid.length &&
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
                                            !a?.occ_uuid.length &&
                                            b.img_url === a.img_url
                                        )?.length
                                    ),
                                    ...orders.filter(
                                      (a) => !a?.occ_uuid.length
                                    ),
                                  ]
                                : orders?.filter((a) => !a?.occ_uuid.length)
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
                      .filter((a) => !a?.occ_uuid.length)
                      ?.length.map((item) => {
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
                                  item.occ_uuid.find(
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
                        b.occ_uuid.find((c) => c.occ_uuid === trip.occ_uuid)
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
                                  a.occ_uuid.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length ===
                                selectedOrder.filter((a) =>
                                  a.occ_uuid.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length
                              }
                              onClick={() =>
                                orders.filter((a) =>
                                  a.occ_uuid.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length ===
                                selectedOrder.filter((a) =>
                                  a.occ_uuid.find(
                                    (c) => c.occ_uuid === trip.occ_uuid
                                  )
                                )?.length
                                  ? setSelectedOrder((prev) =>
                                      prev.filter(
                                        (b) =>
                                          !b.occ_uuid.find(
                                            (c) => c.occ_uuid === trip.occ_uuid
                                          )
                                      )
                                    )
                                  : setSelectedOrder((prev) =>
                                      prev?.length
                                        ? [
                                            ...prev.filter(
                                              (b) =>
                                                !b.occ_uuid.find(
                                                  (c) =>
                                                    c.occ_uuid === trip.occ_uuid
                                                )
                                            ),
                                            ...orders.filter((a) =>
                                              a.occ_uuid.find(
                                                (c) =>
                                                  c.occ_uuid === trip.occ_uuid
                                              )
                                            ),
                                          ]
                                        : orders?.filter((a) =>
                                            a.occ_uuid.find(
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
                                b.occ_uuid.find(
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
                                          item.occ_uuid.find(
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
              {usersData.filter((a) => !a?.user_category_uuid.length)
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
                        selectedUser.filter(
                          (a) =>
                            !a?.user_category_uuid.length &&
                            selectedUser.filter(
                              (b) => b.user_uuid === a.user_uuid
                            )?.length
                        )?.length ===
                        usersData.filter((a) => !a?.user_category_uuid.length)
                          ?.length
                      }
                      onClick={() =>
                        selectedUser.filter(
                          (a) => !a?.user_category_uuid.length
                        )?.length ===
                        usersData.filter((a) => !a?.user_category_uuid.length)
                          ?.length
                          ? setSelectedUser((prev) =>
                              prev.filter((b) => !b?.user_category_uuid.length)
                            )
                          : setSelectedUser((prev) =>
                              prev?.length
                                ? [
                                    ...prev.filter(
                                      (b) => !b?.user_category_uuid.length
                                    ),
                                    ...usersData.filter(
                                      (a) => !a?.user_category_uuid.length
                                    ),
                                  ]
                                : usersData?.filter(
                                    (a) => !a?.user_category_uuid.length
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
                      .filter((a) => !a?.user_category_uuid.length)
                      ?.length.map((item) => {
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
                                selectedOrder.filter((a) =>
                                  item.user_category_uuid.find(
                                    (b) =>
                                      b.user_category_uuid === a.counter_uuid
                                  )
                                )?.length
                              }
                              selectedOrder={
                                selectedOrder.filter(
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
              {UserCategoryLength?.length ? (
                <>
                  {UserCategoryLength.map((trip) => {
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
                                  a.user_category_uuid.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )?.length ===
                                selectedUser.filter((a) =>
                                  a.user_category_uuid.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )?.length
                              }
                              onClick={() =>
                                usersData.filter((a) =>
                                  a.user_category_uuid.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )?.length ===
                                selectedUser.filter((a) =>
                                  a.user_category_uuid.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )?.length
                                  ? setSelectedUser((prev) =>
                                      prev.filter(
                                        (b) =>
                                          !b.user_category_uuid.find(
                                            (c) => c === trip.user_category_uuid
                                          )
                                      )
                                    )
                                  : setSelectedUser((prev) =>
                                      prev?.length
                                        ? [
                                            ...prev.filter(
                                              (b) =>
                                                !b.user_category_uuid.find(
                                                  (c) =>
                                                    c ===
                                                    trip.user_category_uuid
                                                )
                                            ),
                                            ...usersData.filter((a) =>
                                              a.user_category_uuid.find(
                                                (c) =>
                                                  c === trip.user_category_uuid
                                              )
                                            ),
                                          ]
                                        : usersData?.filter((a) =>
                                            a.user_category_uuid.find(
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
                                b.user_category_uuid.find(
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
                                          (a) => a.user_uuid === item.user_uuid
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
                                          (a) => a.user_uuid === item.user_uuid
                                        )?.length
                                      }
                                      selectedCounter={
                                        selectedUser.filter((a) =>
                                          item.user_category_uuid.find(
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
                  })}
                </>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
          {(step === 0 && selectedOrder.length) ||
          (step === 1 && selectedUser.length) ||
          step === 2 ? (
            <button
              className="imageselectnextBtn"
              onClick={
                step === 0
                  ? () => setStep(1)
                  : step === 1
                  ? () => setStep(2)
                  : () => downloadExel()
              }
            >
              {step === 0 || step === 1 ? "Next" : "Print Excel"}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default WaBoot;
