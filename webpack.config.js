/**
 * Created by wangx
 *
 * 用webpapack来 打包 node部分，主要目的是减少体积和混淆
 *
 */
'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        "EApp": "./EApp.cjs",
        "preload": "./preload.cjs"
    },
    // externals: externals,
    target: "electron-main",
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].cjs'
    },
    devtool: false,
    node: {
        __dirname: true
    },
    plugins: [

    ],
    module: {
        // rules: [
        //     {
        //         use: {
        //             loader: 'babel-loader',
        //             options: {
        //                 presets: [
        //                     ['@babel/preset-env']
        //                     // ['@vue/app', {
        //                     //     polyfills: [
        //                     //         'es.promise',
        //                     //         'es.symbol'
        //                     //     ]
        //                     // }]
        //                 ]
        //             }
        //         },
        //         test: /\.cjs$/
        //         // exclude: [
        //         //     /node_modules[\\\/]core-js/,
        //         //     /node_modules[\\\/]webpack[\\\/]buildin/,
        //         // ]
        //     }
        // ]
    },
    optimization: {
        minimize: true
    }
};


webpack(module.exports, (err, stats) => { // [Stats Object](#stats-object)
    if (err) throw err
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n');

    if (stats.hasErrors()) {
        console.log('  Build failed with errors.\n');
        process.exit(1);
    }

    console.log('  Build complete.\n');
});
