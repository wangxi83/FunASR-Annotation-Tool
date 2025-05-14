<script setup>
import { ref, onBeforeMount } from 'vue';
import { Check,CircleCloseFilled } from '@element-plus/icons-vue';

const processing = ref(false);
const dialogVisible = ref(false);
const clipPath = ref(null);
const error = ref(null);

onBeforeMount(()=>{
  //监听主进程创建素材开始
  window.eAPI.onJsonlClipsGenStarted(async ()=>{
    dialogVisible.value = true;
    processing.value = true;
    clipPath.value = null;
    error.value = null;
  });
  //监听主进程创建素材完成
  window.eAPI.onJsonlClipsGenEnded(async (path, err)=>{
    if(err){
      error.value = err;
    }else{
      clipPath.value = path;
    }
    processing.value = false;
  });
});
</script>


<template>
  <el-dialog v-model="dialogVisible" title="生成jsonl相关内容" width="50%" :show-close="!processing">
    <div v-if="processing" class="dialog-body">
      <div class="wrapper">
        <img src="@/assets/gear.gif" style="height: 48px; width: 48px; margin-right: 16px"/>
        <el-text class="mx-1" size="large">正在处理中.......</el-text>
      </div>
    </div>
    <div v-else-if="error">
      <el-icon size="48" color="#ff0000"> <CircleCloseFilled /></el-icon>
      <div>处理失败</div>
      <div style="color: #ff0000">{{ error }}</div>
    </div>
    <dive v-else>
      <el-icon size="48" color="#26974a"> <Check /></el-icon>
      <div>处理完成，在以下目录中进行查看</div>
      <div>{{ clipPath }}</div>
    </dive>
    <template #footer v-if="!processing">
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-body {
  padding: 20px; display: flex; justify-content: center;
  .wrapper {
    display: flex; width: 210px; align-items: center;
  }
}
</style>
