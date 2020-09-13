const {BrowserWindow} = require('electron')

class AppWindow extends BrowserWindow{
    constructor(config,urlLocation){
        const basicConfig ={
            width:800,
            hegiht:600,
            webPreferences:{
                nodeIntegration:true,
            }
        }
    }
}