/**
 * Created by WX on 2017/9/27.
 */

const fs = require("fs");
const path = require("path");
const timeutil = require('silly-datetime');
const logger = require("./logger.cjs");
const common = require("./common-util.cjs");
let child_process = require("child_process");

let root_ = '';

module.exports={
    //递归创建目录 异步方法
    mkdirs: async function (dirname, callback, onErr) {
        let this_ = this;
        return new Promise((rs,rj)=>{
            fs.exists(dirname, (exists)=>{
                //如果目录存在，则执行后续处理
                if (exists) {
                    if(callback) callback(dirname);
                    else rs(dirname);
                } else {
                    //否则，创建该目录
                    let parent = path.dirname(dirname);
                    //如果父目录存在，则创建该目录，否则创建父目录
                    fs.exists(parent, (exists)=>{
                        if(exists){
                            fs.mkdir(dirname, (err)=>{
                                if(err&&err.code!=="EEXIST"){
                                    if(onErr) onErr(err);
                                    else rj(err);
                                    return;
                                }
                                if(callback) callback(dirname);
                                else rs(dirname);
                            });
                        }else{
                            this_.mkdirs(parent,
                                //父目录创建成功之后，创建本目录，然后执行callback
                                ()=>{
                                    fs.mkdir(dirname, (err)=>{
                                        if(err&&err.code!=="EEXIST"){
                                            if(onErr) onErr(err);
                                            else rj(err);
                                            return;
                                        }
                                        if(callback) callback(dirname);
                                        else rs(dirname);
                                    });
                                },
                                (err)=>{
                                    //如果父目录存在，则执行本目录创建，然后callback
                                    if(onErr) onErr(err);
                                    else rj(err);
                                }
                            );
                        }
                    });
                }
            });
        });
    },

    mkdirsSync: function (dirname){
        try{
            fs.mkdirSync(dirname);
        }catch(err){
            if(err.code==="EEXIST"){
                return dirname;
            }
            if(err.code==="ENOENT"){
                let parent = path.dirname(dirname);
                this.mkdirsSync(parent);
                fs.mkdirSync(dirname);
            }
        }
    },

    rmdirsSync: function(dirname){
        let subs = fs.readdirSync(dirname);
        if(subs.length>0){
            for(let idx in subs){
                let sub = path.join(dirname, subs[idx]);
                if(fs.statSync(sub).isDirectory()){
                    this.rmdirsSync(sub);
                }else{
                    fs.unlinkSync(sub);
                }
            }
        }
        while(true){
            try {
                fs.rmdirSync(dirname);
            }catch (err){
                if(err.message.indexOf("no such file or directory")>-1){
                    break;
                }
            }
        }

    },

    rmdirs: async function(dirname){
        let subs = await new Promise((rs,rj)=>fs.readdir(dirname, (err, files)=>err?rj(err):rs(files)));
        if(subs.length>0){
            for(let idx in subs){
                let sub = path.join(dirname, subs[idx]);
                let stat = fs.statSync(sub);
                if(stat.isDirectory()){
                    await this.rmdirs(sub);
                }else{
                    await new Promise((rs,rj)=>fs.unlink(sub, (err)=>rs(err)));
                }
            }
        }
        while(true){
            let err = await new Promise((rs, rj)=>fs.rmdir(dirname, (err)=>rs(err)));
            if(err&&err.message.indexOf("no such file or directory")>-1){
                break;
            }
        }
    },

    //获取项目根路径
    projectRoot: function(){
        if(root_!==''){
            return root_;
        }
        let dir = path.resolve(process.cwd(), "./");
        while(!fs.existsSync(dir+"/package.json")){
            dir = path.resolve(dir, "../");
        }
        root_ = dir;
        return root_;
    },

    //获取windows盘符（https://blog.csdn.net/yang5915/article/details/107669177）
    //fsutil，根据命令行提示，可以得到fsutil fsinfo drives这个命令
    showLetter: async function(callback) {
        if(child_process){
            let diskResult;
            let error;
            let command;
            try{
                command = child_process.exec('fsutil fsinfo drives', function(err, stdout, stderr) {
                    if(err || stderr) {
                        error = "root path open failed: " + err + stderr;
                    }
                    diskResult = stdout;
                });
            }catch (err){
                return Promise.reject(err);
            }
            command.stdin.end();   // stop the input pipe, in order to run in windows xp
            return new Promise((rs, rj)=>{
                command.on('close', function(code) {
                    if(code!==0){
                        if(callback) return callback(null, error);
                        return rj(error);
                    }
                    logger.info("showLetter：fsutil fsinfo drives: 获取到磁盘信息："+diskResult);//得到的信息是 “XXXXX: C:\ D:\ E:\”
                    //由于在xp环境下，通过空格分隔，会出现很奇怪的情况，这里只有通过冒号分隔
                    //然后，还有一个更奇怪的情况：在某些（注意，是某些）机器上（注意，是机器，不是系统），xp下得到的冒号分隔内容
                    //其中每一个元素，前面都有一个“不是空格的空白字符！！！”我日你妈的批！
                    // data = data.map((info)=>info.trim()) 因此，这个trim就不管用了！只有用正则替换非字母内容
                    let data = diskResult.substring(diskResult.indexOf(":")+1, diskResult.length).match(/\w:\\/g);
                    try{
                        command.kill();
                    }catch(err){
                        logger.error("fileuitl.showLetter子进程关闭出现错误："+err);
                    }
                    if(callback) return callback(data);
                    return rs(data);
                });
            });
        }else{
            logger.info("showLetter：尝试使用sobeyexec执行命令");
            //这个会在webpack的时候拷贝到目标目录 publics/utils/sobeyexec
            /*！！！！！这里用  【global.require】，比较重要
            * 由于NW环境下，我们的publics模块是通过webpack打包到NW的（主要是为了和electron共用，其实完全可以不考虑共用。共用的原因其实是因为最早写的是electron，不想丢了）
            * 这个时候，其实所有东西都没问题。
            * 但是，我们需要用到addon，也就是整个项目中的“xp断网环境child_process问题”
            * addon由于不会被“webpack打包”，因此，我们会把addon从publics中，拷贝到NW目录。
            * 这样一来，这个addon就一定只能被nw的require加载——也就是打包产生的require，并不能引用到这个addon。
            * 具体原因，可以参考NW的运行环境说明：https://nwjs.org.cn/doc/user/Advanced/JavaScript-Contexts-in-NW.js.htm
            * ——如果不打包，也就是不考虑共用electron问题的话，其实不会有这个问题，我猜测是打包的时候，这个“后台的requre”已经被webpack的loader固化为一种固有代码形式了。
            * 由于我们需要让“后台代码——也就是这里的打包后的代码”能正常require，这里我们显示的使用global对象的require，就不会固化
            * 这样，require就能在运行时正常的得到想要的require函数。并且global.require，在electron也是OK的。
            * 在publics中的fileutils、office-processor、mamcvt-processor等，都能看到这部分内容
            */
            let sobey_exec = global.require(path.join(process.cwd(), "./publics/utils/sobeyexec/addon"));
            let result = sobey_exec.exec("fsutil fsinfo drives");
            logger.info("showLetter：fsutil fsinfo drives: 获取到磁盘信息："+result);//得到的信息是 “XXXXX: C:\ D:\ E:\”
            //由于在xp环境下，通过空格分隔，会出现很奇怪的情况，这里只有通过冒号分隔
            //然后，还有一个更奇怪的情况：在某些（注意，是某些）机器上（注意，是机器，不是系统），xp下得到的冒号分隔内容
            //其中每一个元素，前面都有一个“不是空格的空白字符！！！”我日你妈的批！
            // data = data.map((info)=>info.trim()) 因此，这个trim就不管用了！只有用正则替换非字母内容
            return result.substring(result.indexOf(":")+1, result.length).match(/\w:\\/g);
        }
        //修改为不使用child_process
        // let pan = ["A:\\","B:\\","C:\\","D:\\","E:\\","F:\\","G:\\","H:\\","I:\\","J:\\","K:\\",
        //     "L:\\","M:\\","N:\\","O:\\","P:\\","Q:\\","R:\\","S:\\","T:\\","U:\\","V:\\","W:\\",
        //     "X:\\","Y:\\","Z:\\"];
        // let out = [];
        // for(let item of pan){
        //     let result = await common.promiseify(fs.readdir, (err, files)=>{
        //         if(err){
        //             if(err.toString().indexOf("Error: ENOENT: no such file or directory")>-1){
        //                 return false;
        //             }else if(err.code==="UNKNOWN"&&err.errno===-4094){
        //                 return true;
        //             }
        //             throw err;
        //         }
        //         return true;
        //     })(item);
        //     if(result){
        //         out.push(item);
        //     }
        // }
        // return out;
    },


    /**
     * 获取当前目录的一级子目录（或所有文件）
     * @param curFolder
     * @param options --> {reuslt:["dir", "file"], ext:[".xxx", ".yyy"]}
     * @returns {Promise<[[], []]>}
     */
    getSubFiles: async function(curFolder, options){
        let needDir = true;
        let needFile = true;
        let ext = undefined;
        if(options&&options.result){
            needDir = options.result.includes("dir");
            needFile = options.result.includes("file");
        }
        if(needFile&&options&&options.ext){
            ext = options.ext;
        }

        try {
            let files = await new Promise((rs, rj) => fs.readdir(curFolder, (err, files) => err ? rj(err) : rs(files)));
            let resultdirs = [];
            let resultfiles = [];
            for(let idx in files){
                let file = files[idx];
                let stat;
                try {
                    stat = await new Promise((rs,rj)=>fs.stat(path.join(curFolder, file), (err,stat)=>rs(stat)));
                    if(!stat) continue;
                    if(file === "$RECYCLE.BIN"||file === "sbytmp") continue;
                    if(!needDir&&stat.isDirectory()) continue;
                    if(!needFile&&stat.isFile()) continue;
                    if(needFile&&ext&&stat.isFile()&&!ext.includes(path.extname(file).toLowerCase())) continue;
                } catch (err) {
                    if (err.toString().indexOf("operation not permitted") > -1) {
                        continue;
                    }
                }

                let obj = {
                    parent: curFolder,
                    path: path.join(curFolder, file.trim()),
                    name: file.trim(),
                    createTime: timeutil.format(stat.birthtime, "YYYY-MM-DD HH:mm:ss"),
                    isDir: stat.isDirectory(),
                    isOfficial: path.extname(file.trim())===".sbyo"
                };
                if(stat.isDirectory()){
                    resultdirs.push(obj);
                }else{
                    resultfiles.push(obj);
                }
            }
            logger.debug("getSubFiles("+curFolder+","+JSON.stringify(options)+")返回内容："
                +JSON.stringify(resultdirs)+"\n"+JSON.stringify(resultfiles));
            return [resultdirs, resultfiles];
        }catch (err){
            logger.error(err+"\n"+err.stack);
            if(err.message.indexOf("operation not permitted")>-1){
                return [[],[]];
            }
            throw err;
        }
    },

    findBin: function (binFile){
        //兼容NW
        if(process.env.NODE_ENV === "nw"){
            return path.join(process.cwd(), binFile);
        }
        let cd = __dirname;
        let bin;
        while(!bin){
            try{
                let tmp = path.join(cd, "./"+binFile);
                fs.statSync(tmp);
                bin = tmp;
            }catch (err){
                if(err.message.startsWith("ENOENT: no such file or directory")){
                    let p = path.join(cd, "../");
                    if(p===cd){
                        throw new Error("寻址到根路径"+p+"，无法找到"+binFile);
                    }
                    cd = p;
                    continue;
                }
                throw err
            }
        }
        return bin;
    },

    cpdirSync: function(source, target, loader){
        let files = fs.readdirSync(source);
        files.forEach((file)=>{
            let sub = path.join(source, "./"+file);
            let sub2target = path.join(target, "./"+file);
            if(fs.statSync(sub).isDirectory()){
                if(file===path.basename(target)) return;//如果子目录和目标目录重复，则不拷贝，否则无限递归
                fs.mkdirSync(sub2target, {recursive: true});
                this.cpdirSync(sub, sub2target);
            }else{
                //NW0.14.7环境（node4.4）没有copyfile。只有采用读取写入
                //现在加入了resolver回调，因此直接用写入了
                let buffer = fs.readFileSync(sub);
                if(loader){
                    buffer = loader(sub, buffer);
                }
                if(buffer instanceof Promise){
                    buffer.then((result)=>{
                        fs.writeFileSync(sub2target, result);
                    });
                }else{
                    fs.writeFileSync(sub2target, buffer);
                }
            }
        });
    },

    cpdir: async function(source, target, loader){
        let files = await common.promiseify(fs.readdir)(source);
        for(let file of files){
            let sub = path.join(source, "./"+file);
            let sub2target = path.join(target, "./"+file);
            let stat = await common.promiseify(fs.stat)(sub);
            if(stat.isDirectory()){
                if(file===path.basename(target)) return;//如果子目录和目标目录重复，则不拷贝，否则无限递归
                await common.promiseify(fs.mkdir)(sub2target, {recursive: true});
                await this.cpdir(sub, sub2target);
            }else{
                //原因同cpdirSync
                let buffer = await common.promiseify(fs.readFile)(sub);
                if(loader){
                    buffer = loader(sub, buffer);
                    if(buffer instanceof Promise){
                        buffer = await buffer;
                    }
                }
                await common.promiseify(fs.writeFile)(sub2target, buffer);
            }
        }
    },
};
