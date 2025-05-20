/**
 * Created by wangx on 2025-05-19.
 *
 */
const { api } = require('@electron-forge/core')
const fs = require('node:fs/promises');
const path = require('node:path');

//@see ${root}/build.readme.md
const main = async () => {
  //拷贝package.json到dist目录，只用dist内容打包
  await fs.copyFile(path.join(__dirname, "./package.json"), path.join(__dirname, "./dist/package.json"));
  //api方式调用package，就可以传入dir，修改打包目录，它的逻辑是根据dir向上遍历，找到package.json所在目录
  //从源码上看，https://github.com/electron/forge/blob/e7d23c3311dbd42fbfc366d41bbcbb7df5299fc7/packages/api/core/src/api/package.ts#L303
  //以下参数可以用api传入。其他的只有通过forge.packagerConfig（package.json或forge.config.js）传入
  //还有一些它狗日的居然写死了
  /*
   * const packageOpts = {
   *    asar: false,
   *    overwrite: true,
   *    ignore: [/^\/out\//g],
   *    quiet: true,
   *    ...forgeConfig.packagerConfig, //这里
   *    dir: ctx.dir,
   *    arch: arch,
   *    platform,
   *    ...其他
   *    out: calculatedOutDir,
   *    ...其他
   *  };
   *  packageOpts.quiet = true; //这一句更蛋疼，不过我用的版本里面，源码没有这一句
   */
  // 因此，配置如下，这里主要是控制dir和outDir。
  await api.package({
    dir: './dist',
    outDir: './dist/forge-out',
    // icon: "./dist/logo.ico",  //放到forgeConfig.packagerConfig
    // overwrite: true,  //放到forgeConfig.packagerConfig
    // quiet: false, //没用
    //https://github.com/electron/packager/blob/34f88573ed8cc2a1a2f23598906669059babf174/src/packager.ts#L105
    //这里可以看到，他会从electronZipDir中去找`electron-v${downloadOpts.version}-${downloadOpts.platform}-${downloadOpts.arch}.zip`
    //所以，可以提前去https://github.com/electron/electron/releases中下载出来
    //源码中是以electronZipDir这个绝对路径作为寻址目标，所以这里要处理成绝对路径
    // electronZipDir: path.join(__dirname, './electronZipDir') //放到forgeConfig.packagerConfig
  });
  // 最后，为了能在forge.packagerConfig中传入 arch: "ia32", platform: "xx"
  // 我修改了源码：${projectRoot}/node_modules/@electron-forge/core/dist/api/package.js# const packageOpts = {XXXX
  // 有需要的小伙伴可以按我的方式处理
};

main();
