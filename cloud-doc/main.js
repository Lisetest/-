const {app,BrowserWindow,ipcMain, Menu, shell} = require('electron')
const isDev = require('electron-is-dev')
const template = require('./src/Menutemplate')
const Menutemplate = template(app,shell,ipcMain)


let mainWindow;



app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width: 1024,
        height:680,
        webPreferences:{nodeIntegration:true}
    })
    
    const urlLocation = isDev ? 'http://localhost:3000/' : 'dummyurl'
    mainWindow.loadURL(urlLocation);
    const menu = Menu.buildFromTemplate(Menutemplate) 
    Menu.setApplicationMenu(menu)    

})