import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Canvas from "../components/canvas";
import { v4 as uuid } from "uuid";
import SideBar from "./../components/Sidebar/SideBar";
import { ImCross } from "react-icons/im";
import Compressor from "compressorjs";
import ImageUploadPopup from "../components/ImageUploadPopup";
import Headers from "../components/Sidebar/Header";
import { Image } from "@mui/icons-material";
const DEFAULT_IMAGE_DATA = {
  img_url: "",
  image_type: "",
  coordinates: [
    {
      a: "",
      b: "",
      c: "",
      d: "",
      base_url: "",
    },
  ],
  user: [],
  holder: [],
  remark: "",
  occ_uuid: "",
};
const PictureUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [popupCrop, setPopupCrop] = useState();
  const [selectedCropFile, setSelectiveCropFile] = useState();
  const [thumbnail, setThumbnail] = useState();
  const [preview, setPreview] = useState();
  const imageArea = useRef();
  const [categoriesData, setCategoriesData] = useState([]);
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [templateHoldersData, setTemplateHoldersData] = useState([]);
  const [tempstate, setTempState] = useState(false);

  const [imageData, setImageData] = useState(DEFAULT_IMAGE_DATA);
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);
  const getHoldersTemplateData = async () => {
    const response = await axios({
      method: "get",
      url: "/holderTemplate/getHolderTemplate",
    });

    console.log(response);
    if (response.data.success) setTemplateHoldersData(response.data.result);
  };
  useEffect(() => {
    getHoldersTemplateData();
  }, []);
  const getCategoriesData = async () => {
    const response = await axios({
      method: "get",
      url: "/userCategory/getUserCategory",
    });

    console.log(response);
    if (response.data.success) setCategoriesData(response.data.result);
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
    getCategoriesData();
    getSubCategoriesData();
  }, []);
  useEffect(() => {
    if (selectedFile) handleCompressedUpload(selectedFile);
  }, [selectedFile]);
  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    setPopupCrop(true);
    setSelectiveCropFile(e.target.files[0]);
  };
  const handleCompressedUpload = (e) => {
    const image = e;
    new Compressor(image, {
      quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        // compressedResult has the compressed file.
        // Use the compressed file to upload the images to your server.
        setThumbnail(compressedResult);
      },
    });
  };

  const submitHandler = async (temp, user_category_uuid) => {
    let obj = {
      ...imageData,
      user_category_uuid,

      img_type: "B",
      remarks: "",
      acc_uuid: "",
      occ_uuid: temp,
      user: [0],
      coordinates: [
        {
          base_img_url: "",
          a: `0,0`,
          b: `${imageArea?.current?.offsetWidth},0`,
          c: `${imageArea?.current?.offsetWidth},${imageArea?.current?.offsetHeight}`,
          d: `0,${imageArea?.current?.offsetHeight}`,
        },
      ],
    };
    if (!imageData.img_url) {
      const mainimgURL = await axios({ url: "/s3Url", method: "get" });
      let UploadURL = mainimgURL.data.url;

      axios({
        url: UploadURL,
        method: "put",
        headers: { "Content-Type": "multipart/form-data" },
        data: selectedFile,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => console.log(err));
      let img_url = UploadURL.split("?")[0];
      const mainThumbnailURL = await axios({ url: "/s3Url", method: "get" });
      let UploadThumbnailURL = mainThumbnailURL.data.url;

      axios({
        url: UploadThumbnailURL,
        method: "put",
        headers: { "Content-Type": "multipart/form-data" },
        data: thumbnail,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => console.log(err));
      let thumbnail_url = UploadThumbnailURL.split("?")[0];
      // bodyFormData.append("image", fileData);
      // bodyFormData.append("thumbnail", thumbnailData);
      obj = { ...obj, img_url, thumbnail_url };
    }
    console.log(obj);
    const response = await axios({
      method: "post",
      url: "/images/postImage",
      data: obj,
    });
    console.log(obj, response);
    if (response.data.success) {
      // setSelectedFile(null);
      // setPreview(null);
      setTempState(true);
      setImageData({
        ...DEFAULT_IMAGE_DATA,
        img_url: obj.img_url,
        thumbnail_url: obj.thumbnail_url,
      });
    }
  };

  return (
    <>
      <SideBar />
      <Headers />
      <div className="item-sales-container orders-report-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPopup(true);
          }}
          className="picture_upload"
        >
          {selectedFile ? (
            <>
              <div className="image_container">
                <img src={preview} ref={imageArea} />
                <Canvas
                  templateHoldersData={templateHoldersData}
                  imageArea={imageArea}
                  ImageData={imageData}
                  setImageData={setImageData}
                  tempstate={tempstate}
                  setTempState={setTempState}
                />
              </div>

              <button
                style={{ position: "absolute", padding: "8px 12px" }}
                className="save_button"
              >
                Save
              </button>
              {imageData.img_url && imageData.holder.length === 0 ? (
                <button
                  style={{
                    position: "absolute",
                    left: "40vw",
                    padding: "8px 12px",
                  }}
                  className="save_button"
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImageData(DEFAULT_IMAGE_DATA);
                    setPreview(null);
                  }}
                >
                  Clear
                </button>
              ) : (
                ""
              )}
            </>
          ) : (
            <>
              <label
                htmlFor="mainBasePictue"
                className="picture_upload_container"
              >
                <Image />
                Upload frame
                <input
                  type="file"
                  id="mainBasePictue"
                  onChange={onSelectFile}
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }}
                />
              </label>
            </>
          )}
        </form>
      </div>
      {popup ? (
        <NamePopup
          imageData={imageData}
          categoriesData={categoriesData}
          submitHandler={submitHandler}
          close={() => {
            setPopup(false);
          }}
          subCategoriesData={subCategoriesData}
        />
      ) : (
        ""
      )}
      {selectedCropFile && popupCrop ? (
        <ImageUploadPopup
          file={selectedCropFile}
          onClose={() => setPopupCrop(null)}
          setSelectedFile={setSelectedFile}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default PictureUpload;
const NamePopup = ({
  close,
  imageData,
  submitHandler,
  categoriesData,
  subCategoriesData,
}) => {
  const [occasionsTemp, setOccasionsTemp] = useState([]);
  const [occasionsData, setOccasionsData] = useState([]);
  const [warning, setWarning] = useState("");
  const [data, setData] = useState({ user_category_uuid: [] });
  const [holderData, setHolderData] = useState({});
  const [holderState, setHolderState] = useState(false);
  useEffect(() => {
    if (imageData.holder.length)
      setHolderData({
        ...holderData,
        ht_uuid: uuid(),
        holder: imageData.holder,
      });
  }, []);
  const getTagsData = async () => {
    const response = await axios({
      method: "get",
      url: "/occasions/getOccasions",
    });
    console.log(response);
    if (response.data.success) {
      setOccasionsData(response.data.result);
    }
  };
  useEffect(() => {
    getTagsData();
  }, []);

  const saveHandler = () => {
    if (holderData && holderData.ht_title === "") {
      setWarning("enter holder title");
    }
    if (holderState) {
      axios({
        method: "post",
        url: "/holderTemplate/postHolderTemplate",
        data: holderData,
      })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
    submitHandler(occasionsTemp, data.user_category_uuid);

    setTimeout(close, 1000);
  };
  const onChangeHandler = (e) => {
    let data = occasionsTemp || [];
    let options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    for (let i of options) {
      if (occasionsTemp.filter((a) => a.occ_uuid === i).length)
        data = data.filter((a) => a.occ_uuid !== i);
      else data = [...data, occasionsData.find((a) => a.occ_uuid == i)];
    }
    // data = occasionsData.filter(a => options.filter(b => b === a.occ_uuid).length)
    console.log(options, data);

    setOccasionsTemp(data);
  };
  const onCategoryChangeHandler = (e) => {
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
    <div className="label_popup_container">
      <div className="label_popup" style={{ position: "relative" }}>
        <div className="label_popup_header">
          Occasions{" "}
          <ImCross
            onClick={close}
            style={{
              position: "absolute",
              right: "10px",
              width: "20px",
              top: "5px",
              cursor: "pointer",
            }}
          />
        </div>

        <select
          className="label_popup_input"
          style={{ width: "200px" }}
          value={occasionsTemp.map((a) => a.occ_uuid)}
          onChange={onChangeHandler}
          multiple
        >
          {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
          {occasionsData.map((occ) => (
            <option value={occ.occ_uuid}>{occ.title}</option>
          ))}
        </select>
        <div className="label_popup_header">User Category</div>
        <select
          className="label_popup_input"
          style={{ width: "200px" }}
          value={data.user_category_uuid}
          onChange={onCategoryChangeHandler}
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
        {subCategoriesData.filter(
          (a) =>
            data.user_category_uuid.filter((b) => b === a.user_category_uuid)
              .length
        ).length ? (
          <>
            <div className="label_popup_header">User Sub Category</div>
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
                .filter(
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
          </>
        ) : (
          ""
        )}
        <div className="label_popup_header">Save Holder Template</div>
        <select
          className="label_popup_input"
          style={{ width: "200px" }}
          value={holderState}
          onChange={(e) => setHolderState(e.target.value)}
        >
          {/* <option selected={occasionsTemp.length===occasionsData.length} value="all">All</option> */}
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </select>
        {holderState ? (
          <>
            <div className="label_popup_header">
              Enter Holder Template Title
            </div>
            <input
              className="label_popup_input"
              placeholder="Holder Template Title"
              value={holderData?.ht_title}
              onChange={(e) =>
                setHolderData({ ...holderData, ht_title: e.target.value })
              }
            />
          </>
        ) : (
          ""
        )}
        {warning ? <div style={{ color: "red" }}>{warning}</div> : ""}
        <button
          type="button"
          style={{ padding: "8px 12px", fontSize: "20px", borderRadius: "0" }}
          className="save_button"
          onClick={saveHandler}
        >
          Save
        </button>
      </div>
    </div>
  );
};
