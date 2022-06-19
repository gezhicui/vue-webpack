import {
  checkExpressionHasData,
  checkFunctionHasArgs
} from './shared/utils';
import { vEvent } from './shared/propTypes';

// 事件池
export const eventPool = new Map();
// 节点数据池
export const exprPool = new Map();

/**
 * [
    {
      h1: {
        key: count,
        expression: key?
      }
    }
  ]
 * 
 * [
 *   {
 *     button: {
 *       type: click,
 *       handler: methods.plus.bind(vm, ...args);
 *     }
 *   }
 * 
 * ]
 */

// 正则获取双括号中内容
const regExpr = /\{\{(.+?)\}\}/;

export default function (vm, methods) {
  const { $node, $data } = vm;

  const allNodes = $node.querySelectorAll('*');
  const { vClick } = vEvent;
  allNodes.forEach(node => {
    // 这里获取到的textContent是原原始的没经过任何处理的节点内容，如{{count + 1}}
    const vExpression = node.textContent;
    /* 
    exprMatched：{
      0: "{{ count + 1 }}"
      1: " count + 1 "
      groups: undefined
      index: 0
      input: "{{ count + 1 }}"
    }
    */
    const exprMatched = vExpression.match(regExpr);
    //获取绑定事件内容,如plus(1)
    const vClickVal = node.getAttribute(`@${vClick}`);

    if (exprMatched) {
      /* 
      poolInfo:{
        expression: "count + 1"
        key: "count"
      }
      */
      const poolInfo = checkExpressionHasData($data, exprMatched[1].trim());
      // 把节点存入节点数据池
      poolInfo && exprPool.set(node, poolInfo);
    }

    if (vClickVal) {
      /* 
      fnInfo:{
        args: [1]
        methodName: "plus"
      }
      */
      const fnInfo = checkFunctionHasArgs(vClickVal);
      const handler = fnInfo ?
        //有参函数传入args
        methods[fnInfo.methodName].bind(vm, ...fnInfo.args) :
        //无参函数直接绑定
        methods[vClickVal].bind(vm);

      //存入事件池，节点为key,事件为value
      eventPool.set(node, {
        type: vClick,
        handler
      });
      node.removeAttribute(`@${vClick}`);
    }
  })
}