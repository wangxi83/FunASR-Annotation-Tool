/**
 * Created by wangx on 2025-05-14.
 *
 */

module.exports = class JsonlProcessor {
  #target = null;

  constructor() {
    this.#target = new.target;
    if(new.target === JsonlProcessor ){
      throw new Error('Abstract Class')
    }
  }

  async genJsonlClips(){
    if(this.#target === JsonlProcessor )
      throw new Error('Abstract Class');
  }
}
