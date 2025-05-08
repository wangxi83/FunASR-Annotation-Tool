<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import {ref, useTemplateRef} from 'vue';
import { onMounted } from 'vue';
import { Document, ArrowLeft, ArrowRight, Headset,Check} from '@element-plus/icons-vue';
import mic_red from '@/assets/mic.png';
import mic_green from '@/assets/mic_green.png';


let filePath = ref(null);
let sentences = ref(null);
let mic_status_pic = ref(mic_red);
let start_record = ref(false);
let end_record = ref(false);
let cur_sentence = ref(null);

// onMounted(async ()=>{
// });

async function selectFile() {
  filePath.value = await window.eAPI.openFile();
  if(filePath.value){
    let fileContents = await window.eAPI.readTrainText(filePath.value);
    if(fileContents&&fileContents.length>0){
      sentences.value = fileContents.map((s, index)=>{
        return {i: s.i, c: s. c, index} //主要是增加一个index
      })
      onSentenceClick(sentences.value[0], 0);
    }
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


function onSentenceClick(sentence){
  cur_sentence.value = sentence;
}

function seekTo(where){
  if(where==='prev'){
    onSentenceClick(sentences.value[cur_sentence.value.index-1]);
  }else{
    onSentenceClick(sentences.value[cur_sentence.value.index+1]);
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
          <el-button :icon="Headset" circle />
          <el-button :icon="Check" circle />
        </div>
        <el-divider style="border-color: #f3f3f3;">
          <img v-if="start_record" src="@/assets/wave.gif" style="height: 28px; width: 48px"/>
          <span v-if="end_record">15″</span>
        </el-divider>
        <div class="controller">
          <a @click="cur_sentence.index===0?null:seekTo('prev')">
            <el-icon :size="20" class="pagectl prev" :class="cur_sentence.index===0?'disabled':null"><ArrowLeft /></el-icon>
          </a>
          <img @touchstart.prevent="startRecord" @touchend.prevent="endRecord" :src="mic_status_pic" style="height: 48px; width: 48px"/>
          <a @click="cur_sentence.index===sentences.length-1?null:seekTo('next')">
            <el-icon :size="20" class="pagectl next" :class="cur_sentence.index===sentences.length-1?'disabled':null"><ArrowRight /></el-icon>
          </a>
        </div>
      </div>
    </div>
    <el-divider direction="vertical" style="height: 100%; border-color: #f3f3f3;"/>
    <div class="sentence-list">
<!--      <SentenceList :sentences="sentences" @sentence-click="onSentenceClick"-->
<!--                    ref="slist" :seek-to-idx="seek_to_idx"/>-->
      <el-card v-for="(sentence, index) in sentences" shadow="never" @click="onSentenceClick(sentence, index)"
               :id="sentence.i" :key="sentence.i" :class="cur_sentence.i===sentence.i?'selected':null">
        <div class="sentence-card">
          <div class="s-content" :class="''">
            <el-text class="mx-1 c-1">{{ sentence.c }}</el-text>
          </div>
          <div class="s-status">
            <el-icon :size="16"><SuccessFilled /></el-icon>
          </div>
        </div>
      </el-card>
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
    width: 30%;  overflow-y: auto; scroll-behavior: smooth;
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
          }
        }
      }
    }
  }
}
</style>
