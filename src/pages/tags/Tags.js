import React, { useState, useEffect } from 'react'
import "./tags.css"
import SideBar from "../../components/Sidebar/SideBar";
import { MdDelete } from 'react-icons/md';

import axios from "axios"
import { v4 as uuid } from "uuid"
const Tags = () => {
    const [tagsData, setTagsData] = useState([])
    const [popup, setPopup] = useState(false)
    const [popupInfo, setPopupInfo] = useState({})
const [deleteItem,setDeleteItem]=useState(null)

    const getTagsData = async () => {
        const response = await axios({ method: "get", url: "/tags/getTags" })
        console.log(response)
        if (response.data.success)
            setTagsData(response.data.result)
    }
    const deleteTagData = async (data) => {
        const response = await axios({ method: "delete",data:deleteItem, url: "/tags/deleteTags" })
        console.log(response)
        if (response.data.success)
            getTagsData()
    }
    useEffect(() => {
        getTagsData()
    }, [])
    return (
        <>
            <SideBar />
            <div className='tags'>
                <h1>Tags</h1>
                <div style={{ width: "80%" }}>
                    <button className='add_button' type='button' onClick={() => { setPopupInfo({ type: "new" }); setPopup(true) }}>Add Tags</button>

                </div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>SR. No</th>
                            <th>Title</th>
                            <th>Type</th>

                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {tagsData.length ? tagsData.map((item, i) =>
                            <tr>
                                <td>{i + 1}</td>
                                <td>{item?.tag_title || "-"}</td>
                                <td>{item?.tag_type === "I" ? "Image" : item.tag_type === "T" ? "Text" : "-"}</td>

                                <td style={{ textAlign: "center" }}>
                                    <button className='edit_button' type='button' onClick={() => { setPopupInfo({ type: "edit", item }); setPopup(true) }}>Edit</button>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <MdDelete className='edit_button' style={{backgroundColor:"red"}} type='button' onClick={() => setDeleteItem(item)}>Edit</MdDelete>
                                </td>
                            </tr>
                        )
                            : <tr><td colSpan={5} style={{ textAlign: "center" }}>No Content</td></tr>}
                    </tbody>
                </table>
            {deleteItem ? <ConfirmPopup close={() => setDeleteItem(null)} deleteHandler={deleteTagData} /> : ""}

                {popup ? <Popup popupInfo={popupInfo} close={() => { setPopup(false); setPopupInfo({}) }} setTagsData={setTagsData} /> : ""}
            </div>
        </>
    )
}
const Popup = ({ popupInfo, setTagsData, close }) => {
    const [data, setData] = useState({})
    useEffect(() => popupInfo.type === "edit" ? setData(popupInfo.item) : setData({ tag_uuid: uuid(), tag_type: "T",min:"0",max:"1" }), [])
    console.log(data)
    const submitHandler = async () => {
        if (popupInfo.type === "edit") {

            const response = await axios({
                method: "put", url: "/tags/putTags", data, headers: {
                    "Content-Type": "application/json",

                },
            })
            if (response.data.success) {
                setTagsData(prev => prev.map(i => i.tag_uuid === data.tag_uuid ? data : i))
                close()
            }

        } else {
            const response = await axios({
                method: "post", url: "/tags/postTags", data, headers: {
                    "Content-Type": "application/json",

                },
            })
            if (response.data.success) {
                setTagsData(prev => [...prev, data])
                close()
            }
        }
    }
    return (
        <div className='popup_bg'>
            <div className='popup'>
                <div className='popup_header'><h3>{popupInfo.type === "edit" ? data?.tag_title || "-" : "New Tags"}</h3><div className='exit_btn' onClick={close}>X</div></div>
                <div className='popup_body'>
                    <div>Title<input placeholder='Title' value={data.tag_title} onChange={e => setData({ ...data, tag_title: e.target.value })} /></div>
                    <div>Minimum<input placeholder='Min' value={data.min} onChange={e => setData({ ...data, min: e.target.value.replace(/\D/, '') })} /></div>
                    <div>Maximum<input placeholder='Max' value={data.max} onChange={e => setData({ ...data, max: e.target.value.replace(/\D/, '') })} /></div>
                    <div>
                        Type
                        <select value={data.tag_type} onChange={e => setData({ ...data, tag_type: e.target.value })} >
                            <option value="T">
                                Text
                            </option>
                            <option value="I">
                                Image
                            </option>
                        </select>
                    </div>
                    <button onClick={submitHandler} type='button' className='add_button'>{popupInfo.type === "edit" ? "Update" : "Add"}</button>
                </div>
            </div>
        </div>
    )
}
export default Tags
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