type Container = Element;
type Data = Record<string, unknown>;

interface Impl {
    get: (container: Container) => Data;
    provide: (container: Container, data: Data) => void;
    subscribe: (callback: () => void) => () => void;
}

const getImpl = (): Impl => {
    const key = Symbol.for('nanoctx');
    const _impl: Impl | undefined = (window as any)[key];
    if (_impl) {
        return _impl;
    }

    const providers = new WeakMap<Container, Data>();
    const events = new EventTarget();
    const eventType = 'update';

    const impl: Impl = {
        get: (container) => {
            let node = container.parentNode; // Note: `container` itself is being intentionally excluded
            const data: Data = {};

            while (node != null) {
                if (node instanceof HTMLElement && providers.has(node)) {
                    for (const [key, value] of Object.entries(providers.get(node)!)) {
                        if (!Object.hasOwn(data, key)) {
                            data[key] = value;
                        }
                    }
                }

                let parent = node.parentNode;
                if (parent == null) {
                    const root = node.getRootNode();
                    if (root instanceof ShadowRoot) {
                        parent = root.host;
                    }
                }

                node = parent;
            }

            return data;
        },

        provide: (container, data) => {
            providers.set(container, data);
            events.dispatchEvent(new CustomEvent(eventType));
        },

        subscribe: (callback) => {
            events.addEventListener(eventType, callback);

            return () => {
                events.removeEventListener(eventType, callback);
            };
        },
    };

    (window as any)[key] = impl;
    return impl;
};

// Facades

export const get: Impl['get'] = (...params) => getImpl().get(...params);
export const provide: Impl['provide'] = (...params) => getImpl().provide(...params);
export const subscribe: Impl['subscribe'] = (...params) => getImpl().subscribe(...params);
