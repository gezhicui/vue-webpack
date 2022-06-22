import { eventPool } from './pools';

export default function (vm) {
  //node:key  info:value
  for (let [node, info] of eventPool) {
    // type:事件类型  handler：事件处理函数
    let { type, handler } = info;
    //在vue中，是用this.function 去访问方法，所以方法要被绑定到vm上
    vm[handler.name] = handler;
    //给节点绑定事件处理函数
    node.addEventListener(type, vm[handler.name], false);
  }
}