import { setAttribute, render } from './render';
import Component from './component';

const patch = (dom, vdom, parent=dom.parentNode) => {
    // 如果当前dom存在父元素，就调用父元素的replaceChild方法进行更新,没有就返回新的dom
    const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);

    if (typeof vdom === 'object' && typeof vdom.type == 'function') { // 如果虚拟dom是个组件，就调用组件的patch方法
        return Component.patch(dom, vdom, parent);
    } else if (typeof vdom !== 'object' && dom instanceof Text) { // 虚拟DOM和文本节点对比
        return dom.textContent != vdom ? replace(render(dom)) : dom; // 如果文字内容变了就返回新的内容的dom，否则不变
    } else if (typeof vdom == 'object' && dom instanceof Text) { // 如果虚拟dom不是简单类型而dom是文本节点
        return replace(render(dom)); // 重新渲染当前节点
    } else if (typeof vdom == 'object' && dom.nodeName != vdom.type.toUpperCase()) { // 如果dom节点的name变了，重新渲染
        return replace(render(vdom));
    } else if (typeof vdom == 'object' && dom.nodeName == vdom.type.toUpperCase()) { // 如果dom节点类型没变
        const pool = {};
        const active = document.activeElement;
        for (const index in Array.from(dom.childNodes)) {  // 获取每个子节点
            const child = dom.childNodes[index];
            const key = child.__key || index;
            pool[key] = child; // 在池中根据key存储child
        }
        const vchildren = [].concat(...vdom.children); // 获取虚拟dom的children
        for (const index in vchildren) {
            const child = vchildren[index];
            const key = child.props && child.props.key || index; // 获取虚拟dom的props上的key
            dom.appendChild(pool[key] ? patch(pool[key], child) : render(child)); // 如果根据key能找到缓存的dom，就递归对比缓存dom与虚拟dom，否则重新渲染该节点
            delete pool[key]; // 从池中取出
        }
        for (const key in pool) {
            if (pool[key].__instance) { // 如果child是一个组件实例, 执行该实例的componentWillUnmount方法
                pool[key].__instance.componentWillUnMount();
            }
            pool[key].remove(); // ???remove方法哪里来的
        }

        // 重新添加props
        for (const attr of dom.attributes) dom.removeAttribute(attr.name);
        for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
        active.focus();

        return dom;
    }
}

export default patch;
