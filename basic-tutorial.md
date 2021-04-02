# A basic Holochain dev tutorial

This tutorial exists for 2 reasons:

* To solidify the understanding of these concepts for the author (me).
* To provide a path that might help others on this learning journey. 

The plan is to explain _some_ concepts when we bump up against them, but I'll provide links to learn more about _other_ concepts. I probably won't be consistent - and I'll most likely refactor some topics/steps into other documents as I move through the completion of this thing.

## Where we're going

We will be building a complete Holochain app that includes testing and a user interface. We'll start with a simple zome, add the smallest test we can write, and call the zome from a simple web client.

Once we have something simple that operates across the full stack, we'll add more complexity by adding more features to the app.

As far as _what we're building_ ... I haven't decided yet. We're just going to start. Perhaps we'll identify the path we're on once we start walking.

## Setup

1. Install the Nix package manager

    - Follow the installation instructions for your operating system using these links: [MacOS](https://developer.holochain.org/docs/install/#macos), [Windows](https://developer.holochain.org/docs/install/#windows) and [Linux](https://developer.holochain.org/docs/install/#linux).
    - **DO NOT** follow the instructions for _Installing the Holochain dev tools_, which is the section just after installation in the links above. This tutorial will follow a more recent approach to this part of the setup.

1. Create a folder to build this tutorial in. Optionally make it a git repo.
1. Create additional folders. Make them look like this:

    ```
    . # tutorial
    ├── hc
    │   ├── tests
    │   │   └── src
    │   ├── workdir
    │   │   ├── dna
    │   │   └── happ
    │   └── zomes
    │       └── hello
    │           └── src
    ├── ui
    ```
    If it's easier, feel free to use this:
    
    `mkdir -p hc/tests/src hc/workdir/{dna,happ} hc/zomes/hello/src ui`

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

This might take a while, so let's write some code while we wait. It's fine to open another terminal window in the same folder, open your code editor, create files, etc. while we wait.

## Building the first zome

We're going to take real small baby steps to start off. Our first zome will contain a single function, named `hello`, that has no input parameters and returns a static string.

1. Create `hc/zomes/hello/src/lib.rs` with these contents:

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

1. Create `hc/zomes/hello/Cargo.toml` with these contents:

    ```toml=
    [package]
    name = "hello"
    version = "0.0.1"
    authors = [ "[your name]", "[your email address]" ]
    edition = "2018"

    [lib]
    name = "hello"
    crate-type = [ "cdylib", "rlib" ]

    [dependencies]
    hdk = "0.0.100"
    serde = "1"
    ```
    
    This file defines the metadata for our `hello` zome.

1. Create another `Cargo.toml` file with these contents:

    ```toml=
    [workspace]
    members = [
      "zomes/hello",
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