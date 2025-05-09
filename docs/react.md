# React

If you need to integrate nanoctx with React, here's an example to get you started:
```ts
// in ContainerRefContext.ts

import { createContext } from 'react';

export const ContainerRefContext = createContext<Element | null>(null);

// in index.tsx

import { createRoot } from 'react-dom/client';

import { App } from './App';
import { ContainerRefContext } from './ContainerRefContext';

export default function mountMFE(container: Element) {
    const root = createRoot(container);

    return {
        render: (props: any) => {
            root.render(
                <ContainerRefContext.Provider value={container}>
                    <App {...props} />
                </ContainerRefContext.Provider>,
            );
        },

        unmount: () => {
            root.unmount();
        },
    };
}

// in useGlobalContextValue.ts

import { get, subscribe } from '@ilia-spiridonov/nanoctx';
import { useContext, useEffect, useState } from 'react';

import { ContainerRefContext } from './ContainerRefContext';
import type { Context } from './types';

export const useGlobalContextValue = <K extends keyof Context>(key: K): Context[K] => {
    const container = useContext(ContainerRefContext);
    if (container == null) {
        throw new Error();
    }

    // You may try https://react.dev/reference/react/useSyncExternalStore if you're on v18+ already

    const [value, setValue] = useState(() => (get(container) as unknown as Context)[key]);

    useEffect(() => {
        const update = () => {
            setValue((get(container) as unknown as Context)[key]);
        };

        update();

        return subscribe(update);
    }, [container, key]);

    return value;
};

// in your code elsewhere:

import { useGlobalContextValue } from './useGlobalContextValue';

const userProfile = useGlobalContextValue('userProfile');
```
