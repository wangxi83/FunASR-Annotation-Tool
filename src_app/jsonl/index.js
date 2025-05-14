/**
 * Created by wangx on 2025-05-14.
 *
 */

module.exports = class JsonlFacotry {
  static #impls = {
    paraformer: './Paraformer'
  }

  static newInstance(){
    let impl = JsonlFacotry.#impls[global.MODEL_NAME.toLowerCase()];
    if(!impl) throw new Error(`没有实现 ${global.MODEL_NAME} 的jsonl处理`);
    let clazz = require(impl);
    return new clazz();
  }
}
