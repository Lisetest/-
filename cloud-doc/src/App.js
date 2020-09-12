import React,{useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Filesearch from './components/Filesearch'
import FileList from './components/FileList'
import ButtonBtn from './components/ButtonBtn'
import { faPlus, faFileImport,faSave } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import SimpleMDE from 'react-simplemde-editor'
import "easymde/dist/easymde.min.css"
import v4 from 'uuid/dist/v4'
import { objToArr, flattenArr} from './utils/helper'
import fileHelper from './utils/fileHelper'

const Store = window.require('electron-store')
const {remote} = window.require('electron') 
const {join,basename,extname,dirname} = window.require('path') //使用node.js 的模块

const fileStore  = new Store({'name':'File Data'})



function App() {
  console.log('render is runing')
  //变量
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileID, setActiveFileID] = useState('')
  const [openedFileIDs, setOpenedFileIDs] = useState([])
  const [unsavedFileIDs,setunsavedFileIDs] = useState([])
  const [searchFiles,setSearchFiles] = useState([])
  const filesArr = objToArr(files)
  const savedLocation =   remote.app.getPath('documents')

  const activeFile = files[activeFileID]
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListarr = (searchFiles.length > 0) ? searchFiles : filesArr

  const saveFiletoStore = (files)=>{
    const fileStoreObj = objToArr(files).reduce((result,file)=>{
      const {id,path,title,createdAt} = file
      result[id] = {
        id,
        path,
        title,
        createdAt
      }
      return result
    },{})
    fileStore.set('files',fileStoreObj)
  }
  //导入文件的时间
  const importFiles=()=>{
    remote.dialog.showOpenDialog({
      title:"导入文件",
      properties:[
        'openFile','multiSelections'
      ],
      filters:[
        {
          name: "MarkDown Files", extensions:['md']
        }
      ]
    },(paths)=>{
        if (paths){
          const filteredPaths = paths.filter(path => {
            const alreadyAdded = Object.values(files).find(file => {
              return file.path === path
            })
            return !alreadyAdded
          })

          const importFilesArr = filteredPaths.map(path => {
            return {
              id: v4(),
              title: basename(path, extname(path)),
              path,
            }
          })

          const newFiles = { ...files, ...flattenArr(importFilesArr) }
          setFiles(newFiles)
          saveFiletoStore(newFiles)

          if (importFilesArr.length > 0) {
            remote.dialog.showMessageBox({
              type: "info",
              title: "成功导入文件",
              message: `成功导入${importFilesArr.length}个文件`
            })
          }
        }else{
          remote.dialog.showMessageBox({
            type:"info",
            title:"文件提示框",
            message:"未选择文件"
          })
        }
    })

  }

  const fileClick = (fileID)=>{
    // set current active file
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    if (!currentFile.isLoaded){
      fileHelper.readFile(currentFile.path).then((value)=>{
        const newFile = {...files[fileID],body:value,isLoaded:true}
        setFiles({...files,[fileID]:newFile})
      })
    }
    //add new file
    if (!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
    
  }
  const fileDelete = (id)=>{
    
    if ( !files[id].isNew) {
      fileHelper.deletFile(files[id].path).then(()=>{
      })
    }
    delete files[id]
    const {[id]:value,...afterDelete}=files
    setFiles(afterDelete)
    saveFiletoStore({ ...afterDelete })
    tabClose(id)
}

  const saveCurrentFile = ()=>{
    fileHelper.writeFile(activeFile.path, activeFile.body).then(()=>{
      setunsavedFileIDs(unsavedFileIDs.filter(id=>id!==activeFile.id))
    })
  }

  const updateFileName = (id,title, isNew)=>{
    if (filesArr.find(file=>file.title == title && file.id!==id)){
      return 
    }
    const newPath = isNew ? join(savedLocation, `${title}.md`):
      join(dirname(files[id].path), `${title}.md`)

    const modifiedFile = {...files[id],title:title,isNew:false,path:newPath}
    const newFiles = { ...files, [id]: modifiedFile }
    if (isNew){
      fileHelper.writeFile(newPath,files[id].body).then(()=>{
      })
    }
    else{
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath, newPath).then(()=>{
      }
      )  
    }
    setFiles(newFiles)
    saveFiletoStore(newFiles)  
    console.log(newPath)

  }

  const tabClick = (fileID)=>{
    setActiveFileID(fileID)
  }
  
  const tabClose = (id)=>{
    //remove currentid from openedid
    const tabWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabWithout)
    // set tha active to the first tabe
    if (tabWithout.length > 0 ){
      setActiveFileID(tabWithout[0])
    }
    else
    {
      setActiveFileID('')
    }
  }

  const fileChange =(id,value)=>{
    // files[id].body = value 不建议这种写法
    const newFile = {...files[id],body:value}
    setFiles({...files,[id]:newFile})
    //更新 unsavedIDs
    if (!unsavedFileIDs.includes(id)){
      setunsavedFileIDs([...unsavedFileIDs,id])
    }
  }

  const fileSearch = (keyword)=>{
    const newFiles = filesArr.filter(dd => dd.title.includes(keyword))
    setSearchFiles(newFiles)
  }

  const createNewFile = ()=>{
    
    const newid = v4()    
    const NewFile = {
      id: newid,
      title: '',
      body: '## 请输入 MarKDow',
      createdAt: new Date().getTime(),
      isNew: true,
    }
   
    const newFile = filesArr.find(file => file.isNew)
    if (!newFile){
      setFiles({ ...files, [newid]: NewFile })
    }
    else{
      console.log('已经存在newFile')
    }
    
  }


  return (
    <div className="App container-fluid px-0 ">
      <div className= "row no-gutters">
        <div className  ="col-3 bg-light left-panel">
           <Filesearch 
           title="我的云ERP"
            onFileSearch={fileSearch}
            >
           </Filesearch>
           <FileList
            files={fileListarr}
            onFileClick = {fileClick}
            onFileDelete={fileDelete}
            onSaveEdit={updateFileName}
           ></FileList>
           <div className="row no-gutters button-group">
            <div className="col"> 
                <ButtonBtn
                  text="新建"
                  colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
                >  
                </ButtonBtn>
             </div>
            <div className="col">
                <ButtonBtn
                  text="导入"
                  colorClass="btn-success"
                  icon={faFileImport}
                  onBtnClick={importFiles}
                >
                </ButtonBtn>
             </div>
           </div>  
        </div>
        <div className = "col-9 right-panel">
          {!activeFileID && 
            <div className="start-page">选择或者创建新的Markdown 文档</div>
          }
          { activeFileID && <>
           <TabList
            files={openedFiles}
            activeId={activeFileID}
            unsaveIds={unsavedFileIDs}
            onTabClick={tabClick}
            onCloseTab={tabClose}
           >
           </TabList>
            <div className=".left-panel">
            <SimpleMDE 
            key = {activeFile && activeFile.id}
            value={activeFile && activeFile.body}
            onChange={(value)=>{fileChange(activeFile.id,value)}}
            options={{
              minHeight:'460px',
            }}
           ></SimpleMDE>
              <ButtonBtn
                text="导入"
                colorClass="btn-success"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              >
              </ButtonBtn>
           </div>
          </>}
        </div>
      </div>
    </div>
  );
}

export default App;
