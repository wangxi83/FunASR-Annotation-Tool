/**
 * Created by WX on 2017/6/7.
 */

const log4js = require('log4js');
const path = require('path');
let level = (()=>{
    console.log(process.argv);
    for(let arg of process.argv){
        if(arg==="--debug"){
            return "debug";
        }
    }
    return "info";
})();

log4js.addLayout('custom', (config)=>{
    return function(logEvent) {
        return JSON.stringify(logEvent);
    }
})

let loggerConf = {
    appenders: {
        //控制台输出
        consoleappender:{
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: "[%d{ISO8601}] [%p] [%f(%l)] - %m"
            }
        },
        fileappender:{
            type: "file",
            filename: path.join(process.cwd(), './logs/log'),
            pattern: "_yyyy-MM-dd",
            layout: {
                type: 'pattern',
                pattern: "[%d{ISO8601}] [%p] [%f(%l)] - %m"
            },
            maxLogSize: 5242880,
            backups: 3
        }
    },
    categories: {
        default: {
            appenders: ['consoleappender'],
            level: level,
            enableCallStack: true
        },
        dateFileLog: {
            appenders: ['consoleappender', 'fileappender'],
            level: level,
            enableCallStack: true
        }
    }
};

log4js.configure(loggerConf);


//发布这个对象
module.exports = log4js.getLogger('dateFileLog');