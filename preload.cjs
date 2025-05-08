const { contextBridge, ipcRenderer } = require('electron');
const { eAPI } = require('./src_app/services.cjs');

// 通过contextBridge注册给渲染进程的接口

const api = eAPI.init(ipcRenderer);

contextBridge.exposeInMainWorld('eAPI', api);
