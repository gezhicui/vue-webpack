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

接下来就一步步实现`createApp`，首先，我们先来定义一个 vm，一会儿所有的属性都可以放在 vm 上,同时把`vue-loader`解析过的文件对象中的内容给解构出来

```js
function createApp(component) {
  const vm = {};
  const { template, methods, data } = component;
}
```

### template 解析

在上面经过`vur-loader`处理后，**`template`以字符串形式**被放到对象中，所以我们可以拿到 dom 元素字符串，把他转成 dom 元素

```js
/* 
  template:
   `<div>
     <h1>{{ count + 1 }}</h1>
      <button @click="plus(1)">+</button>
  </div>`,
*/
vm.$node = createNode(template);

function createNode(template) {
  const _tempNode = document.createElement('div');
  _tempNode.innerHTML = template;
  return getFirstChildNode(_tempNode);
}
```

这样，我们就拿到了 html 接下来就是对 js 的操作

### data 响应式处理

vue 的核心就在于响应式，vue2 通过`Object.defineProperty`实现响应式，我们来实现个简单的响应式处理

首先拿到`data`,为了创建多个组件时`data`不被互相影响，所以`data`是一个函数

```js
vm.$data = data();

for (let key in vm.$data) {
  Object.defineProperty(vm, key, {
    get() {
      return vm.$data[key];
    },
    set(newValue) {
      vm.$data[key] = newValue;
      // update触发节点更新，至于实现我放到后面再说
      update(vm, key);
    },
  });
}
```

这样，我们就监听了`data`中每个属性的`get`和`set`，实现了数据的响应式处理

### 初始化数据池

在上面的 **template 解析**中，我们已经拿到了`template`转换过后的节点，但是有个问题，节点的内容没有经过任何处理，如`{{count + 1}}`会原封不动的展示在浏览器中，我们希望的是最终展示的是 count 这个变量+1 的结果，所以我们需要对双括号语法进行解析

我们先定义一个正则表达式，匹配`{{}}`中的内容，以及定义一个节点数据池

```js
// 节点数据池
const exprPool = new Map();
// 正则获取双括号中内容
const regExpr = /\{\{(.+?)\}\}/;
```

然后，从我们刚刚定义的`vm.$node`中拿到所有节点，并查看该节点是否有双括号语法，如果有的话存入节点数据池中

```js
const allNodes = $node.querySelectorAll('*');
allNodes.forEach((node) => {
  // 这里获取到的textContent是原原始的没经过任何处理的节点内容，如{{count + 1}}
  const vExpression = node.textContent;
  /* exprMatched：{
      0: "{{ count + 1 }}"
      1: " count + 1 "
      groups: undefined
      index: 0
      input: "{{ count + 1 }}"
    }
    */
  const exprMatched = vExpression.match(regExpr);
  // 如果有双括号语法
  if (exprMatched) {
    const poolInfo = checkExpressionHasData($data, exprMatched[1].trim());
    // 把节点存入节点数据池
    poolInfo && exprPool.set(node, poolInfo);
  }
});

function checkExpressionHasData(data, expression) {
  for (let key in data) {
    if (expression.includes(key) && expression !== key) {
      // count + 1,返回{key:count,expression:count+1}
      return {
        key,
        expression,
      };
    } else if (expression === key) {
      // count,返回{key:count,expression:count}
      return {
        key,
        expression: key,
      };
    } else {
      return null;
    }
  }
}
```

### 初始化事件池

处理完双括号语法，我们还需要处理`@click`这样的事件语法,首先，我们创建一个事件池,再定义两个正则分别匹配函数

```js
const eventPool = new Map();

// 匹配函数名
const regStringFn = /(.+?)\((.+?)\)/;
// 匹配函数参数
const regString = /\'(.+?)\'/;
```

同样的，我们也需要遍历所有节点

```js
const allNodes = $node.querySelectorAll('*');

allNodes.forEach((node) => {
  const vClickVal = node.getAttribute(`@click`);
  if (vClickVal) {
    /* 
      比如@click='plus(1)',解析完成的fnInfo就是
      fnInfo:{
        args: [1]
        methodName: "plus"
      }
      */
    const fnInfo = checkFunctionHasArgs(vClickVal);
    const handler = fnInfo
      ? //有参函数传入args
        methods[fnInfo.methodName].bind(vm, ...fnInfo.args)
      : //无参函数直接绑定
        methods[vClickVal].bind(vm);

    //存入事件池，节点为key,事件为value
    eventPool.set(node, {
      type: vClick,
      handler,
    });
    //删除dom上的attr，不然浏览器查看源代码就会显示自定义事件  这样不好
    node.removeAttribute(`@${vClick}`);
  }
});

function checkFunctionHasArgs(str) {
  const matched = str.match(regStringFn);

  if (matched) {
    const argArr = matched[2].split(',');
    const args = checkIsString(matched[2])
      ? argArr // ['1']
      : argArr.map((item) => Number(item));

    return {
      methodName: matched[1],
      args,
    };
  }
}
function checkIsString(str) {
  return str.match(regString);
}
```

这样，我们有拥有了节点数据池和事件池,接下来我们就要拿节点数据池和事件池做操作了

### 绑定事件处理
