# terminal - Personal Homepage Terminal
> simulating a terminal as my homepage  
> available at [noel-friedrich.de/terminal](https://noel-friedrich.de/terminal/)  

[![Screenshot of Website](https://raw.githubusercontent.com/noel-friedrich/terminal/main/res/img/screenshots/website-screenshot.png)](https://noel-friedrich.de/terminal/)

## Table of contents
* [Introduction](#introduction)
  * [fun stuff to try](#fun-stuff-to-try)
* [Contributing](#contributing)
* [Commands](#commands)
* [Status](#status)

## Introduction

The page is build to work like a Unix-Terminal, including:
* <TOTAL_NUMBER_COMMANDS> commands such as `ls`, `cd` and of course `cowsay`
* a file-system that you can navigate and manipulate
* TAB-Autocompletion (TABA) and Command-Validity Checking (CVC)
* multiple ways to get rickrolled
* all changes made are locally saved (using the LocalStorage API)
* very cute `turtlo` animal to keep you entertained

### fun stuff to try

* plot your favorite equation using `plot tan(2x)` (and hear them!)
* solve your favorite equation using `solve x*x=10`
* feel like a hacker using `cmatrix`
* let the cow say something using `cowsay`
* convert a picture into ascii using `img2ascii`
* set and get key-value pairs on the server using `set` and `get`
  * these values are saved globally for all users to see
* most of your favorite unix-commands should do something
* shutdown the website using `shutdown`
* see your command history using `history`
  * execute a command from your history using `!<index>`
* spawn turtlo using `turtlo` and watch it do stuff
* convert your favorite image file to another format
  1. upload the file using `upload`
  2. convert it using `convert <filename>.<old_ending> <filename>.<new_ending>`
  3. download it using `download <filename>.<new_ending>`
* play fun terminal-style games
  * list all available games using `games`
  * view highscores using `highscores <game-name>`
* generate fake whatsapp conversations using `fakechat`  

_and so much more_

## Contributing

Feel free to contribute to this project by adding new commands or improving existing ones.
For detailed instructions on how to do so, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Commands

You may execute a command by simply typing it into the terminal and pressing `Enter`  
The following list can also be viewed using the `whatis *` command

| Command      | Description                                                     |
| ------------ | --------------------------------------------------------------- |
<COMMANDS_TABLE_DATA>

## Status
Project is _IN PROGRESS_