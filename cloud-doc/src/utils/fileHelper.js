const fs = window.require('fs').promises


const fileHelper ={
    readFile:(path)=>{
      return   fs.readFile(path, { encoding:'utf8'})
    },
    writeFile:(path,content)=>{
      return   fs.writeFile(path, content)
    },
    renameFile:(path,newPath)=>{
        return fs.rename(path,newPath)
    },
    deletFile:(path)=>{
        return fs.unlink(path)
    }
}

export default fileHelper
