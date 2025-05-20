/**
 * Created by WX on 2017/10/9.
 *
 */

const crypto = require("crypto");
const util = require("util");
const path = require("node:path");
const {existsSync, readdirSync, statSync } = require("node:fs");

const algorithm = "aes-256-cbc";
const key = "pss_gkek&wx";

const obj = {
  //加密
  engypt : function(buf){
    let encrypted = "";
    let cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(buf, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
  },

  //解密
  decrypt : function(encrypted){
    let decrypted = "";
    let decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return(decrypted);
  },

  //按照pageSize将一个array切分为多个array。
  //返回的是一个数组，这个数组包含每一个切分好的array
  array_slice: function(array, pageSize){
    let total_page = array.length/pageSize;
    total_page = array.length%pageSize>0?(parseInt(total_page)+1):parseInt(total_page);

    let from_idx = 0;

    let results = [];
    for(let i=0; i<total_page; i++){
      let end = (from_idx+pageSize>=array.length)?array.length:(from_idx+pageSize);
      results.push(array.slice(from_idx, end));
      from_idx+=pageSize;
    }
    return results;
  },
  //因为要在NW 0.14.7（他的node是4.4）中使用util.promiseify，这里处理一下
  promiseify: function(func, callbackWrapper){
    if(util.promisify&&!callbackWrapper){
      return util.promisify(func);
    }else{
      function inner(...args){
        return new Promise((rs,rj)=>{
          func(...args, (err, ...vals)=>{
            if(callbackWrapper){
              try{
                let result = callbackWrapper(err, ...vals);
                rs(result);
              }catch(err){
                rj(err);
              }
            }else{
              return err?rj(err):rs(...vals);
            }
          });
        });
      }
      return inner;
    }
  },

  find: function(dir, filename){
    let preload = path.join(dir, filename);
    if(existsSync(preload)) return preload;
    let subs = readdirSync(dir);
    for(let sub of subs){
      let subdir = path.join(dir, sub);
      if(!statSync(subdir).isDirectory()) continue;
      preload = obj.find(subdir, filename);
      if(preload) return preload;
    }
    return null;
  }
}

module.exports = obj;
