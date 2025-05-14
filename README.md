# FunASR-Annotation-Tool

因为工作需要，做了一个简单的FunASR语音引擎训练材料标注工具。

以[paramformer训练](https://github.com/modelscope/FunASR/blob/main/examples/industrial_data_pretraining/paraformer/README_zh.md)为例，逻辑就是：

1. 搞一个train_text.txt文件
2. 打开train_text.txt文件
3. 录音，保存wav到本地，和train_text.txt中的材料一一对应
4. 生成parafomer训练指令需要的train_wav.scp文件


备注：

1. 目前只实现了parafomer的，对我们目前的工作已经满足要求了，后续有其他要求再说（比如SenceVoice就还有事件、情绪）。这个也好做，就是切换菜单的时候，实现支持事件、情绪标注的功能即可
2. 很多稳定性功能并没有太关注，若使用中出现问题，自行处理即可
<br/>

----

基本操作流程：

1. 利用任何一个LLM，生成train_text.txt。我这里有一个样例：
```
随机生成20条内容，要求如下： 
1、这些内容可以是中文也可以是英文 
2、每段内容的长度如果用正常语速阅读，不超过30秒。你生成的内容，每一条长度要分布均匀，有长有短 
3、需要为每段内容标注一个ID，假设内容用“C”表示，那么你给出的结果为：ID 空格 C。每一条换一行。 
4、ID要有顺序，比如从A0000开始，每一条增加一个数字 
5、特别注意，格式就是 "ID空格C"，不要添加任何其他内容，严格按照此格式
6、不要做任何总结、归纳，只需要给出结果
```
2. 保存LLM生成的内容到`{working_dir}\train_text.txt`中。working_dir你自己选
3. 运行软件，“选择材料文件”或者用“文件->加载”出`{working_dir}\train_text.txt`
4. 录音、保存
5. “处理->生成jsonl素材”

最后，你就会在`{working_dir}\train_text_dist\`中得到你需要的内容


操作界面：

- 基本界面

![image](https://github.com/user-attachments/assets/07207ef7-e4a9-4963-9e3c-9308737bbe38)

- 菜单
  
![image](https://github.com/user-attachments/assets/a0e118c8-7b8f-4acf-9b9a-28a148510ed7)


<br/><br/><br/>

- 产生的结果[1]

![image](https://github.com/user-attachments/assets/56db0adf-9c79-4961-ab71-7055598ada64)

- 产生的结果[2]

![image](https://github.com/user-attachments/assets/ad3eae6f-0d0a-46b9-8b35-f266873fed84)
