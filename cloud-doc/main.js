const {app,BrowserWindow,ipcMain, Menu, shell} = require('electron')
const isDev = require('electron-is-dev')
const template = require('./src/Menutemplate')
const Menutemplate = template(app,shell,ipcMain)
const AppWindow = require('./src/AppWindow')
const path = require('path')

let mainWindow,settingsWindow



app.on('ready',()=>{
    const mainWindowConfig = {
        width: 1024,
        height: 680,
    }
    
    
    const urlLocation = isDev ? 'http://localhost:3000/' : 'dummyurl'
    mainWindow  = new AppWindow(mainWindowConfig,urlLocation)
    mainWindow.on('closed',()=>{
        mainWindow = null
    })
    //hook up main events
    ipcMain.on('open-settings-window',()=>{
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingsFileLocation =
        `file://${path.join(__dirname,'./settings/settings.html')}`
        console.log(settingsFileLocation)
        settingsWindow = new AppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.on('closed',()=>{
            settingsWindow = null
        })

    })
    const menu = Menu.buildFromTemplate(Menutemplate) 
    Menu.setApplicationMenu(menu)    

})