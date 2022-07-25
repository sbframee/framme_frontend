import React, { useState, useEffect } from "react";

import axios from "axios";
import "./index.css";
import { useNavigate } from "react-router-dom";

import { v4 as uuid } from "uuid";
import { MdDelete } from "react-icons/md";
import ImageUploadPopup from "../../components/ImageUploadPopup";
const InputPage = () => {
  const [tagsData, setTagsData] = useState([]);
  const [seletiveCropFile, setSelectiveCropFile] = useState();
  const [popupCrop, setPopupCrop] = useState();
  const [inputData, setInputData] = useState([]);
  const [state, setState] = useState(false);
  const navigate = useNavigate();
  let defaultObject = {
    img_url: "",
    img_type: "UI",
    user: [localStorage.getItem("user_uuid")],
    tag_uuid: "",
    text: "",
    image: "",
  };
  useEffect(() => {
    if (tagsData.length) {
      setInputData(tagsData.map((a) => ({ ...defaultObject, ...a })));
    }
  }, [tagsData]);
  const getTagsData = async () => {
    let data = localStorage.getItem("user_uuid");
    const response = await axios({
      method: "post",
      data: { user_uuid: data },
      url: "/tags/getUserTags",
    });
    console.log(response);
    if (response.data.success) setTagsData(response.data.result);
  };
  useEffect(() => {
    getTagsData();
  }, [state]);
  const onSubmit = async () => {
    for (let item of inputData) {
      if (item.text.length) {
        for (let data of item.text) {
          let response = await axios({
            method: "post",
            url: "/tags/tagText",
            data,
          });
          // console.log(response)
        }
      } else if (item.img_url.length) {
        for (let data of item.img_url) {
          console.log("------------------", data);
          let formData = new FormData();
          formData.append("value", JSON.stringify(data));
          formData.append("images", data.image);
          let response = await axios({
            method: "post",
            url: "/tags/tagImages",
            data: formData,
          });
          console.log(response);
        }
      }
    }
    navigate("/users");
  };
  const deleteHandler = async (item) => {
    const response = await axios({
      method: "delete",
      data: item,
      url: "/images/deleteImages",
    });
    console.log(response);
    if (response.data.success) setState((prev) => !prev);
  };
  const getRows = (item) => {
    let rows = [];
    for (let i = 0; i < item.max; i++) {
      if (item.tag_type === "T") {
        let itemData = inputData
          .find((a) => a.tag_uuid === item.tag_uuid)
          ?.text.find((b) => +b.sort_order === i + 1);
        rows.push(
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: itemData?.fontFamily || "sans-serif",
            }}
          >
            {console.log("item", itemData,item)}
            input:
            <input
              type="text"
              value={itemData?.text}
              onChange={(e) =>
                setInputData(
                  inputData.map((a) =>
                    a.tag_uuid === item.tag_uuid
                      ? {
                          ...defaultObject,
                          ...a,
                          tag_uuid: item.tag_uuid,
                          text: [
                            {
                              ...(a.text.find((b) => +b.sort_order === i + 1) ||
                                defaultObject),
                              text: e.target.value,
                              sort_order: i + 1,
                              tag_uuid: item.tag_uuid,
                            },
                            ...a.text.filter((b) => +b.sort_order !== i + 1),
                          ],
                        }
                      : a
                  )
                )
              }
            />
            Font Style:
            <select
              placeholder="#000"
              value={itemData?.fontFamily || "sans-serif"}
              onChange={(e) =>
                setInputData(
                  inputData.map((a) =>
                    a.tag_uuid === item.tag_uuid
                      ? {
                          ...a,
                          fontFamily: e.target.value,
                        }
                      : a
                  )
                )
              }
            >
              <option value="sans-serif" style={{ fontFamily: "sans-serif" }}>
                Normal
              </option>
              <option value="Roboto" style={{ fontFamily: "Roboto" }}>
                Roboto
              </option>
              <option value="Fascinate" style={{ fontFamily: "Fascinate" }}>
                Fascinate
              </option>
              <option value="Lato" style={{ fontFamily: "Lato" }}>
                Lato
              </option>
              <option
                value="Montserrat Alternates"
                style={{ fontFamily: "Montserrat Alternates" }}
              >
                Montserrat Alternates
              </option>
              <option value="Open Sans" style={{ fontFamily: "Open Sans" }}>
                Open Sans
              </option>
              <option value="Oswald" style={{ fontFamily: "Oswald" }}>
                Oswald
              </option>
              <option
                value="Raleway Dots"
                style={{ fontFamily: "Raleway Dots" }}
              >
                Raleway Dots
              </option>
              <option
                value="Rubik Moonrocks"
                style={{ fontFamily: "Rubik Moonrocks" }}
              >
                Rubik Moonrocks
              </option>
              <option value="Slabo 27px" style={{ fontFamily: "Slabo 27px" }}>
                Slabo
              </option>
              <option value="Smooch" style={{ fontFamily: "Smooch" }}>
                Smooch
              </option>
              <option value="Titan One" style={{ fontFamily: "Titan One" }}>
                Titan One
              </option>
            </select>
            Color:
            <select
              placeholder="#000"
              value={itemData?.text_color || "#000"}
              onChange={(e) =>
                setInputData(
                  inputData.map((a) =>
                    a.tag_uuid === item.tag_uuid
                      ? {
                          ...defaultObject,
                          ...a,
                          tag_uuid: item.tag_uuid,
                          text_color: e.target.value,
                        }
                      : a
                  )
                )
              }
            >
              <option
                value="#000"
                style={{ backgroundColor: "#000", color: "#000" }}
              >
                Black
              </option>
              <option
                value="#F81F09"
                style={{ backgroundColor: "#F81F09", color: "#F81F09" }}
              >
                F81F09
              </option>
              <option
                value="#F8A509"
                style={{ backgroundColor: "#F8A509", color: "#F8A509" }}
              >
                F8A509
              </option>
              <option
                value="#31F809"
                style={{ backgroundColor: "#31F809", color: "#31F809" }}
              >
                31F809
              </option>
              <option
                value="#09F8ED"
                style={{ backgroundColor: "#09F8ED", color: "#09F8ED" }}
              >
                09F8ED
              </option>
              <option
                value="#092AF8"
                style={{ backgroundColor: "#092AF8", color: "#092AF8" }}
              >
                092AF8
              </option>
              <option
                value="#F809D4"
                style={{ backgroundColor: "#F809D4", color: "#F809D4" }}
              >
                F809D4
              </option>
              <option
                value="#FFFFFF"
                style={{ backgroundColor: "#FFFFFF", color: "#FFFFFF" }}
              >
                FFFFFF
              </option>
            </select>
            {/* {itemData?.text ? <div className='textToImageContainer' id="textToImageId">
                        <h1>{itemData?.text}</h1>
                    </div> : ""} */}
          </div>
        );
      } else if (item.tag_type === "I") {
        let itemData = inputData?.find(
          (a) => a.tag_uuid === item.tag_uuid
        )?.img_url;
        // console.log(itemData)
        itemData = itemData?.length
          ? itemData?.find((b) => +b.sort_order === i + 1)
          : {};

        rows.push(
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="file"
              onChange={(e) => {
                setSelectiveCropFile(e.target.files[0]);
                setPopupCrop({ item, i });
              }}
              accept="image/png, image/jpeg"
            />
            {/* URL.createObjectURL(selectedFile) */}
            {/* {console.log(itemData)} */}
            {itemData?.img_url || itemData?.image ? (
              <div className="textToImageContainer">
                <img
                  src={
                    itemData?.img_url || URL.createObjectURL(itemData?.image)
                  }
                />
                <MdDelete
                  onClick={() => deleteHandler(itemData)}
                  style={{ fontSize: "20px", cursor: "pointer" }}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        );
      }
    }
    return rows;
  };
  return (
    <>
      {/* <SideBar /> */}
      <div className="inputPage">
        {tagsData.map((item) => (
          <div className="tagsInput">
            <h2>{item.tag_title}</h2>
            <div
              style={{
                border: "2px solid black",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {getRows(item)}
            </div>
          </div>
        ))}
        <button type="button" className="tagInputSaveButton" onClick={onSubmit}>
          Save
        </button>
      </div>
      {seletiveCropFile && popupCrop ? (
        <ImageUploadPopup
          file={seletiveCropFile}
          onClose={() => setTimeout(() => setPopupCrop(null), 2000)}
          setSelectedFile={(file) => {
            setInputData(
              inputData.map((a) =>
                a.tag_uuid === popupCrop.item.tag_uuid
                  ? {
                      ...defaultObject,
                      tag_uuid: popupCrop.item.tag_uuid,
                      img_url: [
                        {
                          ...(a.img_url.find(
                            (b) => +b.sort_order === popupCrop.i + 1
                          ) || defaultObject),
                          image: new File([file], uuid()),
                          sort_order: popupCrop.i + 1,
                          tag_uuid: popupCrop.item.tag_uuid,
                        },
                        ...a.img_url.filter(
                          (b) => +b.sort_order !== popupCrop.i + 1
                        ),
                      ],
                    }
                  : a
              )
            );
          }}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default InputPage;