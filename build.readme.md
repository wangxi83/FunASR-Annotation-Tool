### 打包逻辑：

1、npm run build => "build": "vite build"
vue资源打包

2、npm run electron-build => "electron-build": "node webpack.config.js"
用webpack打包electron主进程

3、npm run forge-make => "forge-make": "node forge.make.js"
执行forge打包
这里会把package.json拷贝到dist目录
因为我想直接用dist中的内容打包，而不是用app根目录的所有内容打包，所以拷贝了package.json到dist目录

核心原因如下：

如果用cli或读取forge.config.js或package.json中forge.config的方式，根本无法修改dir.原因是[官方宣称的几个参数不能修改](https://www.electronforge.io/config/configuration#electron-packager-config)

但是我们通过查看文档中这句话

The options you can put in this object are documented in the [Electron Packager API docs](https://electron.github.io/packager/main/interfaces/Options.html).

可以在API实现的源码上看到
它会从dir去寻找package.json，然后以package.json所在目录为打包资源工作目录
所以，通过执行代码方式的打包（"node forge.make.js"）， 才能把dir: './dist'传入
这样才能指定打包内容为dist目录中的内容.


4、最终可以合并成一个
npm run make-all => "vite build && node webpack.config.js && node forge.make.js"

---

如果是用forge创建的项目，感觉应该要去配置webpack-plugin，最后逻辑也是这个道理