<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue';
import { onMounted } from 'vue';
import { Document, ArrowLeft, ArrowRight, Headset,Check} from '@element-plus/icons-vue';
import mic_red from '@/assets/mic.png';
import mic_green from '@/assets/mic_green.png';
import SentenceList from './views/SentenceList.vue';


let filePath = ref(null);
let fileContents = ref(null); // for debug
let mic_status_pic = ref(mic_red);
let start_record = ref(false);
let end_record = ref(false);
let cur_sentence = ref(null);

// onMounted(async ()=>{
// });


async function selectFile() {
  filePath.value = await window.eAPI.openFile();
  if(filePath.value){
    fileContents.value = await window.eAPI.readTrainText(filePath.value);
  }
}

async function startRecord(){
  mic_status_pic.value = mic_green;
  start_record.value = true;
  end_record.value = false;
}

async function endRecord(){
  mic_status_pic.value = mic_red;
  start_record.value = false;
  end_record.value = true;
}

function onSentenceClick(sentence, i){
  cur_sentence.value = sentence;
}
</script>

<template>
  <div class="main">
    <div class="recorder">
      <div class="default" v-if="!Array.isArray(fileContents)||!fileContents.length">
        <el-text class="mx-1 tips" type="info">点击下方按钮，选择语音材料以开始</el-text>
        <el-button type="primary" :icon="Document" @click="selectFile">选择材料文件</el-button>
      </div>
      <div class="working-area" v-else>
        <div>
          <el-text class="mx-1 tips" type="info">按住语音按钮，以正常语速念出下述内容</el-text>
        </div>
        <div class="sentence">
          <el-text class="mx-1 c-1">{{cur_sentence}}</el-text>
        </div>
        <div class="confirm">
          <el-button :icon="Headset" circle />
          <el-button :icon="Check" circle />
        </div>
        <el-divider style="border-color: #f3f3f3;">
          <img v-if="start_record" src="@/assets/wave.gif" style="height: 28px; width: 48px"/>
          <span v-if="end_record">15″</span>
        </el-divider>
        <div class="controller">
          <el-icon :size="20"><ArrowLeft /></el-icon>
          <img @touchstart.prevent="startRecord" @touchend.prevent="endRecord" :src="mic_status_pic" style="height: 48px; width: 48px"/>
          <el-icon :size="20"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    <el-divider direction="vertical" style="height: 100%; border-color: #f3f3f3;"/>
    <div class="sentence-list">
      <SentenceList :sentences="fileContents" @sentence-click="onSentenceClick"/>
    </div>
  </div>
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
      }
    }
  }

  .sentence-list {
    width: 30%;  overflow-y: auto;
  }
}
</style>
