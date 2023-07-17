# Contributing

> A guide on how to contribute to this project

## Table of contents

* [Introduction](#introduction)
* [Project Structure](#project-structure)
  * [Script Environments](#script-environments)
  * [Modules](#modules)
  * [Command Structure](#command-structure)
    * [Command Arguments](#command-arguments)
    * [Command Options](#command-options)
* [Adding a new command](#adding-a-new-command)
* [Everything else](#everything-else)

## Introduction

This project is constantly being improved and extended. While this is my
personal homepage, it is also a fun project to work on and I am happy to
accept contributions from others, especially in the form of new commands
as they are the most fun to implement! I am thankful for any contributions
and will try to review them as soon as possible.

## Project Structure

The project is built using vanilla JavaScript. The terminal is mainly
controlled from the main [`terminal.js`](./js/terminal.js) file. The commands are
located in the [`commands`](./js/commands) folder. Each command lives in a separate
file.

### Script Environments

The command files are loaded in as seperate script-tags that live in their
own isolated environment that is contained in an iframe. This is done to
prevent the commands from interfering with each other and to not pollute
the global namespace. The iframe is given some global variables that may
be used by the commands. These include:
- `terminal` - the terminal object (contained in [`terminal.js`](./js/terminal.js))
- `Color` - the Color class (contained in [`terminal.js`](./js/terminal.js))
- `TerminalParser` - the TerminalParser class (contained in [`terminal.js`](./js/terminal.js))
- `IntendedError` - the IntendedError class (contained in [`terminal.js`](./js/terminal.js))
  - This is used to throw errors that are intended to be caught by the terminal. These errors will NOT be displayed in the terminal.
- Some Utility functions:
  - `levenshteinDistance` - calculates the levenshtein distance between two strings
  - `parseColor` - parses a color string into a Color object

### Modules

Commands may load in modules to include code that is shared between commands.
Modules are found in the [`modules`](./js/modules) folder. Modules are loaded in
using the following syntax:

```js
// to load in a module and load its contents into the global namespace
await terminal.modules.import("game", window)

// to load in a module and load its contents into a variable
const game = await terminal.modules.load("game", terminal)
```

Some examples of modules are:
- [`game`](./js/modules/game.js) - a module that contains game logic and Utilities such as `Vector2d` and `Vector3d` classes
- [`window`](./js/modules/window.js) - a module that contains a `Window` class that can be used to create windows in the terminal
- [`upload`](./js/modules/upload.js) - a module with a few Utility functions to prompt the user to upload files

### Command Structure

Each command file must have the following basic layout:

```js
terminal.addCommand("<command-name>", async function(args) {
    terminal.printLine("Hello, World!")
    // more logic
}, {
    description: "<command-description>",
    author: "<command-author>",
    // other options
}
```

Because each command lives in a seperate file, you may use your own
formatting style. The File must not end with a semicolon (`;`)
because of how the build script load the command information.

#### Command Arguments

The second argument to the `terminal.addCommand` function is a function
that will be called when the command is executed. This function will be
passed an object with all the arguments that were passed to the command.
The arguments are parsed using the [`TerminalParser`](./js/terminal.js) class.

#### Command Options

The third argument to the `terminal.addCommand` function is an object
that contains options for the command. The following options are available:

- `description` - a short description of the command
- `author` - the author of the command
- `args` - an object of type `{String: String}` that contains the names and descriptions of the arguments
  - The argument name will be parsed and may thus include options:
    | Option | Description | Example |
    | --- | --- | --- |
    | `?` | The argument is optional | `?name` |
    | `*` | The argument is a list | `*name` |
    | `:b` | The argument is a boolean | `name:b` |
    | `:n` | The argument is a number | `name:n` |
    | `:i` | The argument is an integer | `name:i` |
    | `:n:x~y` | The argument is a number between `x` and `y` | `name:n:0~10` |
    | `:i:x~y` | The argument is an integer between `x` and `y` | `name:i:0~10` | 
    | `:s` | The argument is a string | `name:s` |
    - these options may be combined, e.g. `*name:s` or `?name:i:0~10`
- `defaultValues` - an object of type `{String: String}` that contains the default values for the arguments when they are not provided

### The `terminal` object

The `terminal` object is the main object that controls the terminal. It
is defined in [`terminal.js`](./js/terminal.js) and contains some useful
functions and variables that may be used by the commands. These include:
- `printLine(msg, color, opts)` - a function that prints a line to the terminal
- `print(msg, color, opts)` - a function that prints a message to the terminal
- `printError(msg, error)` - a function that prints an error message to the terminal
- `log(msg)` - a function that prints a message to the terminal log. This is used for debugging purposes
- `async createFile(fileName, fileType, data)` - a function that creates a file and returns a `File` object. `fileType` must be a constructor of a class that extends `File`, e.g. `TextFile`
- `getFile(path, fileType=undefined)` - a function that returns a `File` object for the file at `path`. If the file doesn't exist, the function throws an error.
- `async prompt(msg, options)` - a function that prompts the user for input. The function returns a promise that resolves to the user's input.

There are many more functions and variables that may be used. See [`terminal.js`](./js/terminal.js) for more information.

## Adding a new command

Follow the following steps to add a new command. Be sure to read the [Command Structure](#command-structure) section first. 

1. Create a new file in the [`commands`](./js/commands) folder
   - The file name should be the name of the command and may not contain any spaces (use dashes instead). The file name must end with `.js`. Example: `hello-world.js`  
    - **Note:** The file name must be unique. If you want to create a new version of an existing command, you must append a version number to the file name. Example: `hello-world-v2.js`

2. Add the following code to the file:
   ```js
   terminal.addCommand("<command-name>", async function(args) {
       // <command logic>
       terminal.printLine("Hello, World!")
   }, {
       description: "<command-description>",
       author: "<command-author>",
   })
   ```
    - Replace `<command-name>` with the name of the command
    - Replace `<command-description>` with a short (!) description of the command
    - Replace `<command-author>` with your name or a pseudonym
3. Run the build script using a python version of at least 3.8
    - Run the following command in the root directory of the project:
      ```bash
      python3 scripts/build.py
      ```
    - This will:
      1. Check if the command file contains any forbidden syntax
      2. Update the command list at [`load-commands.js`](./js/load-commands.js)
      3. Update the [README.md](./README.md) file to include the new command
4. Test the command by opening the [`index.html`](./index.html) file in your browser
    - You may need to clear your browser cache to see the changes
5. Commit your changes and create a pull request to this repository. Please include a short description of your changes.
6. Wait for your pull request to be reviewed and merged!
7. Feel great about yourself for contributing to this project!

## Everything else

If you have the desire to change something else about the project, feel free to do so! Please create an issue or pull request to discuss your changes before you start working on them. This will prevent you from wasting your time on something that will not be merged. 