# Overview

The problem that `nanoctx` aims to solve is somewhat specific to microfrontend (MFE) architectures,
i.e. architectures where pages (or *documents*) are composed of multiple MFEs, as opposed to having been built by a single monolithic app.

Here, an MFE is an isolated UI app that has its own lifecycle and *private state*.
The latter implies that MFE A cannot read MFE B's state directly (and vice versa).
MFEs obtain their state from:
1. Fetching data from external sources (e.g. backend services, client storage, etc.)
1. Communicating via events (e.g. event buses)
1. Communicating via unidirectional data flow (e.g. "props")

While this approach brings certain benefits (discussing which is outside of the scope of this document),
it also introduces multiple challenges, but we're only going to focus on one of them: sharing common state.

Common state?
While it's true that states of different MFEs should generally not overlap (otherwise the decomposition is probably incorrect),
there are still certain things that can be thought of as "cross-cutting concerns".

For example, the user object, for the user who's logged in.
While only one MFE should be solely responsible for obtaining it, many other MFEs may need to have read-only access to it for various purposes.

So how can every MFE have access to this object then?
The most straightforward and naive approach is of course to just pass it all the way down manually, through all layers and components.
In practice, this kind of approach quickly becomes very hard to maintain, so it doesn't scale.
This problem is what is known as "prop drilling" (React term), and the generally accepted solution to it is something called a "context".

A context has the following key properties:
1. It provides a value, which can be anything
1. It "wraps" a tree of components (DOM nodes) and each one can consume the value directly without any intermediaries, regardless of its position
1. It is reactive - when a new value is provided, all consumers will be notified
1. It can be "shadowed" - it's possible to have nested contexts, and a consumer will attach to the one that is the closest ancestor

With that, `nanoctx` can be thought of as a framework/library-agnostic, extremely lightweight implementation of a global context,
intended for sharing certain kinds of data between MFEs.

## Key assumptions

The library was built with the following assumptions in mind.
If at least one of them is not true in your use case, you're likely looking at a wrong tool for the job.

TODO

## Important things that are not assumed

TODO
