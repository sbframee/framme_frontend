import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import NoImage from "../../../assets/noImage.jpg"
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import { HiOutlineArrowCircleRight, HiOutlineArrowCircleLeft } from "react-icons/hi"

import axios from 'axios'
const UserDynamicPage = () => {
    const [images, setImages] = useState([])
    const [baseImages, setBaseImages] = useState([])
    const [tags, setTags] = useState([])

    const [updateImageData, setUpdateImageData] = useState({})
    const [selectedImage, setSelectedImage] = useState(false)
    const [deleteImage, setDeleteImage] = useState(null)
    const [switchBtn, setSwitchBtn] = useState('')
    const [deleteHolders, setDeleteHolders] = useState([])
    const params = useParams()
    const location = useLocation()
    const loginHandler = async () => {
        
          let data={user_uuid:params.user_uuid}
        // console.log(data.user_name)
        const response = await axios({
          method: "post", url: `/users/getUser`, data, headers: {
            "Content-Type": "application/json",
          },
        })
        if (response.data.success) {
          localStorage.setItem("user_uuid", response.data.result.user_uuid)
          localStorage.setItem("user_category_uuid", JSON.stringify(response.data.result.user_category_uuid||[]))
         
        }
      }
    const updateImage = async (data) => {
        const response = await axios({ method: "put", url: "/images/putImage", data })
        // console.log(response)
        if (response.data.success) {

            getBaseImageData()
            setUpdateImageData({})
        }

    }
    console.log("images", images)
    const getImageData = async () => {
        const response = await axios({ method: "get", url: "/images/getImages" })
        // console.log(response)
        if (response.data.success) {

            setImages(response.data.result);

        }



    }
    const getBaseImageData = async () => {
        let user_category_uuid = localStorage.getItem("user_category_uuid")
        user_category_uuid = location.pathname.includes("AdminOccasion") ? [] : user_category_uuid ? JSON.parse(user_category_uuid) : []
        const response = await axios({ method: "post", url: "/images/getBaseImages", data: { user_category_uuid } })
        console.log("baseImage", response)
        if (response.data.success) {
            setSelectedImage(response.data.result.find(a => a.img_url.includes(params.img_url)))
        }
    }
    console.log(selectedImage)
    useEffect(() => {
        loginHandler()
        getImageData()
    }, [])

    useEffect(() => {
        getBaseImageData()
    }, [])
    const getTags = async () => {
        let data = params.user_uuid
        const response = await axios({ method: "post", data: { user_uuid: data }, url: "/tags/getUserTags" })
        console.log(response)
        if (response.data.success)
            setTags(response.data.result)
    }
    useEffect(() => {
        getTags()
    }, [])
    useEffect(() => {
        setDeleteHolders([])
        setSwitchBtn("")
    }, [selectedImage])

    const handlePng = () => {
        setSwitchBtn('')
        htmlToImage
            .toPng(document.getElementById("my-img"))
            .then(function (dataUrl) {
                console.log(dataUrl)
                download(dataUrl, "text-img.png");
            });
    };
    const deleteHandler = async () => {
        const response = await axios({ method: "delete", data: deleteImage, url: "/images/deleteImages" })
        console.log(response)
        if (response.data.success)
            getImageData()
    }


    return (
        selectedImage ? <>
            {/* <div style={{ position: "fixed", bottom: "0", right: "100px" }}> 
                <input
                    type="radio"
                    id="delete-selection"
                    checked={switchBtn === "delete"}

                    onClick={() => setSwitchBtn(prev => prev === "delete" ? "" : "delete")}
                />
                <label htmlFor="delete-selection">Delete</label>
                <input
                    type="radio"
                    id="resize-selection"
                    checked={switchBtn === "resize"}
                    onClick={() => setSwitchBtn(prev => prev === "resize" ? "" : "resize")}

                />
                <label htmlFor="resize-selection">Resize</label>
                <input
                    type="radio"
                    id="position-selection"
                    checked={switchBtn === "position"}
                    onClick={() => setSwitchBtn(prev => prev === "position" ? "" : "position")}

                />
                <label htmlFor="position-selection">Position</label>
    </div>  
            <div onClick={() => setSelectedImage(false)} style={{ position: "absolute", right: "100px", top: "50px", cursor: "pointer", fontSize: "25px", backgroundColor: "black", color: "#fff", padding: "10px 15px", borderRadius: "30px" }}>X</div>
            <div onClick={() => setSelectedImage(baseImages?.find(a => {
                let b = selectedImage?.sort_order - 1 ? selectedImage?.sort_order - 1 : baseImages?.length;
                return a?.sort_order === b
            }) || selectedImage)} style={{ position: "absolute", right: "150px", zIndex: "9999", top: "50%", cursor: "pointer", fontSize: "35px", color: "#000", borderRadius: "30px" }} >
                <HiOutlineArrowCircleLeft />
            </div>
            <div onClick={() => setSelectedImage(baseImages?.find(a => {
                let b = selectedImage?.sort_order + 1 < baseImages?.length ? selectedImage?.sort_order + 1 : 0;
                return a?.sort_order === b
            }) || selectedImage)} style={{ position: "absolute", right: "100px", top: "50%", cursor: "pointer", fontSize: "35px", color: "#000", borderRadius: "30px" }} >
                <HiOutlineArrowCircleRight />
            </div>*/}
            <div id="my-img" className="DisplayImg" style={{
                width: (selectedImage?.coordinates[0]?.b?.split(",")[0] - selectedImage?.coordinates[0]?.a?.split(",")[0]) + "px",

                height: (selectedImage?.coordinates[0]?.d?.split(",")[1] - selectedImage?.coordinates[0]?.a?.split(",")[1]) + "px",
                // backgroundColor:"black"
            }}
            >
                <img src={`${selectedImage?.img_url}`} style={{ height: "100%", position: "absolute" }} />

                {
                    selectedImage.holder?.filter(a => {
                        let value = deleteHolders?.filter(b => a?._id === b?._id)?.length ? false : true
                        console.log("value", deleteHolders, a, value)
                        return value
                    })?.map(item => {
                        let url = tags.find(a => a.tag_uuid === item.label_uuid)
                        let coordinates = item.a.split(",")
                        let width = item.b.split(",")[0] - coordinates[0]
                        let height = item.d.split(",")[1] - coordinates[1]
                        console.log(item, url, tags)
                        if (url?.tag_type === "I")
                            return <Tag switchBtn={switchBtn} url={url} type="I" coordinates={coordinates} width={width} height={height} deleteHandler={() => setDeleteHolders(prev => [...prev, item])} />
                        else if (url?.tag_type === "T")
                            return <Tag switchBtn={switchBtn} item={item} type="T" coordinates={coordinates} width={width} height={height} url={url} deleteHandler={() => setDeleteHolders(prev => [...prev, item])} />

                    })
                }
            </div>
            <button type='button' className='downloadButton' onClick={() => handlePng()}>Download</button>

        </> : <></>

    )
}

