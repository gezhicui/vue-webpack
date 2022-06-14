import { exprPool } from "./pools";

export function render (vm) {
  exprPool.forEach((info, node) => {
    _render(vm, node, info);
  })
}

export function update (vm, key) {
  exprPool.forEach((info, node) => {
    if (info.key === key) {
      _render(vm, node, info);
    }
  })
}

function _render (vm, node, info) {
  // key: 'count'  expression 'count + 1'
  const { expression } = info;
  const r = new Function('vm', 'node', `
    with (vm) {
      node.textContent = ${ expression };
    }
  `);

  r(vm, node);
}