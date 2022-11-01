import React, { useState, useEffect } from "react";
import Compressor from "compressorjs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { Cancel, DeleteOutline, Image } from "@mui/icons-material";
function PostersPopup({ onSave }) {
  const [data, setdata] = useState([]);
  const [imgdata, setImgdata] = useState([]);
  const [images, setImages] = useState();
  const [deleteImages, setDeletedImages] = useState([]);

  const getItem = async () => {
    const response = await axios({ method: "get", url: "/posters/getPoster" });
    console.log(response);
    if (response.data.success) {
      setdata(response.data.result);
    }
  };
  useEffect(() => {
    getItem();
  }, []);
  console.log(data);
  const submitHandler = async (e) => {
    e.preventDefault();
    let itemData = imgdata;
    let url = await axios.get("s3url");
    url = url.data.url;

    const result = await axios({
      url,
      method: "put",
      headers: { "Content-Type": "multipart/form-data" },
      data: images,
    });
    if (result.status === 200) {
      let image_url = url?.split("?")[0];
      itemData = { ...itemData, posters: image_url };
    }

    const response = await axios({
      method: "post",
      url: "/posters/postPosters",
      data: itemData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getItem();
      setImages("");
      setImgdata({});
      //   onSave();
    }
  };
  const deleteSubmitHandler = async (e) => {
    e.preventDefault();
    let itemData = data.filter(
      (a) => deleteImages.find((b) => b === a.posters)
    );

    const response = await axios({
      method: "delete",
      url: "/posters/deletePoster",

      data: itemData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      getItem();
      setDeletedImages([]);
      //   onSave();
    }
  };

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
          <div style={{ overflowY: "scroll" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Posters</h1>
              </div>

              <div className="formGroup">
                <div className="row">
                  <label
                    htmlFor="upload_image"
                    className="selectLabel file_upload"
                  >
                    <h2>
                      <Image />
                      Upload Image
                    </h2>

                    <input
                      type="file"
                      id="upload_image"
                      name="route_title"
                      className="numberInput"
                      style={{ display: "none" }}
                      onChange={
                        (e) => setImages(e.target.files[0])
                        // setImages((prev) =>
                        //   prev.length
                        //     ? [...prev, ...e.target.files]
                        //     : [...e.target.files]
                        // )
                      }
                      accept="image/*"
                      maxLength={60}
                    />
                  </label>
                  {images ? (
                    <div className="imageContainer flex">
                      <img
                        src={URL.createObjectURL(images)}
                        className="previwImages"
                        alt="yourimage"
                      />
                      <div
                        className="flex"
                        style={{
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "100%",
                        }}
                      >
                        <div>
                          Expiry:
                          <input
                            type="date"
                            onChange={(e) =>
                              setImgdata((prev) => ({
                                ...prev,
                                expiry: new Date(
                                  e.target.value + " 00:00:00 AM"
                                ).getTime(),
                              }))
                            }
                            value={
                              imgdata.expiry
                                ? "yy-mm-dd"
                                    .replace(
                                      "mm",
                                      (
                                        "00" +
                                        (
                                          new Date(imgdata.expiry)?.getMonth() +
                                          1
                                        ).toString()
                                      ).slice(-2)
                                    )
                                    .replace(
                                      "yy",
                                      (
                                        "0000" +
                                        new Date(imgdata.expiry)
                                          ?.getFullYear()
                                          .toString()
                                      ).slice(-4)
                                    )
                                    .replace(
                                      "dd",
                                      (
                                        "00" +
                                        new Date(imgdata.expiry)
                                          ?.getDate()
                                          .toString()
                                      ).slice(-2)
                                    )
                                : ""
                            }
                            className="searchInput"
                          />
                        </div>
                        <div>
                          Sort Order:
                          <input
                            type="number"
                            style={{ width: "50px" }}
                            onChange={(e) =>
                              setImgdata((prev) => ({
                                ...prev,
                                sort_order: e.target.value,
                              }))
                            }
                            value={imgdata.sort_order}
                            className="searchInput"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setImages(false)}
                        className="closeButton"
                        style={{
                          fontSize: "20px",
                          left: "5px",
                          padding: "0 10px",
                          width: "20px",
                          height: "20px",
                        }}
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="formGroup">
                <div
                  className="row flex"
                  style={{
                    width: "200px",
                    flexDirection: "column",
                    height: "250px",
                    overflowY: "scroll",
                  }}
                >
                  {data?.length ? (
                    data?.sort((a,b)=>a.sort_order-b.sort_order).map((img) => (
                      <div
                        className="imageContainer"
                        style={
                          deleteImages.find((b) => b === img?.posters)
                            ? { border: "1px solid red", margin: "10px 0" }
                            : { margin: "10px 0" }
                        }
                      >
                        <img
                          src={img?.posters}
                          alt="NoImage"
                          className="previwImages"
                          //   style={{width:"200px",objectFit:"contain"}}
                        />
                        {deleteImages.find((b) => b === img?.posters) ? (
                          <button
                            onClick={() =>
                              setDeletedImages((prev) =>
                                prev.filter((b) => b !== img?.posters)
                              )
                            }
                            className="closeButton"
                            style={{
                              fontSize: "20px",
                              right: "5px",
                              padding: "0 10px",
                              width: "20px",
                              height: "20px",
                            }}
                            type="button"
                          >
                            <Cancel fontSize="5px" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setDeletedImages((prev) => [
                                ...prev,
                                img?.posters,
                              ])
                            }
                            className="closeButton"
                            style={{
                              fontSize: "20px",
                              right: "5px",
                              padding: "0 10px",
                              width: "20px",
                              height: "20px",
                            }}
                            type="button"
                          >
                            <DeleteOutline fontSize="5px" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <h1>No Image Uploaded yet</h1>
                  )}
                </div>
              </div>

              {images ? (
                <button type="submit" className="submit">
                  Upload Image
                </button>
              ) : (
                ""
              )}
              {deleteImages.length ? (
                <button
                  type="button"
                  className="submit"
                  onClick={deleteSubmitHandler}
                >
                  Save
                </button>
              ) : (
                ""
              )}
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostersPopup;
