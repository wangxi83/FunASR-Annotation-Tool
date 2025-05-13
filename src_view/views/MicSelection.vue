<script setup>
import { ref, onBeforeMount, nextTick } from 'vue'


const mics = ref([]);
const selected = ref(null);
const dialogVisible = ref(false);

onBeforeMount(()=>{
  //注册菜单事件：麦克风选择
  window.eAPI.onMenuSelectMic(async ()=>{
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    mics.value = devices.filter(device => device.kind === 'audioinput'&&['default', 'communications'].indexOf(device.deviceId)<0);
    if(selected.value) {
      selected.value = mics.value.find((t) => t.deviceId === selected.value.deviceId);
    }
    dialogVisible.value = true;
  });
});


const emit = defineEmits(['micChanged'])
function confirmSelection(){
  emit('micChanged', selected);
  dialogVisible.value = false;
}
</script>


<template>
  <el-dialog v-model="dialogVisible" title="选择一个麦克风" width="50%">
    <el-select v-if="mics.length>0" v-model="selected" value-key="deviceId" :placeholder="selected?selected.label:mics[0].label">
      <el-option v-for="(mic, idx) in mics" :key="mic.deviceId" :label="mic.label" :value="mic" />
    </el-select>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

