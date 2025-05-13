<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import {ref, computed, reactive} from 'vue';
import {onMounted} from 'vue';
import {
  Document, ArrowLeft, ArrowRight, Headset, Check, SuccessFilled, RefreshLeft
} from '@element-plus/icons-vue';
import {ElMessage, ElMessageBox} from 'element-plus'
import MyRecorder from "./utils/recorder";
import MicSelection from "./views/MicSelection.vue";

let filePath = ref(null);
let sentences = ref(null);
let start_record = ref(false);
let end_record = ref(false);
let cur_sentence = ref({});
let myRecorder = new MyRecorder();
let record_data = reactive({blob: null, blobUrl: null, duration: 0});

onMounted(async ()=>{
  //注册一个主进程的监听，用于响应menu的打开点击事件
  window.eAPI.onMenuLoadFile(()=>{
    selectFile();
  });

  //获取默认麦克风
  await navigator.mediaDevices.getUserMedia({ audio: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  const mics = devices.filter(device => device.kind === 'audioinput'&&['default', 'communications'].indexOf(device.deviceId)<0);
  myRecorder.setCurrentMic(mics[0]);
});

//计算锚点的属性
const anchorPrev = computed(() => {
  if(cur_sentence.value.index===0) return null;
  return `#${sentences.value[cur_sentence.value.index-1].i}`;
});
const anchorNext = computed(() => {
  if(cur_sentence.value.index===sentences.value.length-1) return null;
  return `#${sentences.value[cur_sentence.value.index+1].i}`;
});

function onSentenceClick(sentence){
  cur_sentence.value = sentence;
  start_record.value = false;
  end_record.value = false;
}

async function seekTo(where, e){
  if(record_data.blobUrl&&cur_sentence.value.s===0){
    e.preventDefault();
    try{
      await ElMessageBox.confirm('当前录音未保存，是否继续？', '请确认', {
        confirmButtonText: '是的',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning',
      });
      //如果继续，则重新点击，因为上面 e.preventDefault();
      //不在catch中执行 e.preventDefault();的原因是， e.preventDefault()会先于异步方法执行
      clearRecord();
      document.getElementById(where).click();
    }catch(err) {
    }
    return;
  }

  if(where==='prev'){
    onSentenceClick(sentences.value[cur_sentence.value.index-1]);
  }else{
    onSentenceClick(sentences.value[cur_sentence.value.index+1]);
  }
}

//选择并打开训练材料文件train_text.txt
async function selectFile() {
  if(sentences.value&&sentences.value.length>0){
    try{
      await ElMessageBox.confirm('当前已经在工作中，你的所有工作将丢失，确认要打开新文件？', '请确认', {
        confirmButtonText: '是的',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'error',
      });
    }catch(e) {
      //如果取消就退出了。
      return
    }
  }
  //选择并读取文件
  filePath.value = await window.eAPI.openFile();
  console.log(`选择的文件：${filePath.value}`);
  if(filePath.value){
    let fileContents = await window.eAPI.readTrainText(filePath.value);
    if(fileContents&&fileContents.length>0){
      sentences.value = fileContents.map((s, index)=>{
        //主要是增加一个index和一个stauts（0未标注、1已标注）
        return {i: s.i, c: s. c, index: index, s: 0}
      })
      //选中第一个
      onSentenceClick(sentences.value[0], 0);
    }
  }
}

function clearRecord(){
  if(record_data.blobUrl) (window.URL||webkitURL).revokeObjectURL(record_data.blobUrl);
  record_data.blobUrl = null;
  record_data.duration = 0;
}

//--------------操作相关------------
let CONTRL = {
  REVIEW: 'REVIEW'
}
let cur_control = ref(null);
// 录音文件状态
const hasRecord = computed(()=>{
  return !!(record_data.blobUrl || cur_sentence.value.fileUrl);
});

async function startRecord(){
  clearRecord();
  start_record.value = true;
  end_record.value = false;
  try{
    await myRecorder.doRecord();
  }catch(err){
    ElMessage.error(`出错啦！\n${err}`);
  }
}

async function endRecord(){
  start_record.value = false;
  end_record.value = true;
  try{
    let r = await myRecorder.stopRecord();
    record_data.blob = r.blob;
    record_data.blobUrl = (window.URL||webkitURL).createObjectURL(record_data.blob);
    record_data.duration = r.duration;
  }catch(err){
    ElMessage.error(`出错啦！\n${err}`);
  }
}

async function redoRecordIfy(){
  try{
    await ElMessageBox.confirm('是否要重新录制该内容？', '请确认', {
      confirmButtonText: '是的',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning',
    });
    clearRecord();
    cur_sentence.value.s = 0; //修改状态
    await window.eAPI.removeWavFile(cur_sentence.value.fileUrl);
    cur_sentence.value.fileUrl = null;
  }catch(e){
  }
}

async function review(){
  cur_control.value = CONTRL.REVIEW;
  let audio = document.getElementById("myAudio");
  audio.play();
}

async function stopReview(){
  cur_control.value = null;
  let audio = document.getElementById("myAudio");
  audio.pause();
  audio.currentTime = 0;
}

async function confirmVoice(){
  try{
    await ElMessageBox.confirm('确定完成该录音？', '请确认', {
        confirmButtonText: '是的',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        type: 'warning',
    });
    // 吧blob发给主进程进行保存
    const reader = new FileReader();
    reader.onloadend = async ()=>{
      const arrayBuffer = reader.result;
      const dir = window.eAPI.getTrainTxtPath(filePath.value);
      // 将 ArrayBuffer 通过 IPC 发送到主进程保存，得到wav文件地址
      cur_sentence.value.fileUrl = await window.eAPI.saveRecord2File(arrayBuffer, dir);
      console.log(`wav文件已保存：${cur_sentence.value.fileUrl}`);
      cur_sentence.value.s = 1; //修改状态
      cur_sentence.value.duration = record_data.duration;
      clearRecord();
    };
    reader.readAsArrayBuffer(record_data.blob);
  }catch(e){
  }
}
</script>

<template>
  <div class="main">
    <div class="recorder">
      <div class="default" v-if="!Array.isArray(sentences)||!sentences.length">
        <el-text class="mx-1 tips" type="info">点击下方按钮，选择语音材料以开始</el-text>
        <el-button type="primary" :icon="Document" @click="selectFile">选择材料文件</el-button>
      </div>
      <div class="working-area" v-else>
        <div>
          <el-text class="mx-1 tips" type="info">按住语音按钮，以正常语速念出下述内容</el-text>
        </div>
        <div class="sentence">
          <el-text class="mx-1 c-1">{{cur_sentence.c}}</el-text>
        </div>
        <div class="confirm">
          <template v-if="1">
            <el-button v-if="cur_control!==CONTRL.REVIEW" circle @click="review"  :disabled="!hasRecord"
                       class="review-btn" :class="hasRecord?'reviewable':null" >
              <el-icon :class="hasRecord?'icon-reviewable':null"><Headset /></el-icon>
            </el-button>
            <el-button v-if="cur_control===CONTRL.REVIEW" circle @click="stopReview"
                       class="review-btn" :class="hasRecord?'reviewable':null" >
              <icon style="height: 16px">
                <svg viewBox="0 0 1024 1024" width="16" height="16">
                  <path d="M163.386696 158.717861l705.252399 0 0 705.21556-705.252399 0 0-705.21556Z" p-id="3183" fill="red"></path>
                </svg>
              </icon>
            </el-button>
          </template>
          <el-button :icon="Check" circle  @click="confirmVoice" class="confirm-btn" :disabled="cur_sentence.s===1||!hasRecord"
                     :class="{'processed': cur_sentence.s===1, 'confirm-able': hasRecord}"/>
        </div>
        <el-divider style="border-color: #f3f3f3;">
          <img v-if="start_record||cur_control===CONTRL.REVIEW" src="@/assets/wave.gif" style="height: 28px; width: 48px"/>
          <span v-if="(end_record||cur_sentence.s===1)&&cur_control!==CONTRL.REVIEW">
            {{`${((cur_sentence.s===1?cur_sentence.duration:record_data.duration)/1000).toFixed(1)}″`}}
          </span>
        </el-divider>
        <div class="controller">
          <a id='prev' @click="(e)=>{cur_sentence.index===0?null:seekTo('prev', e)}" :href="anchorPrev">
            <el-icon :size="20" class="pagectl prev" :class="cur_sentence.index===0?'disabled':null"><ArrowLeft /></el-icon>
          </a>
          <!-- 录音按钮。录音的时候颜色不同；已经完成录音的图标不同 -->
          <template v-if="1">
            <el-button v-if="cur_sentence.s===0" circle :style="`height: 42px; width: 42px; background-color: ${start_record?'#299c31':'#e72b2b'}; border: none;`"
                       @mousedown.prevent="startRecord" @mouseup.prevent="endRecord">
              <svg viewBox="0 0 1024 1024" width="20" height="20">
                <path d="M896 490.666667a362.346667 362.346667 0 0 1-341.333333 362.046666V938.666667h192a21.333333 21.333333 0 0 1 0 42.666666H320a21.333333 21.333333
            0 0 1 0-42.666666h192v-85.953334A362.366667 362.366667 0 0 1 170.666667 490.666667a21.333333 21.333333 0 0 1 42.666666 0c0 176.446667 143.553333 320 320
            320s320-143.553333 320-320a21.333333 21.333333 0 0 1 42.666667 0zM317.113333 582A233.22 233.22 0 0 1 298.666667 490.666667V277.333333a234.666667 234.666667 0 1 1
            469.333333 0v213.333334a234.726667 234.726667 0 0 1-450.886667 91.333333zM341.333333 490.666667c0 105.866667 86.133333 192 192 192s192-86.133333
            192-192V277.333333c0-105.866667-86.133333-192-192-192S341.333333 171.466667 341.333333 277.333333z" fill="white" p-id="5303"></path>
              </svg>
            </el-button>
            <el-button  v-else circle style="height: 42px; width: 42px; background-color: #e72b2b; border: none;"
                       @click="redoRecordIfy">
              <el-icon style="color: white; width: 20px; height: 20px;"><RefreshLeft style="width: 20px;height: 20px;"/></el-icon>
            </el-button>
          </template>
          <a id="next" @click="(e)=>{cur_sentence.index===sentences.length-1?null:seekTo('next', e)}" :href="anchorNext">
            <el-icon :size="20" class="pagectl next" :class="cur_sentence.index===sentences.length-1?'disabled':null"><ArrowRight /></el-icon>
          </a>
        </div>
      </div>
    </div>
    <el-divider direction="vertical" style="height: 100%; border-color: #f3f3f3;"/>
    <div class="sentence-list">
      <el-card v-for="(sentence, index) in sentences" shadow="never" @click="onSentenceClick(sentence, index)"
               :id="sentence.i" :key="sentence.i" :class="cur_sentence.i===sentence.i?'selected':null">
        <div class="sentence-card">
          <div class="s-content" :class="''">
            <el-text class="mx-1 c-1">{{ sentence.c }}</el-text>
          </div>
          <div class="s-status" :class="sentence.s===1?'processed':null">
            <el-icon :size="16"><SuccessFilled /></el-icon>
          </div>
        </div>
      </el-card>
    </div>
  </div>
  <!-- 麦克风选择弹窗，由electron渲染进程菜单唤起 -->
  <MicSelection @mic-changed="(mic)=>{myRecorder.setCurrentMic(mic)}"></MicSelection>
  <!-- 用于播放录制的声音 -->
  <audio id="myAudio" :src="record_data.blobUrl||cur_sentence.fileUrl" controls
         @ended="stopReview" style="display: none"></audio>
</template>

<style lang="scss" scoped>
.main {
  display: flex; overflow-y: hidden;
  height: calc(100vh - 35px);

  .recorder {
    width: 70%; height: 100%; display: flex; justify-content: center; align-items: center;
    text-align: center; flex-direction: column;

    .default .tips {
      margin-bottom: 20px; display: block;
    }

    .working-area {
      display: flex; justify-content: center; align-items: center; text-align: center;
      flex-direction: column; height: 100%; width: 100%;

      .confirm {
        height: 40px; display: flex; justify-content: space-between; width: 120px;
        .review-btn {
          color: var(--el-text-color-secondary);
          &.reviewable, .icon-reviewable {
            border-color: var(--el-color-primary); color: var(--el-color-primary);
          }
        }
        .confirm-btn {
          color: var(--el-text-color-secondary);
          &.confirm-able {
            border-color: var(--el-color-primary); color: var(--el-color-primary);
          }
          &.processed {
            background-color: #26974a; color: #ffffff;
          }
        }
      }

      .sentence {
        flex-grow: 1; height: 100%; width: 100%; display: flex; justify-content: center; align-items: center;
        .c-1 {
          font-weight: bold; font-size: 20px; display: inline-block; width: 70%; text-align: left;
        }
      }

      .controller {
        flex-grow: 0; height: 100px; display: flex; justify-content: space-between; align-items: center;
        width: 200px;
        &>a:hover {
          background-color: unset;
        }
        .pagectl {
          color: var(--color-text);
          &.disabled {
            color: var(--el-border-color-light);
          }
        }
      }
    }
  }

  .sentence-list {
    width: 30%;  overflow-y: auto; scroll-behavior: smooth; scroll-snap-type: y mandatory;
    scroll-padding-top: 200px;
    :deep(.el-card) {
      margin: 4px 0 4px 0; cursor: pointer;
      &:hover, &.selected {
        background-color: var(--el-color-primary-light-9);
      }

      .el-card__body {
        padding: 5px 10px;

        .sentence-card {
          display: flex; flex-direction: column;

          .s-content {
            flex-grow: 1;
            .c-1 {
              display: inline-block; text-align: left;
            }
          }

          .s-status {
            height: 20px; width: 100%; display: flex; justify-content: end; align-items: center;
            color: var(--el-border-color-light);
            &.processed {
              color: #26974a;
            }
          }
        }
      }
    }
  }
}
</style>
