/**
 * 主进程功能服务模块
 */

const { dialog, ipcMain, Menu } = require('electron');
const path = require("path");
const fs = require("node:fs/promises");
// 默认处理模型是paraformer ， TODO：1)加载上一次的选择;2)修改menu中的checked选项
global.MODEL_NAME='paraformer';
const Processor =  require('./jsonl');

const METHODS = {
  OPEN_FILE: 'method:openFile',
  READ_TRAIN_TEXT: 'method:readTrainText',
  SAVE_WAV: 'method:saveRecordWAV',
  REMOVE_WAV: 'method:removeRecordWAV',
  MENU_CLIPS_GEN_ENABLED: 'method:jsonlClipsGenEnableIfy'
}

const EVENTS = {
  MENU_LOAD_FILE : 'main:loadFile',
  MENU_SELECT_MIC : 'main:selectMic',
  MAIN_GEN_CLIPS_STARTED : 'main:jsonlClipsGenStarted',
  MAIN_GEN_CLIPS_ENDED : 'main:jsonlClipsGenEnded'
}

module.exports.EVENTS = EVENTS

// 给主进程注册处理函数使用
module.exports.ipcService =  {
  init: function(){
    // 打开文件
    ipcMain.handle(METHODS.OPEN_FILE, async (e)=>{
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "请选择名为【train_text.txt】的文件",
        filters: [{name: 'train_text', extensions: ['txt'] }]
      });
      if (!canceled) {
        return filePaths[0]
      }
      return null;
    });

    // 读取训练文本
    ipcMain.handle(METHODS.READ_TRAIN_TEXT, async (e, filePath)=>{
      let content = await fs.readFile(filePath, 'utf8');
      //根据选择的train_text.txt文件设定工作目录
      global.WORK_DIR = path.resolve(filePath, '../');
      let fileDir = path.join(global.WORK_DIR, './train_text_dist');
      try{
        await fs.rmdir(fileDir, {recursive: true});
      }catch(e){}
      if(content.length){
        return content.split('\r\n').filter(ct=>ct.trim().length>0).map((ct, index)=>{
          let fisrt_space = ct.indexOf(' ');
          return {i: ct.substr(0, fisrt_space), c: ct.substr(fisrt_space).trim()};
        });
      }else{
        return null;
      }
    });

    //将blob录音数据保存为文件，返回文件地址
    ipcMain.handle(METHODS.SAVE_WAV, async (e, {id, arrayBuffer})=>{
      let fileDir = path.join(global.WORK_DIR, './train_text_dist/wavs');
      await fs.mkdir(fileDir, {recursive: true});
      let filePath = path.join(fileDir, `./${id}.wav`);
      const buffer = Buffer.from(arrayBuffer);
      // 保存到文件系统
      try{
        await fs.writeFile(filePath, buffer);
      }catch(err){
        throw new Error(`写入文件${filePath}失败： ${err}`);
      }

      return filePath;
    });

    // 删除文件
    ipcMain.handle(METHODS.REMOVE_WAV, async (e, file)=>{
      await fs.unlink(file);
    });

    // 修改menu中的“生成素材”的状态
    ipcMain.handle(METHODS.MENU_CLIPS_GEN_ENABLED, async (e, enabled)=>{
      let menu = Menu.getApplicationMenu();
      let target = menu.items.find(m=>m.label==='处理').submenu.items.find(m=>m.label==='生成jsonl素材');
      target.enabled = enabled===1||enabled===true;
    });
  },
  //生成train_wav.scp以及对应的命令
  generateJsonlClips: async ()=>{
    let inst = Processor.instance();
    await inst.genJsonlClips();
    return global.WORK_DIR;
  }
}

// 给preload的contextBridge使用
module.exports.eAPI = {
  init: function(ipcReander){
    let ipc = ipcReander;
    return {
      // 打开文件
      openFile: async () => {
        return await ipc.invoke(METHODS.OPEN_FILE);
      },
      // 读取训练文本
      readTrainText: async (filePath)=>{
        return await ipc.invoke(METHODS.READ_TRAIN_TEXT, filePath);
      },
      // 响应主进程菜单@see EApp.cjs win.webContents.send 的“加载”事件
      onMenuLoadFile: (callback) => {
        ipc.on(EVENTS.MENU_LOAD_FILE, (_event, value) => callback(value));
      },
      // 响应主进程菜单@see
      onMenuSelectMic: (callback)=>{
        ipc.on(EVENTS.MENU_SELECT_MIC, (_event, value) => callback(value));
      },
      //将blob录音数据保存为文件，返回文件地址
      saveRecord2File: async (data, dir)=>{
        return await ipc.invoke(METHODS.SAVE_WAV, data, dir);
      },
      //一个工具方法
      pathResolve: (...params)=>{
        return path.resolve(...params);
      },
      //删除文件
      removeWavFile: async (file)=>{
        return await ipc.invoke(METHODS.REMOVE_WAV, file);
      },
      //响应主进程生成素材开始
      onJsonlClipsGenStarted: (callback)=>{
        ipc.on(EVENTS.MAIN_GEN_CLIPS_STARTED, (_event, value) => callback(value));
      },
      //响应主进程生成素材完成
      onJsonlClipsGenEnded: (callback)=>{
        ipc.on(EVENTS.MAIN_GEN_CLIPS_ENDED, (_event, dir, err) => callback(dir, err));
      },
      //告诉主进程，录音已经准备好，可以吧menu中的“生成素材”启用
      //TODO: 可以进一步改进整体逻辑，只要有一个ok，就可以启用。但是后台@see src_app/jsonl中实现需要实现只生成一部分wav.scp（并且把train_text.txt搞一份部分内容出来）的逻辑
      jsonlClipsGenEnableIfy: (enabled)=>{
        return ipc.invoke(METHODS.MENU_CLIPS_GEN_ENABLED, enabled);
      }
    }
  }
}
