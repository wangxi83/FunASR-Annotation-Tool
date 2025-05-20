/**
 * Created by wangx on 2025-04-29.
 *
 */
const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { find } = require('./src_app/utils/common-util.cjs');
const logger = require('./src_app/utils/logger.cjs');
/**
* 监听未捕获的异常
*/
process.on('uncaughtException', async (error) => {
  await fs.writeFile(path.join(__dirname, './last-crash-on-load.log'), error.stack);
  process.exit(1);
});
const { ipcService, EVENTS } = require('./src_app/services.cjs');

let devmode = process.env.NODE_ENV==="develop";

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "FunASR语音引擎标注工具",
    icon: path.join(__dirname, `${devmode?"./dist/logo.png":"./logo.png"}`),
    webPreferences: {
      webSecurity: false,
      devTools: devmode,
      preload: find(process.cwd(), 'preload.cjs'),
      defaultEncoding: "UTF-8",
      sandbox: false // 不使用sandbox运行，否则preload无法加载本地模块，@see https://stackoverflow.com/questions/73511572/require-module-inside-preload-script-in-electron
    }
  });

  win.loadFile(path.join(__dirname, `${devmode?"./dist/index.html":"./index.html"}`));

  //菜单
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '加载',
          click: ()=>{
            //发送给渲染进程，由渲染进程统一响应处理文件打开的过程
            win.webContents.send(EVENTS.MENU_LOAD_FILE, 1);
          }
        },
        {
          label: '选择麦克风',
          click: ()=>{
            //发送给渲染进程，由渲染进程统一响应处理文件打开的过程
            win.webContents.send(EVENTS.MENU_SELECT_MIC, 1);
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
      label: '处理',
      submenu: [
        {
          label: '目标模型',
          submenu: [
            {
              label: 'Paraformer',
              type: 'radio',
              checked: true,
              click: ()=>{global.MODEL_NAME='paraformer'} //TODO: 发送给渲染进程以展示其他模型的特点,比如ServiceVoice的表情等
            },
            {
              label: 'SenceVoice',
              type: 'radio',
              enabled: false
            }
          ]
        },
        { type: 'separator' },
        {
          label: '生成jsonl素材',
          enabled: false,
          click: async ()=> {
            win.webContents.send(EVENTS.MAIN_GEN_CLIPS_STARTED, 1);
            await new Promise(rs=>setTimeout(()=>rs(), 1000));
            try{
              if(!global.WORK_DIR){
                // 如果没有工作目录，则不处理。@see ipcMain.handle(METHODS.READ_TRAIN_TEXT)
                return win.webContents.send(
                  EVENTS.MAIN_GEN_CLIPS_ENDED, null,
                  new Error('没有处理任何内容，不能生成素材')
                );
              }
              let workDir = await ipcService.generateJsonlClips();
              win.webContents.send(EVENTS.MAIN_GEN_CLIPS_ENDED, workDir);
            }catch(err){
              win.webContents.send(EVENTS.MAIN_GEN_CLIPS_ENDED, null, err);
            }
          }
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
          message: 'FunASR语音引擎标注工具',
          detail: 'v0.0.2 \n\n ' +
                  '当前支持paraformer的格式 \n  ' +
                  '下一步计划支持SenceVoice的格式，即包含情绪和语言类型 \n\n' +
                  '项目地址：https://github.com/wangxi83/FunASR-Annotation-Tool'
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

if (require('electron-squirrel-startup')) app.quit();

app.whenReady().then(() => {
  ipcService.init();
  createWindow();
})



