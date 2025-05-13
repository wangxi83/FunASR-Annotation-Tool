/**
 * Created by wangx on 2025-05-12.
 *
 */
import Recorder from 'recorder-core';
import 'recorder-core/src/engine/wav';

//@see https://github.com/xiangyuecn/Recorder?tab=readme-ov-file
class MyRecorder{
  currentMic = null;
  recorder_ = null;

  constructor(){
  }

  setCurrentMic(mic){
    this.currentMic = mic;
    //初始化Recorder
    return this;
  }

  /**打开录音资源并开始录音*/
  async doRecord(processor){
    if(!this.currentMic) throw Error('未设置麦克风');
    if(Recorder.IsOpen()) throw Error('录音已经开始，不能重复处理');
    // 初始化一个录音对象
    const this_ = this;
    this.recorder_ = Recorder({
      type: "wav",
      sampleRate: 16000,
      bitRate: 16,
      audioTrackSet: {
        deviceId: this.currentMic.deviceId,
        groupId: this.currentMic.groupId
      },
      onProcess: function(buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd){
        //录音实时回调，大约1秒调用12次本回调，buffers为开始到现在的所有录音pcm数据块(16位小端LE)
        //可实时上传（发送）数据，配合Recorder.SampleData方法，将buffers中的新数据连续的转换成pcm上传，或使用mock方法将新数据连续的转码成其他格式上传，
        // 可以参考文档里面的：Demo片段列表 -> 实时转码并上传-通用版；基于本功能可以做到：实时转发数据、实时保存数据、实时语音识别（ASR）等
        // this_.processTime += bufferDuration;
        if(processor){
          processor(buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd);
        }else{
          console.log('正在录制，通过传入processor回调以处理(buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd)');
        }
      }
    });

    return new Promise((rs, rj)=>{
      this_.recorder_.open(
        ()=>{
          this_.recorder_.start();
          //【稳如老狗WDT】可选的，监控是否在正常录音有onProcess回调，如果长时间没有回调就代表录音不正常
          // var wdt=rec.watchDogTimer=setInterval(function(){
          //   if(!rec || wdt!=rec.watchDogTimer){ clearInterval(wdt); return } //sync
          //   if(Date.now()<rec.wdtPauseT) return; //如果暂停录音了就不检测：puase时赋值rec.wdtPauseT=Date.now()*2（永不监控），resume时赋值rec.wdtPauseT=Date.now()+1000（1秒后再监控）
          //   if(Date.now()-(processTime||startTime)>1500){ clearInterval(wdt);
          //     console.error(processTime?"录音被中断":"录音未能正常开始");
          //     // ... 错误处理，关闭录音，提醒用户
          //   }
          // },1000);
          this_.recorder_.wdtPauseT = 0;
          rs(this_);
        },
        (msg, isUserNotAllow)=>{
          rj(`${isUserNotAllow?"用户授权拒绝，":""}无法录音: ${msg}`);
        }
      )
    });
  }

  /**结束录音**/
  async stopRecord() {
    const this_ = this;
    return new Promise((rs, rj)=>{
      this.recorder_.stop((blob, duration)=>{
        //简单利用URL生成本地文件地址，注意不用了时需要revokeObjectURL，否则霸占内存
        //此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
        this_.recorder_.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
        this_.recorder_ = null;
        /*** 【立即播放例子】 ***/
        // let localUrl = (window.URL||webkitURL).createObjectURL(blob);
        // var audio=document.createElement("audio");
        // document.body.prepend(audio);
        // audio.controls=true;
        // audio.src=localUrl;
        // audio.play();
        rs({blob: blob, duration: duration});
      }, (msg)=>{
        this_.recorder_.close();
        this_.recorder_ = null;
        console.error(`录音失败: ${msg}`);
        rj(msg);
      });
    });
  };
}

export default MyRecorder
