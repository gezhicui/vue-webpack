const regStringFn = /(.+?)\((.+?)\)/;
const regString = /\'(.+?)\'/;

export function getFirstChildNode (node) {
  const childNodes = node.childNodes;
  
  for (let i = 0; i < childNodes.length; i ++) {
    if (childNodes[i].nodeType === 1) {
      return childNodes[i];
    }
  }
}

export function checkExpressionHasData (data, expression) {
  for (let key in data) {
    if (expression.includes(key) && expression !== key) {
      return {
        key,
        expression
      }
    } else if (expression === key) {
      return {
        key,
        expression: key
      }
    } else {
      return null;
    }
  }
}

export function checkFunctionHasArgs (str) {
  const matched = str.match(regStringFn);

  if (matched) {
    const argArr = matched[2].split(',')
    const args = checkIsString(matched[2])
               ? argArr // ['1']
               : argArr.map(item => Number(item));
    
    return {
      methodName: matched[1],
      args
    }
  }
}

export function checkIsString (str) {
  return str.match(regString);
}