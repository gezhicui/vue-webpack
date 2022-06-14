# vue 文件被解析的整个过程

首先进行 webpack 打包,把.vue 文件通过 vue-loader 处理。

通过一系列正则，最终一个.vue 文件的内容会被包装到一个对象中

把这个对象使用 createApp 进行处理，挂载到页面上
