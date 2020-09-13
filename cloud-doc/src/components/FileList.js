import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'

const {remote} = window.require('electron')
const {Menu,MenuItem} = remote

const FileList = ({files,onFileClick,onSaveEdit,onFileDelete})=>{
    const [editstatus,setEditStatus] = useState(false)
    const [value,setValue] = useState('')
    const enterKeyPress = useKeyPress(13)
    const escKeyPress = useKeyPress(27)
    let node = useRef(null)

    const closeSearch = (edititem)=>{ 
        setEditStatus(false)
        setValue('')
        if (edititem.isNew){
            onFileDelete(editstatus)
        }
    }

    const clickItem = useContextMenu([
        {
            label: "打开",
            click: () => {
                console.log('open',clickItem.current)
            }
        },
        {
            label: "重命名",
            click: () => {
                console.log('rename')
            }
        },
        {
            label: "删除",
            click: () => {
                console.log('delete')
            }
        },
    ],'.file-list')
    useEffect(() => {
        const edititem = files.find(file => file.id === editstatus)
        if (enterKeyPress && editstatus && value.trim()!=='')
        { 
            onSaveEdit(edititem.id, value, edititem.isNew)
            setEditStatus(false)
            setValue('')
        }
        if (escKeyPress && editstatus)
        {
            closeSearch(edititem)
        }
    })
    //在inputActive 的时候高亮
    useEffect(() => {
        if (editstatus) {
            node.current.focus()
        }
        const newFile = files.find(file => file.isNew)
        if (newFile && newFile.isNew && (editstatus !== newFile.id)) {
            onFileDelete(newFile.id)
        }
    }, [editstatus])

    useEffect(()=>{
        const newFile = files.find(file=>file.isNew)
        if (newFile){
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    },[files])

    return (
        <ul className="list-group  list-group-flush file-list ">
            {
                files.map(file=>(
                    <li
                        className=" mx-0 list-group-item bg-light d-flex row justify-content-between justify-content-center align-items-cente file-item"
                        key = {file.id}
                    >   
                        { ((file.id !== editstatus) && !file.isNew) &&
                        <>
                            <span className='col-2'>
                                <FontAwesomeIcon
                                    size='lg'
                                    icon={faMarkdown} />
                            </span>
                            <span className="col-6 c-link"
                            onClick={()=>{onFileClick(file.id)}}>{file.title}</span>
                            <button
                                type="button"
                                className="icon-button col-2"
                                onClick={(e) => {setEditStatus(file.id); setValue(file.title)}}>
                                <FontAwesomeIcon
                                    title="编辑"
                                    size='lg'
                                    icon={faEdit} />
                            </button>
                            <button
                                type="button"
                                className="icon-button col-2"
                                onClick={() => {onFileDelete(file.id)}}>
                                <FontAwesomeIcon
                                    title="删除"
                                    size='lg'
                                    icon={faTrash} />
                            </button>
                        </>
                        }
                        {((file.id === editstatus) || (file.isNew && file.id === editstatus)) &&
                        <>
                            <input
                                className="form-control col-10 "
                                value={value}
                                ref={node}
                                placeholder = "请输入文件名称"
                                onChange={(e) => { setValue(e.target.value) }}
                            />
                            <button
                                type="button"
                                className="icon-button col-2"
                                onClick = {(e)=>{closeSearch(file);}}
                                >
                                <FontAwesomeIcon
                                    title = "关闭"
                                    size='lg'
                                    icon={faTimes} />
                            </button>
                        </>
                        }

                    </li>
                ))
            }
        </ul>
    )
}

FileList.propTypes = {
    files:PropTypes.array,
    onFileClick:PropTypes.func,
    onFileDelete:PropTypes.func,
    onSaveEdit:PropTypes.func,
}

export default FileList