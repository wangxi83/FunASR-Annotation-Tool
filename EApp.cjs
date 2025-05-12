/**
 * Created by wangx on 2025-04-29.
 *
 */
const { app, BrowserWindow, Menu, dialog, systemPreferences } = require('electron');
const path = require("path");
const { ipcService } = require('./src_app/services.cjs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "狱情分析语音引擎训练标注工具",
    icon: path.join(__dirname, "./dist/logo.png"),
    webPreferences: {
      webSecurity: false,
      devTools: process.env.NODE_ENV==="develop",
      preload: path.join(__dirname, './preload.cjs'),
      defaultEncoding: "UTF-8",
      sandbox: false // 不使用sandbox运行，否则preload无法加载本地模块，@see https://stackoverflow.com/questions/73511572/require-module-inside-preload-script-in-electron
    }
  });

  win.loadFile(path.join(__dirname, './dist/index.html'));

  //菜单
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '加载',
          click: ()=>{
            //发送给渲染进程，由渲染进程统一响应处理文件打开的过程
            win.webContents.send('main:loadFile', 1);
          }
        },
        {
          label: '选择麦克风',
          click: ()=>{
            //发送给渲染进程，由渲染进程统一响应处理文件打开的过程
            win.webContents.send('main:selectMic', 1);
          }
        },
        { type: 'separator' },
        {
          label: '关闭程序',
          click: ()=>app.quit()
        }
      ]
    },
    {
      label: '关于',
      click: ()=>{
        //发送给渲染进程，由渲染进程统一响应处理文件打开的过程
        dialog.showMessageBoxSync(win, {
          type: 'info',
          title: '关于',
          message: '语音引擎标注工具',
          detail: 'https://github.com/wangxi83/FunASR-Annotation-Tool'
        });
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  //如果是develop，则打开dev-tools
  if(process.env.NODE_ENV==="develop"){
    win.webContents.openDevTools();
  }

  win.on('close', (event) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['是的', '取消'],
      title: '关闭程序',
      message: '确定要关闭吗？',
      defaultId: 0,
      cancelId: 1
    });
    if (choice === 1) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  ipcService.init();
  createWindow();
})



