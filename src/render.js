const setAttribute = (dom, key, value) = {
    if (typeof value === 'function' && key.startWith('on')) { // 处理事件属性
        const eventType = key.slice(2).toLowerCase();
        dom.__handlers = dom.__handlers || {};
        dom.removeEventListener(eventType, dom.__handlers[eventType]);
        dom.__handlers[eventType] = value;
        dom.addEventListener(eventType, value);
    } else if (key === 'checked' || key === 'value' || key === 'className') {
        dom[key] = value;
    } else if (key === 'key') {
        dom.__key = value;
    } else if (typeof value !== 'object' && typeof value !== 'function') {
        dom.setAttribute(key, value);
    }
};

// @return 真实的dom
// react-dom的render方法，将虚拟dom转为真实dom挂载到页面中
const render = (vdom, parent=null) => {
    if (parent) parent.textContent = ''; // 清空父节点
    const mount = parent ? (el => parent.appendChild(el)) : (el => el);

    if (typeof vdom == 'string' || typeof vdom == 'number') { // 处理纯文字和数字
        return mount(document.createTextNode(vdom));
    } else if (typeof vdom === 'boolean' || typeof vdom === null) { // 处理布尔值和null
        return mount(document.createTextNode(''));
    } else if (typeof vdom === 'object' && typeof vdom.type === 'function') { // 处理组件
        return Component.render(vdom, parent);
    } else if (typeof vdom === 'object' && typeof vdom.type === 'string') { // 处理虚拟DOM
        const dom = document.createElement(vdom.type); // 根据标签类型创建dom

        for (const child of [].concat(...vdom.children)) { // append child
            dom.appendChild(render(child)); // 递归调用render
        }
        for (const prop in vdom.props) { // 添加属性
            setAttribute(dom, prop, vdom.props[prop]);
        }

        return mount(dom); // 返回添加的dom
    } else {
        throw new Error(`invalid VDOM: ${vdom}.`);
    }
};

export { render, setAttribute };
