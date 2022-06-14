import { getFirstChildNode } from "./shared/utils";
import reactive from './reactive';
import pools from "./pools";
import event from './event';
import { render } from './render';

const Vue = {
  createApp
}

function createApp(component) {
  console.log('component', component);
  const vm = {};
  const {
    template,
    methods,
    data
  } = component;

  vm.mount = mount;
  vm.$node = createNode(template);

  const init = () => {
    reactive(vm, data);
    pools(vm, methods);
    event(vm);
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