/**
 * Created by wangx on 2025-05-12.
 *
 */
import Recorder from 'recorder-core'

class MyRecorder{
  currentMic = null;

  constructor(){
  }

  setCurrentMic(mic){
    this.currentMic = mic;
  }
}


export default MyRecorder
