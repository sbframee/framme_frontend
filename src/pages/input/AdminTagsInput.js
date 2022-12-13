import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Sidebar/SideBar";
import SideBar from "../../components/Sidebar/Header";
import Card from "../../components/Card";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import ImageUploadPopup from "../../components/ImageUploadPopup";
import { Add } from "@mui/icons-material";
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
  const [popupCrop, setPopupCrop] = useState();

  const [selectedCropFile, setSelectiveCropFile] = useState();

  const [step, setStep] = useState(0);
  useEffect(() => {
    setSelectedUser(
      usersData.filter((a) =>
        selectedOrder?.user?.find((b) => b === a.user_uuid)
      )
    );
  }, [selectedOrder?.user, usersData]);
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
      url: "/images/getAllUIImages",
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
      url: "/tags/getTags",
    });
    // console.log(response);
    if (response.data.success) setOccasionsData(response.data.result);
  };
  const BaseImagesOccasionLength = useMemo(() => {
    let data = [];

    for (let trip of occasionsData) {
      data.push({
        ...trip,
        orderLength: orders.filter((b) => b?.tag_uuid === trip?.tag_uuid)?.length,
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
  const UserSubCategoryLength = useMemo(() => {
    let data = [];
    for (let item of userCategory) {
      data = [
        {
          user_category_uuid: item.user_category_uuid,
          user_sub_category_uuid: 0,
          title: "Unknown",
          orderLength: usersData.filter(
            (a) =>
              a?.user_sub_category_uuid?.length &&
              a.user_category_uuid.find((b) => b === item.user_category_uuid)
          )?.length,
        },
      ];

      for (let trip of userSubCategory) {
        console.log(trip);
        data.push({
          ...trip,
          user_category_uuid: item.user_category_uuid,
          orderLength: usersData.filter(
            (b) =>
              b.user_category_uuid?.find(
                (c) => c === item.user_category_uuid
              ) &&
              b.user_sub_category_uuid?.find(
                (c) => c === trip.user_sub_category_uuid
              )
          )?.length,
        });
      }
    }
    return data;
  }, [userCategory, userSubCategory, usersData]);
  console.log(UserSubCategoryLength);
  const downloadExel = async () => {
    let data = { ...selectedOrder, user: selectedUser.map((a) => a.user_uuid) };
    if (data.new) {
      const mainimgURL = await axios({ url: "/s3Url", method: "get" });
      let UploadURL = mainimgURL.data.url;

      axios({
        url: UploadURL,
        method: "put",
        headers: { "Content-Type": "multipart/form-data" },
        data: data.image,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => console.log(err));
      let img_url = UploadURL.split("?")[0];

      // bodyFormData.append("image", fileData);
      // bodyFormData.append("thumbnail", thumbnailData);
      data = { ...data, img_url };

      const response = await axios({
        method: "post",
        url: "/images/postImage",
        data: data,
      });

      if (response.data.success) {
        setSelectedOrder(null);
        setStep(0);
      }
    } else {
      const response = await axios({
        method: "put",
        url: "/images/putImage",
        data,
      });
      if (response.data.success) {
        setSelectedOrder(null);
        setStep(0);
      }
    }
    console.log(data);
  };
  return (
    <>
      <Header />
      <SideBar />
      <div className="item-sales-container orders-report-container">
        <h1 className="flex">Input Tag</h1>

        <div className="content-container" id="content-file-container">
          {noOrder ? (
            <div className="noOrder">{noOrder}</div>
          ) : step === 0 ? (
            <>
              {BaseImagesOccasionLength?.length ? (
                <>
                  {BaseImagesOccasionLength.map((trip) => {
                    if (
                      orders.filter((b) => b?.tag_uuid === trip?.tag_uuid)?.length
                    )
                      return (
                        <div key={trip.tag_uuid} className="sectionDiv">
                          <h1>
                            <span style={{ cursor: "pointer" }}>
                              {trip.tag_title}
                            </span>
                            <label htmlFor={trip.tag_uuid}>
                              <Add />
                              <input
                                id={trip.tag_uuid}
                                style={{ display: "none" }}
                                type="file"
                                accept="image/png, image/jpeg"
                                // value={
                                //   selectedImage?.holder?.find(
                                //     (b) => b._id === selectedHolder._id
                                //   )?.image
                                // }

                                onChange={(e) => {
                                  setPopupCrop(true);
                                  setSelectiveCropFile(e.target.files[0]);
                                  setSelectedOrder({
                                    img_type: "UI",
                                    tag_uuid: trip?.tag_uuid,
                                  });
                                }}
                              />
                            </label>
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
                              .filter((b) => b?.tag_uuid === trip?.tag_uuid)

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
                                      setSelectedOrder((prev) => item)
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
                                        selectedOrder?._id === item?._id
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
              {usersData?.filter((a) => !a?.user_category_uuid?.length)
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
                              {console.log(
                                usersData.filter((b) =>
                                  b.user_category_uuid?.find(
                                    (c) => c === trip.user_category_uuid
                                  )
                                )
                              )}
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
          {(step === 0 && selectedOrder?.tag_uuid) ||
          (step === 1 && selectedUser?.length) ? (
            <button
              className="imageselectnextBtn"
              onClick={step === 0 ? () => setStep(1) : () => downloadExel()}
              type="button"
            >
              {step === 0 ? "Next" : "Update"}
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
      {selectedCropFile && popupCrop ? (
        <ImageUploadPopup
          //   selectedimage={selectedHolder}
          file={selectedCropFile}
          onClose={() => setPopupCrop(null)}
          setSelectedFile={(e) => {
            setSelectedOrder((prev) => ({ ...prev, image: e, new: true }));
            setStep(1);
          }}
          fixed={true}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default WaBoot;
