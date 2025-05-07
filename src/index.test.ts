import { describe, expect, test } from 'vitest';
import { get } from '.';

describe('get', () => {
    test('nothing is provided', () => {
        const el = document.createElement('div');

        expect(get(el)).toStrictEqual({});
    });
});
