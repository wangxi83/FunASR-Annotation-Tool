/**
 * Created by wangx on 2025-05-14.
 *
 */
const JsonlProcessor = require('./JsonlProcessor');
const fs = require('node:fs/promises');
const path = require('path');

module.exports = class Paraformer extends JsonlProcessor {
  constructor() {
    super();
  }

  /**
   * 生成paraformer训练的基本材料
   * @see https://github.com/modelscope/FunASR/blob/main/examples/industrial_data_pretraining/paraformer/README_zh.md
   * @returns {Promise<void>}
   */
  async genJsonlClips(){
    let trainTextPath = path.join(global.WORK_DIR, './train_text.txt');
    let distDir = path.join(global.WORK_DIR, './train_text_dist');
    let distWavsDir = path.join(distDir, './wavs');
    let trainWavScpPath = path.join(distDir, './train_wav.scp');
    let scp2jsonlShPath = path.join(distDir, './scp2jsonl.sh');
    try{
      // global.WORK_DIR @see services.cjs。简单的用global来保存一些变量
      await fs.stat(trainTextPath);
      // train_text_dist/wavs是约定的，偷懒。@see services.cjs# ipcMain.handle(EVENTS.SAVE_WAV)
      await fs.stat(distDir);
    }catch(e){
      if(e.code==='ENOENT'){
        throw new Error(`处理失败：${e.path}不存在`);
      }
    }
    // 构造train_wav.scp文件
    let wavs = await fs.readdir(distWavsDir);
    let fd = null;
    try{
      fd = await fs.open(trainWavScpPath, 'w+');
      for(let wav of wavs){
        let filePath = path.join(distWavsDir, wav);
        let id = path.basename(wav, path.extname(wav));
        await fd.appendFile(`${id} ${filePath}\n`, 'utf8');
      }
    }finally {
      await fd?.close();
    }
    // 生成sh文件
    let sh = 'scp2jsonl ++scp_file_list=\'["./train_wav.scp", "../train_text.txt"]\' ++data_type_list=\'["source", "target"]\' ++jsonl_file_out="./train.jsonl"'
    try{
      fd = await fs.open(scp2jsonlShPath, 'w+');
      await fd.writeFile(sh, 'utf8');
    }finally {
      await fd?.close();
    }
  }
}