export default UserDynamicPage
const Popup = ({ close, deleteHandler, onClick }) => {

    const submitHandler = async () => {
        deleteHandler()
        close()

    }
    return (
        <div className='popup_bg'>
            <div className='popup'>
                <div className='popup_header'><h3></h3></div>
                <div className='popup_body'>
                    <h2>Delete Image?</h2>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

                        <button onClick={close} type='button' className='inputButton' style={{ position: "static" }}>No</button>
                        <button onClick={submitHandler} type='button' className='inputButton' style={{ position: "static" }}>Yes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
const Tag = ({ url, type, coordinates, width, height, deleteHandler, switchBtn, item }) => {
    const [index, setIndex] = useState(0)
    const ref = useRef(null);
    const refLeft = useRef(null);
    const refTop = useRef(null);
    const refRight = useRef(null);
    const refBottom = useRef(null);

    useEffect(() => {
        const resizeableEle = ref.current;
        const styles = window.getComputedStyle(resizeableEle);
        let width = parseInt(styles.width, 10);
        let height = parseInt(styles.height, 10);
        let x = 0;
        let y = 0;

        resizeableEle.style.top = styles.top;
        resizeableEle.style.left = styles.left;
        // Right resize
        const onMouseMoveRightResize = (event) => {
            const dx = event.clientX - x;
            x = event.clientX;
            width = width + dx;
            resizeableEle.style.width = `${width}px`;
            resizeableEle.style.fontSize = width / 100 + "rem";

        };

        const onMouseUpRightResize = (event) => {
            document.removeEventListener("mousemove", onMouseMoveRightResize);
        };

        const onMouseDownRightResize = (event) => {
            x = event.clientX;
            resizeableEle.style.left = styles.left;
            resizeableEle.style.right = null;
            document.addEventListener("mousemove", onMouseMoveRightResize);
            document.addEventListener("mouseup", onMouseUpRightResize);
        };

        // Top resize
        const onMouseMoveTopResize = (event) => {
            const dy = event.clientY - y;
            height = height - dy;
            y = event.clientY;
            resizeableEle.style.height = `${height}px`;
        };

        const onMouseUpTopResize = (event) => {
            document.removeEventListener("mousemove", onMouseMoveTopResize);
        };

        const onMouseDownTopResize = (event) => {
            y = event.clientY;
            const styles = window.getComputedStyle(resizeableEle);
            resizeableEle.style.bottom = styles.bottom;
            resizeableEle.style.top = null;
            document.addEventListener("mousemove", onMouseMoveTopResize);
            document.addEventListener("mouseup", onMouseUpTopResize);
        };

        // Bottom resize
        const onMouseMoveBottomResize = (event) => {
            const dy = event.clientY - y;
            height = height + dy;
            y = event.clientY;
            resizeableEle.style.height = `${height}px`;
        };

        const onMouseUpBottomResize = (event) => {
            document.removeEventListener("mousemove", onMouseMoveBottomResize);
        };

        const onMouseDownBottomResize = (event) => {
            y = event.clientY;
            const styles = window.getComputedStyle(resizeableEle);
            resizeableEle.style.top = styles.top;
            resizeableEle.style.bottom = null;
            document.addEventListener("mousemove", onMouseMoveBottomResize);
            document.addEventListener("mouseup", onMouseUpBottomResize);
        };

        // Left resize
        const onMouseMoveLeftResize = (event) => {
            const dx = event.clientX - x;
            x = event.clientX;
            width = width - dx;
            resizeableEle.style.width = `${width}px`;
            resizeableEle.style.fontSize = width / 100 + "rem";

        };

        const onMouseUpLeftResize = (event) => {
            document.removeEventListener("mousemove", onMouseMoveLeftResize);
        };

        const onMouseDownLeftResize = (event) => {
            x = event.clientX;
            resizeableEle.style.right = styles.right;
            resizeableEle.style.left = null;
            document.addEventListener("mousemove", onMouseMoveLeftResize);
            document.addEventListener("mouseup", onMouseUpLeftResize);
        };
        const onMouseSelect = (event) => {
            const { clientX, clientY } = event;
            resizeableEle.style.top = clientY + "px";
            resizeableEle.style.left = clientX + "px";
            document.addEventListener("mousemove", onMouseSelectResize);
            document.addEventListener("mouseup", onMouseUpSelectResize);
        };
        const onMouseSelectResize = (event) => {
            const dx = event.clientX - x;
            x = event.clientX;
            width = width - dx;
            const dy = event.clientY - y;
            height = height + dy;
            y = event.clientY;
            resizeableEle.style.top = y + "px";
            resizeableEle.style.left = x + "px";


        };

        const onMouseUpSelectResize = (event) => {
            document.removeEventListener("mousemove", onMouseSelectResize);
        };

        // Add mouse down event listener
        if (switchBtn === "resize") {

            const resizerRight = refRight.current;
            resizerRight.addEventListener("mousedown", onMouseDownRightResize);
            const resizerTop = refTop.current;
            resizerTop.addEventListener("mousedown", onMouseDownTopResize);
            const resizerBottom = refBottom.current;
            resizerBottom.addEventListener("mousedown", onMouseDownBottomResize);
            const resizerLeft = refLeft.current;
            resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);
            return () => {
                resizerRight.removeEventListener("mousedown", onMouseDownRightResize);
                resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
                resizerBottom.removeEventListener("mousedown", onMouseDownBottomResize);
                resizerLeft.removeEventListener("mousedown", onMouseDownLeftResize);
            }
        }
        else if (switchBtn === "position") {

            const reposition = ref.current;
            reposition.addEventListener("mousedown", onMouseSelect);
            return () =>
                reposition.removeEventListener("mousedown", onMouseSelect);
        }

    }, [switchBtn]);
    console.log(url)
    return type === "T" && url?.text?.sort((a, b) =>
        +a.sort_order - +b.sort_order)[index]?.text ?
        <div ref={ref} className="resizeable" style={{ border: switchBtn === "resize" || switchBtn === "position" ? `2px solid ${item.text_color}` : "none", fontSize: width / 100 + "rem", overflow: "hidden", left: coordinates[0] + "px", top: coordinates[1] + "px", width: width + "px", height: height + "px", position: "absolute", color: item.text_color }}>
            <div style={{ cursor: "pointer" }} onClick={() => switchBtn === "delete" ? deleteHandler() : setIndex(prev => (prev + 1) % url.text.sort((a, b) =>
                +a.sort_order - +b.sort_order).length)}>
                {url?.text.sort((a, b) =>
                    +a.sort_order - +b.sort_order)[index].text}
            </div>
            <div ref={refLeft} className="resizer resizer-l"></div>
            <div ref={refTop} className="resizer resizer-t"></div>
            <div ref={refRight} className="resizer resizer-r"></div>
            <div ref={refBottom} className="resizer resizer-b"></div>
        </div>
        :
        <div ref={ref} className="resizeable" style={{ cursor: "pointer", left: coordinates[0] + "px", top: coordinates[1] + "px", width: width + "px", height: height + "px", position: "absolute" }}>
            {url?.img_url?.sort((a, b) =>
                +a.sort_order - +b.sort_order)[index]?.img_url ?

                <img onClick={() => switchBtn === "delete" ? deleteHandler() : setIndex(prev => (prev + 1) % url?.img_url?.sort((a, b) =>
                    +a.sort_order - +b.sort_order)?.length)} src={url.img_url.sort((a, b) =>
                        +a.sort_order - +b.sort_order)[index]?.img_url} className='holders' style={{ width: "100%", height: "100%" }} /> : <></>}

            <div ref={refLeft} style={switchBtn === "resize" ? { width: `5px`, height: "100%", background: `#000` } : {}} className="resizer resizer-l"></div>
            <div ref={refTop} style={switchBtn === "resize" ? { height: `5px`, width: "100%", background: `#000` } : {}} className="resizer resizer-t"></div>
            <div ref={refRight} style={switchBtn === "resize" ? { width: `5px`, background: `#000` } : {}} className="resizer resizer-r"></div>
            <div ref={refBottom} style={switchBtn === "resize" ? { height: `5px`, width: "100%", background: `#000` } : {}} className="resizer resizer-b"></div>
        </div>

}