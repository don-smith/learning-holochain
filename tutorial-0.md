# A Holochain Developer Tutorial

[![hackmd-github-sync-badge](https://hackmd.io/S1wY2vU2RKy8GhWyMBXGmg/badge)](https://hackmd.io/S1wY2vU2RKy8GhWyMBXGmg)

This tutorial intends to be a step-by-step walk-through of building a Holochain application (hApp). The app's features are chosen specifically to highlight capabilities of the Holochain platform and are implemented in an order that should build on previous concepts.

This tutorial doesn't expect any prior knowledge of Holochain or the Rust language. It will explain concepts and provide links to learn more as they arrive on our journey. However, it does assume you are a professional developer, competent in at least one language/platform.

This tutorial is written with the expectation you are following along with it. If you are only interested in doing the hands-on parts and aren't interested in a deeper understanding of the concepts, just follow the instructions. All additional concepts and explanations will be clearly marked.

> This tutorial is maintained on [GitHub](https://github.com/don-smith/learning-holochain) (along with the code) and available for easy reading and collaboration on [HackMD](https://hackmd.io/@donsmith/a-holochain-dev-tutorial). If you have any questions or improvement recommendations, [please leave a comment](https://hackmd.io/@donsmith/a-holochain-dev-tutorial), rather than creating an issue on GitHub.

**[Part 1: A thin layer from front to back](https://hackmd.io/rNCiNe_zQ7aT3oKEl8UCqQ)**
This section is basically the _fullstack_ "Hello World" example. It has you build a function in a zome, package it into DNA, bundle the DNA into a hApp, make it available from a local conductor and invoke it from a simple web frontend.

**[Part 2: Sending and receiving data](https://hackmd.io/6XqdY1-bTCS4usegLjoWCg)**
This section builds on the previous part and allows the frontend to send/receive data to/from our zome function. We will also save entries on the source chain.
