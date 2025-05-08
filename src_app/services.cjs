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
      return [
        {i: 'A0000', c:'我是一名知识丰富的助手，能够解答您关于科学、历史、文化、技术等领域的各种问题。我的目标是提供清晰、准确且简短的答案，帮助您快速获取所需信息。无论您是学习、工作还是对某个话题感兴趣，我都会尽力提供帮助。如果您有任何问题，请随时提问，我会尽力为您解答。'},
        {i: 'A0001', c: '一百啊手动阀手动阀手动阀'},
        {i: 'A0002', c: '甚至出现交易几乎停滞的情况'},
        {i: 'A0003', c: '湖北一公司以员工名义贷款数十员工负债千万'}
      ]
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
      readTrainText: async (filePath)=>{
        return await ipc.invoke(EVENTS.READ_TRAIN_TEXT, filePath);
      }
    }
  }
}
