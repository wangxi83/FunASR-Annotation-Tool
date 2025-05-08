import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import router from './router'

// 这里做一个mock
if(import.meta.env.DEV){
  window.eAPI = {
    openFile: function(){
      return "hello world";
    },
    // 读取训练文本
    readTrainText: function (filePath){
      console.log(filePath);
      return [
        {i:'A0000', c:'我是一名知识丰富的助手，能够解答您关于科学、历史、文化、技术等领域的各种问题。我的目标是提供清晰、准确且简短的答案，帮助您快速获取所需信息。无论您是学习、工作还是对某个话题感兴趣，我都会尽力提供帮助。如果您有任何问题，请随时提问，我会尽力为您解答。'},
        {i: 'A0001', c: '一百啊手动阀手动阀手动阀'},
        {i: 'A0002', c: '甚至出现交易几乎停滞的情况'},
        {i: 'A0003', c: '湖北一公司以员工名义贷款数十员工负债千万'},
        {i: 'A0004', c: '所有只要处理 data 不管你是做 machine learning 做 deep learning 做 data analytics 做 data science 也好 scientist 也好通通都要都做的基本功啊那 again 先先对有一些 > 也许对'},
        {i: 'A0005', c: 'he tried to think how it could be'}
      ];
    }
  }
}


const app = createApp(App)

// app.use(router)
app.use(ElementPlus)
app.mount('#app')
