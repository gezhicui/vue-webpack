import { exprPool } from "./pools";

export function render(vm) {
  exprPool.forEach((info, node) => {
    _render(vm, node, info);
  })
}

export function update(vm, key) {
  //在节点数据池中查找哪个节点的key==当前改变的key，找到则重新render
  exprPool.forEach((info, node) => {
    if (info.key === key) {
      _render(vm, node, info);
    }
  })
}

function _render(vm, node, info) {
  //info:{key: 'count',expression 'count + 1'} 
  const { expression } = info;
  //expression是一个字符串，为了执行字符串，所以我们需要new Function
  const r = new Function('vm', 'node', `
    with (vm) {
      node.textContent = ${expression};
    }
  `);

  r(vm, node);
}

/* 
  tip: with的作用：
  改变标识符的查找优先级，优先从with指定对象的属性中查找。e.g:
  var a=1;
  var obj={
    a:2
  };
  with(obj){
    console.log(a)//2
  }
*/