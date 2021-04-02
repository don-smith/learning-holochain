# A basic Holochain dev tutorial

This tutorial exists for 2 reasons:

* To solidify the understanding of these concepts for the author (me).
* To provide a path that might help others on this learning journey. 

The plan is to explain _some_ concepts when we bump up against them, but I'll provide links to learn more about _other_ concepts. I probably won't be consistent - and I'll most likely refactor some topics/steps into other documents as I move through the completion of this thing.

## Where we're going

We will be building a complete Holochain app that includes testing and a user interface. We'll start with a simple zome, add the smallest test we can write, and call the zome from a simple web client.

Once we have something simple that operates across the full stack, we'll add more complexity by adding more features to the app. This will allow us to learn different aspects of Holochain as we need the functionality.

As far as _what we're building_ ... I haven't decided yet. We're just going to start. Perhaps we'll identify the path we're on once we start walking.

## Setup

1. Install the Nix package manager

    - Follow the installation instructions for your operating system using these links: [MacOS](https://developer.holochain.org/docs/install/#macos), [Windows](https://developer.holochain.org/docs/install/#windows) and [Linux](https://developer.holochain.org/docs/install/#linux).
    - **DO NOT** follow the instructions for _Installing the Holochain dev tools_, which is the section just after installation in the links above. This tutorial will follow a more recent approach to this part of the setup.

1. Create a folder to build this tutorial in. Optionally make it a git repo.
1. Ensure you have Node.js and npm installed correctly by running: `node -v; npm -v`
1. Create additional folders. Make them look like this:

    ```
    . # tutorial
    └── hc
        ├── tests
        │   └── src
        ├── workdir
        └── zomes
            └── greeter
                └── src
    ```
    If it's easier, feel free to use this:
    
    `mkdir -p hc/tests/src hc/workdir hc/zomes/greeter/src`
    
1. And just for completeness, let's drop a `.gitignore` file in the `hc` folder with these contents:

    ```
    .hc        # holochain temp folder?
    .cargo     # by-product of using Rust from a Nix shell?
    debug      # Rust build artifact
    target     # Rust build artifact
    **/*.rs.bk # rustfmt backup files
    ```
    
Now that we have our files and folders in place, let's finish setting up our development environment.

## Our development environment

In order to ensure a consistent environment, the Holochain dev environment uses Nix/NixOS. At the moment, we're using project-specific environment configurations and they exist in the form of a `default.nix` file.

Create a `default.nix` file with these contents in your tutorial folder.

```nix=
let 
  holonixPath = builtins.fetchTarball {
    url = "https://github.com/holochain/holonix/archive/90a19d5771c069dbcc9b27938009486b54b12fb7.tar.gz";
    sha256 = "11wv7mwliqj38jh1gda3gd0ad0vqz1d42hxnhjmqdp037gcd2cjg";
  };
  holonix = import (holonixPath) {
    includeHolochainBinaries = true;
    holochainVersionId = "custom";
    
    holochainVersion = { 
     rev = "d3a61446acaa64b1732bc0ead5880fbc5f8e3f31";
     sha256 = "0k1fsxg60spx65hhxqa99nkiz34w3qw2q4wspzik1vwpkhk4pwqv";
     cargoSha256 = "0fz7ymyk7g3jk4lv1zh6gbn00ad7wsyma5r7csa88myl5xd14y68";
     bins = {
       holochain = "holochain";
       hc = "hc";
     };
    };
  };
in holonix.main
```

Alternatively, you can [download this one](https://raw.githubusercontent.com/holochain/holochain-dna-build-tutorial/develop/default.nix) (they're the same).

In your terminal, navigate to your tutorial folder and open the Nix shell.

```shell
nix-shell .
```

This might take a while, so let's continue to prepare while we wait. It's fine to open another terminal window in the same folder, open your code editor, create files, etc. while we wait.

## Building the first zome

We're going to take real small baby steps to start off. Our first zome will contain a single function, named `hello`, that has no input parameters and returns a static string.

1. Create `hc/zomes/greeter/src/lib.rs` with these contents:

    ```rust=
    use hdk::prelude::*;

    #[hdk_extern]
    pub fn hello(_: ()) -> ExternResult<String> {
    Ok(String::from("Hello Holo Dev"))
    }
    ```
    
    The `use` statement on line #1 brings in the HDK.
    The `hdk_extern` attribute marks the function as available to be called by the Holochain conductor.
    The `ExternResult` type ensures we're returning a type that can be serialized back to the user interface.

1. Create `hc/zomes/greeter/Cargo.toml` with these contents:

    ```toml=
    [package]
    name = "greeter"
    version = "0.0.1"
    authors = [ "[your name]", "[your email address]" ]
    edition = "2018"

    [lib]
    name = "greeter"
    crate-type = [ "cdylib", "rlib" ]

    [dependencies]
    hdk = "0.0.100"
    serde = "1"
    ```
    
    This file defines the metadata for our `greeter` zome.

1. Create another `Cargo.toml` file with these contents:

    ```toml=
    [workspace]
    members = [
      "zomes/greeter",
    ]

    [profile.dev]
    opt-level = "z"

    [profile.release]
    opt-level = "z"
    ```
    
    This file defines all of the zomes in our project.
    
1. Hopefully our Nix shell has finished building. If not, you'll have to wait before completing this step. Let's build the zome into Web Assembly (WASM). From the `hc` folder, inside your nix-shell, run this:

    ```sh
    CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown
    ```
    
    If this succeeded, you won't see any errors, but you will have an `hc/target/wasm32-unknown-unknown/release/greeter.wasm` file.
    
1. Now let's build the DNA file

    ```sh
    hc dna init workdir/dna
    ```
    
1. Add the zome to the `zomes` array in the newly created DNA file `hc/workdir/dna/dna.yaml` so it looks like this:

    ```yaml
    ---
    manifest_version: "1"
    name: greeter
    uuid: 00000000-0000-0000-0000-000000000000
    properties: ~
    zomes:
      - name: greeter
        bundled: ../../target/wasm32-unknown-unknown/release/greeter.wasm
    ```
    
1. Package the WASM into a DNA file.

    ```sh
    hc dna pack workdir/dna
    ```
    
    This will create `hc/workdir/dna/greeter.dna`. Now we're ready to do zome testing :wink: (sorry, I couldn't resist).

## Test the first zome

We have the option of writing 2 different types of tests: unit tests written in Rust, and integration tests written in TypeScript. Writing a unit test doesn't have anything to do with Holochain - we just write them as we would any Rust code. However, our integration tests use the [Tryorama](https://github.com/holochain/tryorama) tool to create a mock environment. We'll forego writing unit tests for the time being and setup our integration testing environment instead.

1. Inside your `hc/tests` folder, let's create some new files.

    **`package.json`**

    ```json=
   {
      "name": "hello-integration-tests",
      "version": "0.0.1",
      "description": "An integration test runner using Tryorama",
      "main": "index.js",
      "scripts": {
        "test": "TRYORAMA_LOG_LEVEL=info RUST_LOG=error RUST_BACKTRACE=1 TRYORAMA_HOLOCHAIN_PATH=\"holochain\" ts-node src/index.ts"
      },
      "author": "Keen Holo Dev",
      "license": "ISC",
      "dependencies": {
        "@holochain/tryorama": "0.4.1",
        "@msgpack/msgpack": "^2.5.1",
        "@types/lodash": "^4.14.168",
        "@types/node": "^14.14.37",
        "lodash": "^4.17.21",
        "tape": "^5.2.2",
        "ts-node": "^9.1.1",
        "typescript": "^4.2.3"
      }
    } 
    ```
    
    **`tsconfig.json`**
    
    ```json=
    {
      "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "resolveJsonModule": true,
        "strict": true,
        "noImplicitAny": false,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      }
    }
    ```
    
    **`.gitignore`**
    
    ```
    node_modules/
    *.log
    ```
    
1. In preparation for our test run, from the `hc/tests` folder, install our dependencies.

    `npm install`
    
1. For our test file, let's create this `index.ts` file in our `src` folder.

    ```ts=
    import path from "path";
    import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";

    // Create a configuration for our conductor
    const conductorConfig = Config.gen();

    // Construct proper paths for your DNAs
    const dnaPath = path.join(__dirname, "../../workdir/dna/greeter.dna");

    // create an InstallAgentsHapps array with your DNAs to tell tryorama what
    // to install into the conductor.
    const installation: InstallAgentsHapps = [
      // agent 0
      [
        // happ 0
        [dnaPath],
      ],
    ];

    const orchestrator = new Orchestrator();

    orchestrator.registerScenario("holo says hello", async (s, t) => {
      const [alice] = await s.players([conductorConfig]);

      // install your happs into the coductors and destructuring the returned happ data using the same
      // array structure as you created in your installation array.
      const [[alice_common]] = await alice.installAgentsHapps(installation);

      let result = await alice_common.cells[0].call("greeter", "hello", null);
      t.equal(result, "Hello Holo Dev");
    });

    orchestrator.run();
    ```
    
1. Now, from inside our `hc/tests` folder, we can run our test with: `npm test`. Everything is passing/working if the end of our output is

    ```sh
    # tests 1
    # pass  1
    
    # ok
    ```

1. Now is a good time to make sure you can break the test in an expected way. For example, on line #30, change `"Hello Holo Dev"` to something else and re-run the test to watch it fail.

## Build some user interface

Holochain doesn't force you to use specific technologies for the user interface. You only need to use something that can send [msgpack](https://msgpack.org) messages to the Websocket endpoint the conductor is listening to. To make this easier, we'll use JavaScript so we can use the [conductor-api](https://www.npmjs.com/package/@holochain/conductor-api) package.

The user interface technology, and how to use it, is not the focus of this tutorial. So we're going to do the most basic thing we can that keeps the focus on how to interact with the Holochain conductor. To that end, we're going to use [Svelte](https://svelte.dev) and [Snowpack](https://www.snowpack.dev).

> Note: this is my first time using Svelte and Snowpack. So if you see something egregious, please let me know.

1. Let's start in our tutorial folder (not `hc`) and get a basic web app in place by running this in your terminal:

    ```
    npx create-snowpack-app ui --template @snowpack/app-template-minimal
    ```

1. Now install some necessary dependencies.

    ```
    cd ui
    npm install svelte @snowpack/plugin-svelte @holochain/conductor-api
    ```
    
    Note: we'll stay in the `ui` folder for the remainder of the UI part of the tutorial.

1. Add a `App.svelte` file:

    ```svelte=
    <script>
      let greeting = ''
      function handleClick () {
        greeting = 'Hello from Svelte'
      }
    </script>
    <div>
      <button on:click={handleClick}>Say hello</button>
      <p>Greeting: {greeting}</p>
    </div>
    ```

1. Fix up our `index.js` file:

    ```js=
    import App from "./App.svelte"

    const app = new App({
      target: document.body
    })

    export default app
    ```
    
1. Ensure we're working up to this point.

    ```
    npm start
    ```
    
    This should open your browser on [http://localhost:8080](http://localhost:8080). You should be able to see the message display when you click this button without any errors in your console.
