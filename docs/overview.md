# Overview

## Motivation

The problem that nanoctx aims to solve is somewhat specific to microfrontend (MFE) architectures,
i.e. architectures where documents ("pages") are composed of multiple MFEs, as opposed to a single monolithic app.

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

### Approach 1

The most straightforward and naive approach is of course to just pass it all the way down manually, through all MFEs and components.
In practice, this kind of approach quickly becomes very hard to maintain, so it doesn't scale.
This problem is what is known as "prop drilling" (React term).

### Approach 2

Another approach is to just store everything inside a property on the global object (i.e. `window`).
The problem with this is that it provides no structure.
For example, if you have an Auth MFE, you would want only its descendants to "see" the user data it provides,
not just any MFEs that happen to look for that data at the right time.

### Proposed approach

Let's introduce the concept of "context", which is somewhat similar to React Contexts if you're familiar with them.

A context has the following key properties:
1. It provides a set of key-value pairs, which can be anything
1. It "wraps" a tree of MFEs/components and each one can consume values directly without any intermediaries, regardless of its position
1. It is reactive - when a new pair is provided, all consumers will be notified
1. It can be "shadowed" - it's possible to have nested contexts, and a consumer will take the value from the closest ancestral provider

With that, nanoctx can be thought of as a framework/library-agnostic, extremely lightweight implementation of a global context,
intended for hierarchical sharing of certain kinds of data between MFEs.

## Key assumptions

The library was built with the following assumptions in mind.

1. All MFEs in the document form a tree - every MFE has a parent, except for the root one
1. Every MFE has a *container* (topmost) Element that is in the DOM tree (can be inside Shadow DOM)
1. If MFE A is an ancestor of MFE B, then the container of A is reachable by walking the tree up from the container of B

Additional assumptions:
1. Context data very rarely changes, so no need to implement an efficient reactivity system

## Not assumed

The library is designed to avoid sharing/duplication/ordering issues that are common in MFE setups.
It is therefore safe to:
1. Share this library (e.g. via Module Federation, native import maps, etc.) between any number of MFEs
1. Duplicate this library arbitrarily many times (it's extremely small when minified+gzipped, so the performance hit is acceptable)
1. When an upgrade is required, only upgrade it for the MFE that always runs first in the document's lifecycle (i.e. most likely the "root" MFE)
