import { describe, expect, test, vi } from 'vitest';
import { get, provide, subscribe } from '.';

describe('provide & get', () => {
    test('nothing is provided', () => {
        const el = document.createElement('div');

        document.body.appendChild(el);

        expect(get(el)).toStrictEqual({});

        el.remove();
    });

    test('data is shadowed', () => {
        const el = document.createElement('div');
        const el2 = document.createElement('div');
        const el3 = document.createElement('div');
        const el4 = document.createElement('div');

        el.appendChild(el2);
        el2.appendChild(el3);
        el3.appendChild(el4);

        provide(el, { foo: 'bar', baz: 'qux' });
        provide(el3, { baz: 'quux', fred: 'thud' });

        expect(get(el4)).toStrictEqual({
            foo: 'bar',
            baz: 'quux', // <--
            fred: 'thud',
        });
    });

    test('cannot get immediately provided data', () => {
        const el = document.createElement('div');

        provide(el, { foo: 'bar' });

        expect(get(el)).toStrictEqual({});
    });

    test('traversing Shadow DOM boundaries', () => {
        const el = document.createElement('div');
        const el2 = document.createElement('div');

        const shadow = el.attachShadow({ mode: 'closed' });
        shadow.appendChild(el2);

        provide(el, { foo: 'bar' });

        expect(get(el2)).toStrictEqual({ foo: 'bar' });
    });
});

describe('subscribe', () => {
    test('subscribers get called when data is provided', () => {
        const el = document.createElement('div');
        const callback = vi.fn();
        const unsubscribe = subscribe(callback);
        provide(el, {});

        expect(callback).toHaveBeenCalledTimes(1);

        const callback2 = vi.fn();
        subscribe(callback2);
        provide(el, {}); // <--

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback2).toHaveBeenCalledTimes(1);

        unsubscribe();
        provide(el, { foo: 'bar' });

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback2).toHaveBeenCalledTimes(2);
    });

    test('subscriber can access new data immediately', () => {
        const el = document.createElement('div');
        const el2 = document.createElement('div');

        el.appendChild(el2);

        const callback = vi.fn(() => {
            expect(get(el2)).toStrictEqual({ foo: 'bar' });
        });

        subscribe(callback);
        provide(el, { foo: 'bar' });

        expect(callback).toHaveReturned();
    });
});
