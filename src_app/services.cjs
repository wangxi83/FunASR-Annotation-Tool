/**
 * 主进程功能服务模块
 */

const { dialog, ipcMain } = require('electron');

const EVENTS = {
  OPEN_FILE: 'dialog:openFile',
  READ_TRAIN_TEXT: 'readTrainText'
}

// 给主进程注册处理函数使用
module.exports.ipcService =  {
  init: function(){
    // 打开文件
    ipcMain.handle(EVENTS.OPEN_FILE, async (e)=>{
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
    ipcMain.handle(EVENTS.READ_TRAIN_TEXT, async (e, filePath)=>{

    });
  }
}

// 给preload的contextBridge使用
module.exports.eAPI = {
  init: function(ipcReander){
    let ipc = ipcReander;
    return {
      // 打开文件
      openFile: async () => {
        return await ipc.invoke(EVENTS.OPEN_FILE);
      },
      // 读取训练文本
      readTrainText: async ()=>{
        return null;
      }
    }
  }
}
