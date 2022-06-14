import { 
  checkExpressionHasData, 
  checkFunctionHasArgs
} from './shared/utils';
import { vEvent } from './shared/propTypes';

export const eventPool = new Map();
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

const regExpr = /\{\{(.+?)\}\}/;

export default function (vm, methods) {
  const { $node, $data } = vm;

  const allNodes = $node.querySelectorAll('*');
  const { vClick } = vEvent;

  allNodes.forEach(node => {
    const vExpression = node.textContent;
    const exprMatched = vExpression.match(regExpr);
    const vClickVal = node.getAttribute(`@${vClick}`);

    if (exprMatched) {
      const poolInfo = checkExpressionHasData($data, exprMatched[1].trim());
      poolInfo && exprPool.set(node, poolInfo);
    }

    if (vClickVal) {
      const fnInfo = checkFunctionHasArgs(vClickVal);

      const handler = fnInfo ? 
                      methods[fnInfo.methodName].bind(vm, ...fnInfo.args) :
                      methods[vClickVal].bind(vm);  
      
      eventPool.set(node, {
        type: vClick,
        handler
      });
      node.removeAttribute(`@${vClick}`);
    }
  })
}