import patch from './patch';
import { render } from './render';

class Component {
    constructor(props) {
        this.props = props || {};
        this.state = null;
    }

    static render(vdom, parent=null) {

        // 将虚拟dom的props和children合在一起
        const props = Object.assign({}, vdom.props, { children: vdom.children });

        // 如果虚拟dom的类型是组件
        if (Component.isPrototypeOf(vdom.type)) {
            const instance = new (vdom.type)(props); // 获得组件实例
            instance.componentWillMount(); // 执行willmount方法

            instacne.base = render(instance.render(), parent); // 初次渲染
            instance.base.__instance = instacne;
            instance.base.__key = vdom.props.key;
            instance.componentDidMount();
        }
    }

    static patch(dom, vdom, parent=dom.parentNode) {
        const props = Object.assign({}, vdom.props, { children: vdom.children});

        if (dom.__instacne && dom.__instance.constructor === vdom.type) {
            dom.__instance.componentWillReceiveProps(props);
            dom.__instance.props = props;

            return patch (dom, dom.__instacne.render(), parent);
        } else if (Component.isPrototypeOf(vdom.type)) {
            const ndom = Component.render(vdom);

            return parent ? (parent.replaceChild(ndom, dom) && ndom) : ndom;
        } else if (!Component.isPrototypeOf(vdom.type)) {
            return patch(dom, vdom.type(props), parent);
        }
    }

    setState(nextState) {
        if (this.base && this.shouldComponentUpdate(this.props, nextState)) {
            const prevState = this.state;
            this.componentWillUpdate(this.props, nextState);

            this.state = nextState;
            patch(this.base, this.render());
            this.componentDidUpdate(this.props. preState);
        } else {
            this.state = nextState;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps != this.props || nextState != this.state;
    }

    componentWillReceiveProps(nextProps) {
        return undefined;
    }

    componentWillUpdate(nextProps, nextState) {
        return undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        return undefined;
    }

    componentWillMount() {
        return undefined;
    }

    componentDidMount() {
        return undefined;
    }

    componentWillUnmount() {
        return undefined;
    }
}
