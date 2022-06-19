# 如何在不使用任何第三方包(除 webpack)的情况下，处理一个 vue 文件并实现简单的响应式？

## webpack 部分

首先进行 webpack 打包,把`.vue` 文件通过 `vue-loader` 处理。

实现一个简易的`vue-loader`,通过一系列正则，最终一个`.vue `文件的内容会被包装到一个对象中

比方说我现在的.vue 文件写了下面这些内容：

```
<template>
  <div>
    <h1>{{ count + 1 }}</h1>
    <button @click="plus(1)">+</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      count: 0
    }
  },
  methods: {
    plus (num) {
      this.count += num;
    }
  }
}
</script>
```

那么经过 `vue-loader` 处理，就会变成一个对象：

```
{
  template:
   `<div>
     <h1>{{ count + 1 }}</h1>
      <button @click="plus(1)">+</button>
  </div>`,
  name: 'App',
  data() {
    return { count: 0 }
  },
  methods: {
    plus(num) { this.count += num; },
  }
}
```

那么，在浏览器执行这个文件的时候，我们就能通过`createApp`方法，把这个对象使用 `createApp` 进行处理，挂载到页面上

## createApp 实现部分

在 vue 的`main.js`文件中，我们通常会把根组件传递给`createApp`作为入参，如:

```js
import App from './App';
import { createApp } from '../modules/vue';

createApp(App).mount('#app');
```

那我们实现的重点就在于`createApp`对**vue 组件**的处理，以及在`createApp`的返回内容(就是 vm)中添加`mount`方法，实现处理完的节点的挂载
