const regTemplate = /\<template\>(.+?)\<\/template\>/;
const regScript = /\<script\>(.+?)\<\/script\>/;
const regFirstSign = /({)/;
const regEnter = /[\r\n]/g;

module.exports = function (source) {
  const _source = source.replace(regEnter, '');
  const template = _source.match(regTemplate)[1];
  const script = _source.match(regScript)[1];
  const finalScript = script.replace(regFirstSign, '$1 template:' + '`' + template + '`' + ',')
  /* 
  finalScript结果为：
  export default {
    template:
     `<div>  
       <h1>{{ count + 1 }}</h1>  
        <h1>{{ count + 2 }}</h1>   
        <button @click="plus(1)">+</button>  
        <button @click="minus(2)">-</button>  
        <button @click="add100">ADD 100</button>
      </div>`,
    name: 'App',
    data() {
      return { count: 0 }
    },
    methods: {
      plus(num) { this.count += num; },
      minus(num) { this.count -= num; },
      add100() { this.count += 100; }
    }
  }
  */
  return finalScript;
}