/**
 * Created by wangx on 2025-05-14.
 *
 */
//为了webpack的处理，这里还是静态引入
const paraformer = require('./Paraformer');

module.exports = class JsonlFacotry {
  static #impls = {
    paraformer: paraformer
  }

  static #instanceCache = {}

  static instance(){
    let inst = JsonlFacotry.#instanceCache[global.MODEL_NAME.toLowerCase()];
    if(!inst) {
      let impl = JsonlFacotry.#impls[global.MODEL_NAME.toLowerCase()];
      if(!impl) throw new Error(`没有实现 ${global.MODEL_NAME} 的jsonl处理`);
      inst = new impl();
      JsonlFacotry.#instanceCache[global.MODEL_NAME.toLowerCase()] = inst;
    }
    return inst;
  }
}
