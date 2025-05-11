# Example

(This document assumes that you have read [Overview](overview.md).)

First, I suggest reading the source code, which is under 100 lines in total,
and especially the comment blocks for the exported `get`, `provide`, and `subscribe` functions.

After that, let's go through the workflow step by step.

## Step 1. Provide data

Let's assume `const containerA: Element = ...` and that it refers to an element that wraps/contains the render of MFE A.

Then:
```ts
import { provide } from '@ilia-spiridonov/nanoctx';

const data = { appEnv: 'production', appLocale: 'sv-SE' };

provide(containerA, data);
```

This associates `data` with the `containerA` element for its lifetime.
If any other data was previously associated, it will be entirely overwritten, not merged with.

The associated data will be available to all descendants of `containerA` in the DOM tree via `get()` (see below) for
as long as it's not overwritten.

## Step 2. Get the data

Now assume that `containerC` is just like `containerA`, but for MFE C, which is a descendant of MFE A.
Also assume that there's `containerB`, for MFE B, which is somewhere between A and C (so a descendant of A, an ancestor of C)

Then:
```ts
import { get } from '@ilia-spiridonov/nanoctx';

const data = get(containerC); // { appEnv: 'production', appLocale: 'sv-SE' }
```

What happened? `get()` walked the tree up (escaping `ShadowRoot`s when needed) and aggregated data
obtained by checking for element-to-data mapping for each element into a single object.

To demonstrate this a bit better, let's provide something for MFE B:
```ts
provide(containerB, { appLocale: 'en-SE', customerId: 'acme' });

get(containerC); // { appEnv: 'production', appLocale: 'en-SE', customerId: 'acme' }
```

Pay attention to the value of `appLocale`. It's `en-SE` because MFE B is *closer* to MFE C than MFE A.
This is what's known as "shadowing".

## Step 3. Subscribe to data updates

If/when an ancestor calls `provide` again with different data, descendants may end up with stale values.

To solve this, nanoctx offers `subscribe(callback)`, where `callback` will
be called *every time* `provide` is called, even if that update concerns an entirely different subtree or contains no new data.

The key assumption here is that *context data rarely changes* - it usually stays the same for the lifetime of the document,
or changes very infrequently (e.g. once in a few minutes).
Therefore, no fancy optimized reactivity system is needed, and the code can stay very short and simple.

Then:
```ts
import { get, subscribe } from '@ilia-spiridonov/nanoctx';

const unsubscribe = subscribe(() => {
    console.log(get(container)); // Will print the up-to-date value
});

// When unmounting...
unsubscribe();
```

## Done

That's all nanoctx can do!
