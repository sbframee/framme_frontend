import React, { useState, useEffect } from 'react'
import "./category.css"
import SideBar from "../../components/Sidebar/SideBar";
import Compressor from 'compressorjs';


import axios from "axios"
import { v4 as uuid } from "uuid"
import { MdDelete } from 'react-icons/md';

const Category = () => {
    const [categoriesData, setCategoriesData] = useState([])
    const [popup, setPopup] = useState(false)
    const [popupInfo, setPopupInfo] = useState({})
const [deleteItem,setDeleteItem]=useState(null)
    const getCategoriesData = async (data) => {
        const response = await axios({ method: "get", url: "/categories/getCategories", data })
        console.log(response)
        if (response.data.success)
            setCategoriesData(response.data.result||[])
    }
    const deleteCategoriesData = async (data) => {
        const response = await axios({ method: "delete",data:deleteItem, url: "/categories/deleteCategory" })
        console.log(deleteItem)
        if (response.data.success)
            getCategoriesData()
    }
    useEffect(() => {
        getCategoriesData()
    }, [])
    return (
        <> <SideBar />

            <div className='occasion'>

                <h1>Categories</h1>
                <div style={{ width: "80%" }}>
                    <button className='add_button' type='button' onClick={() => { setPopupInfo({ type: "new" }); setPopup(true) }}>Add Category</button>

                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>SR. No</th>
                            <th>Title</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {categoriesData.length ? categoriesData.map((item, i) =>
                            <tr>
                                <td>{i + 1}</td>
                                <td>{item?.title || "-"}</td>
                                <td>{item?.sort_order || "-"}</td>
                                <td>{item?.status}</td>
                                <td style={{ textAlign: "center" }}>
                                    <button className='edit_button' type='button' onClick={() => { setPopupInfo({ type: "edit", item }); setPopup(true) }}>Edit</button>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <MdDelete style={{ backgroundColor: "red" }} className='edit_button' type='button' onClick={() => setDeleteItem(item)}/>
                                </td>
                            </tr>
                        )
                            : <tr><td colSpan={5} style={{ textAlign: "center" }}>No Content</td></tr>}
                    </tbody>
                </table>
            {deleteItem ? <ConfirmPopup close={() => setDeleteItem(null)} deleteHandler={deleteCategoriesData} /> : ""}

                {popup ? <Popup popupInfo={popupInfo} close={() => { setPopup(false); setPopupInfo({}) }} setCategoriesData={setCategoriesData} /> : ""}
            </div>  </>
    )
}
const Popup = ({ popupInfo, setCategoriesData, close }) => {
    const [data, setData] = useState({})
    // const [preview, setPreview] = useState()
    const [posters, setPosters] = useState([])
    useEffect(() => popupInfo.type === "edit" ? setData(popupInfo.item) : setData({ cat_uuid: uuid(), status: "1" }), [])
    const submitHandler = async () => {
        var bodyFormData = new FormData();
        // console.log("thumbnail", data.thumbnail)
        // bodyFormData.append('thumbnail', data.thumbnail);
        bodyFormData.append('value', JSON.stringify(data));
        for (let i of posters) {
            bodyFormData.append('images', i);

        }
        if (popupInfo.type === "edit") {

            const response = await axios({
                method: "put", url: "/categories/putCategory", data: bodyFormData
            })
            if (response.data.success) {
                setCategoriesData(prev => prev.map(i => i.cat_uuid === data.cat_uuid ? data : i))
                close()
            }

        } else {

            const response = await axios({ method: "post", url: "/categories/postCategory", data: bodyFormData })
            if (response.data.success) {
                setCategoriesData(prev => [...prev, data])
                close()
            }
        }
    }
    // useEffect(() => {
    //     if (!data.thumbnail) {
    //         setPreview(undefined)
    //         return
    //     }

    //     const objectUrl = URL.createObjectURL(data.thumbnail)
    //     setPreview(objectUrl)


    //     return () => URL.revokeObjectURL(objectUrl)
    // }, [data])

    // const onSelectFile = e => {
    //     if (!e.target.files || e.target.files.length === 0) {
    //         // setSelectedFile(undefined)
    //         return
    //     }
    //     handleCompressedUpload(e)
    //     // setData(e.target.files[0])

    // }
    // const handleCompressedUpload = (e) => {
    //     const image = e.target.files[0];
    //     new Compressor(image, {
    //         quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
    //         success: (compressedResult) => {
    //             const id = uuid()
    //             let thumbnailData = new File([compressedResult], id);
    //             console.log(thumbnailData)
    //             setData({ ...data, thumbnail: thumbnailData })
    //         },
    //     });
    // };
    return (
        <div className='popup_bg'>
            <div className='popup'>
                <div className='popup_header'><h3>{popupInfo.type === "edit" ? data?.title || "-" : "New Category"}</h3><div className='exit_btn' onClick={close}>X</div></div>
                <div className='popup_body'>
                    <div>Title<input placeholder='Title' value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
                    <div>Sort Order<input placeholder='Sort Order' value={data.sort_order} onChange={e => setData({ ...data, sort_order: e.target.value.replace(/\D/, '') })} /></div>
                    <div>Status<select value={data.status} onChange={e => setData({ ...data, status: e.target.value })}>
                        <option value="1">1</option>
                        <option value="0">0</option>
                    </select></div>
                    {/* <div>Thumbnail
                        <input type='file' onChange={onSelectFile} accept="image/png, image/jpeg" />
                        <br />
                        <img className='image' src={preview || data.Thumbnail_url} alt="No Image" />
                    </div> */}
                    {/* <div>Posters
                        <input type='file' onChange={e => {
                            let files = e.target.files
                            files = Array.from(files).map(file => (new File([file], uuid() + "." + (file.name.split(".")[1] || "png"))))
                            setPosters(files)
                        }} accept="image/png, image/jpeg" multiple />
                        <br />
                        {/* {data?.poster_url?.map(a => <img className='posters' src={a} />)} */}

                   {/*} </div> */}
                    <button onClick={submitHandler} type='button' className='add_button'>{popupInfo.type === "edit" ? "Update" : "Add"}</button>
                </div>
            </div>

        </div>
    )
}
export default Category
const ConfirmPopup = ({ close, deleteHandler }) => {

    const submitHandler = async () => {
        deleteHandler()
        close()

    }
    return (
        <div className='popup_bg'>
            <div className='popup'>
                <div className='popup_header'><h3></h3></div>
                <div className='popup_body'>
                    <h2>Confirm Delete?</h2>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

                        <button onClick={close} type='button' className='inputButton' style={{ position: "static" }}>No</button>
                        <button onClick={submitHandler} type='button' className='inputButton' style={{ position: "static" }}>Yes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}