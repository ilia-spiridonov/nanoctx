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
            let node = container.parentNode;
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

/**
 * Get merged data from all ancestral containers.
 *
 * Note that `get(container)` will NOT return data that was provided to `container` itself.
 * This allows "shadowing" ancestral key-value pairs - providing the same keys, but new (extended) values.
 *
 * When multiple containers provide the same key, the closest one to `container` always wins.
 *
 * Shadow DOM is supported - `get()` will "jump" from ShadowRoot nodes to their host elements.
 */
export const get: Impl['get'] = (container) => getImpl().get(container);

/**
 * Provide data to a container.
 *
 * When providing, new `data` always replaces the old one (if any), it will NOT be merged.
 *
 * There's no "unprovide" function - but you can do `provide(container, {})` to achieve the desired effect.
 *
 * The reference to the container is held weakly, so the container should get garbage-collected as expected when unmounted.
 */
export const provide: Impl['provide'] = (container, data) => getImpl().provide(container, data);

/**
 * Subscribe to all data changes.
 *
 * The provided `callback` will always be called when `provide()` is called anywhere in the window.
 * There will NOT be any attempts to compare previous and current data and skip unnecessary updates.
 *
 * Inside `callback`, it is safe to immediately call `get()` to obtain the latest data.
 *
 * Returns an "unsubscribe" function. Call it to clean up the subscription.
 */
export const subscribe: Impl['subscribe'] = (callback) => getImpl().subscribe(callback);
