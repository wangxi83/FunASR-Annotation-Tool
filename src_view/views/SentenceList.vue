<script setup>
import { SuccessFilled } from '@element-plus/icons-vue';
import { ref, watch, useTemplateRef, nextTick } from 'vue';
import { onMounted } from 'vue';

//属性
const { sentences } = defineProps(['sentences']);
//事件
const emit = defineEmits(['sentence-click']);

let selectedId = ref(null);

onMounted(()=>{
});

//当传入sentences的时候，选中第一个，由于监听的是props，这里需要用getter形式：()=>sentences 来监听
watch(()=>sentences, (neu, old)=>{
  if(neu&&neu.length>0){
    cardClick(neu[0].c, neu[0].i, 0);
  }
});

function cardClick(sentence, id, index){
  emit('sentence-click', sentence, id, index);
  selectedId.value = id;
}
</script>

<template>
  <div class="s-list">
    <el-card v-for="(sentence, index) in sentences" shadow="never" @click="cardClick(sentence.c, sentence.i, index)"
             :key="sentence.i" :class="selectedId===sentence.i?'selected':null">
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
</template>

<style lang="scss" scoped>
.s-list {
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
</style>
