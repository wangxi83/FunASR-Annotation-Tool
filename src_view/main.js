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
        {i: 'A0000', c:'我是一名知识丰富的助手，能够解答您关于科学、历史、文化、技术等领域的各种问题。我的目标是提供清晰、准确且简短的答案，帮助您快速获取所需信息。无论您是学习、工作还是对某个话题感兴趣，我都会尽力提供帮助。如果您有任何问题，请随时提问，我会尽力为您解答。'},
        {i: 'A0001', c: '一百啊手动阀手动阀手动阀'},
        {i: 'A0002', c: '甚至出现交易几乎停滞的情况'},
        {i: 'A0003', c: '湖北一公司以员工名义贷款数十员工负债千万'},
        {i: 'A0004', c: '所有只要处理 data 不管你是做 machine learning 做 deep learning 做 data analytics 做 data science 也好 scientist 也好通通都要都做的基本功啊那 again 先先对有一些 > 也许对'},
        {i: 'A0005', c: 'he tried to think how it could be'},
        {i: "A0006", c: "研究表明，每天坚持30分钟的锻炼可以显著改善心血管健康，建议选择适合自己的运动方式。"},
        {i: "A0007", c: "阅读是提升认知和想象力的有效方式。"},
        {i: "A0008", c: "人工智能技术正在逐步改变医疗行业，通过精准诊断和个性化治疗方案，为患者带来更好的医疗服务。"},
        {i: "A0009", c: "自然风光能让人放松心情，缓解压力。"},
        {i: "A0010", c: "全球气候变化对农业产量产生重大影响，科学家呼吁采取更有效的环保措施。"},
        {i: "A0011", c: "学习新技能可以提升自信心和竞争力。"},
        {i: "A0012", c: "太空探索不仅推动科技发展，还能帮助人类更好地理解宇宙和地球的奥秘。"},
        {i: "A0013", c: "健康的饮食习惯对身体和心理健康都有益处。"},
        {i: "A0014", c: "文化遗产是人类共同的财富，保护和传承文化遗产对维护文化多样性至关重要。"},
        {i: "A0015", c: "音乐能激发情感，改善心情。"},
        {i: "A0016", c: "量子计算被认为是下一代计算机技术，有望在解决复杂问题上实现突破。"},
        {i: "A0017", c: "旅行能开阔视野，增长见识。"},
        {i: "A0018", c: "心理健康问题日益受到关注，寻求专业帮助是解决问题的重要步骤。"},
        {i: "A0019", c: "良好的时间管理能提高效率，减少压力。"},
        {i: "A0020", c: "可持续发展是全球关注的重点，通过绿色能源和循环经济模式，可以实现更环保的未来。"}
      ];
    }
  }
}


const app = createApp(App)

// app.use(router)
app.use(ElementPlus)
app.mount('#app')
