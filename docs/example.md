# Example

(This document assumes that you have read [Overview](overview.md).)

First, I suggest reading the source code, which is under 100 lines in total,
and especially the comment blocks for the exported `get`, `provide`, and `subscribe` functions.

After that, let's go through the workflow step by step.

## Step 1. Provide data

Let's assume `const container: Element = ...` and that it refers to an element that wraps/contains the render of MFE A.

Then:
```ts
import { provide } from '@ilia-spiridonov/nanoctx';

const data = { appEnv: 'production' };

provide(container, data);
```

This associates `data` with the `container` element for its lifetime.
If any other data was previously associated, it will be entirely overwritten, not merged with.

The associated data will be available to all descendants of `container` in the DOM tree via `get()` (see below) for
as long as it's not overwritten.

## Step 2. Get the data

TODO

## Step 3. Subscribe to data updates

If/when an ancestor calls `provide` again with different data, descendants may end up with stale values.

To solve this, nanoctx offers `subscribe(callback)`, where `callback` will
be called *every time* `provide` is called, even if that update concerns an entirely different subtree or contains no new data.

The key assumption here is that *context data rarely changes* - it usually stays the same for the lifetime of the document,
or changes very infrequently (e.g. once in a few minutes).
Therefore, no fancy optimized reactivity system is needed, and the code can stay very short and simple.

Here's a code example:
```ts
import { get, subscribe } from '@ilia-spiridonov/nanoctx';

const unsubscribe = subscribe(() => {
    console.log(get(container)); // Will print the up-to-date value
});

// When unmounting...
unsubscribe();
```
