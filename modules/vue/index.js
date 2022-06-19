import { getFirstChildNode } from "./shared/utils";
import reactive from './reactive';
import pools from "./pools";
import event from './event';
import { render } from './render';

const Vue = {
  createApp
}

function createApp(component) {
  /*  
  这里传进来的component组件已经被解析成一个object了
  {
    data: ƒ data(),
    methods: {plus: ƒ, minus: ƒ, add100: ƒ},
    name: "App",
    template:'字符串形式的HTML内容'
  }
   */
  const vm = {};
  const {
    template,
    methods,
    data
  } = component;
  // 挂载mount方法
  vm.mount = mount;
  // 构建初始dom
  vm.$node = createNode(template);

  const init = () => {
    // 响应式数据处理
    reactive(vm, data);
    // 初始化事件池
    pools(vm, methods);
    // 绑定事件处理
    event(vm);
    // 初始节点处理
    render(vm);
  }

  init();

  return vm;
}

function createNode(template) {
  const _tempNode = document.createElement('div');
  _tempNode.innerHTML = template;
  return getFirstChildNode(_tempNode);
}

function mount(el) {
  document.querySelector(el).appendChild(this.$node);
}

export {
  createApp
}

export default Vue;