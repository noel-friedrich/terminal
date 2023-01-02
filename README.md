# terminal - Personal Homepage Terminal
> simulating a terminal as my homepage  
> available at [noel-friedrich.de/terminal](https://noel-friedrich.de/terminal/)  

[![Screenshot of Website](https://raw.githubusercontent.com/noel-friedrich/terminal/main/res/img/screenshots/website-screenshot.png)](https://noel-friedrich.de/terminal/)

## Table of contents
* [Introduction](#introduction)
  * [fun stuff to try](#fun-stuff-to-try)
* [Commands](#commands)
* [Status](#status)

## Introduction

The page is build to work like a Unix-Terminal, including:
* 141 commands such as `ls`, `cd` and of course `cowsay`
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

## Commands

You may execute a command by simply typing it into the terminal and pressing `Enter`  
The following list can also be viewed using the `whatis *` command

| Command      | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `python` | run a script or open a python shell |
| `binompdf` | calculate binomial distribution value |
| `greed` | play a game of greed |
| `upload` | upload a file from your computer |
| `password` | Generate a random password |
| `pong` | play a game of pong against the computer |
| `slime` | Start a slime simulation |
| `mkdir` | create a new directory |
| `joke` | tell a joke |
| `fakechat` | fake a whatsapp chat conversation |
| `physics` | start a physics simulation |
| `cmdnotfound` | display that a command was not found |
| `ncr` | calculate binomial distribution value |
| `wave` | play with a wave |
| `fizzbuzz` | print the fizzbuzz sequence |
| `grep` | search for a pattern in a file |
| `tictactoe` | play a game of tic tac toe against the computer. |
| `pendulum` | start a pendulum wave simulation |
| `loadall` | preload all possible commands |
| `whatis` | display a short description of a command |
| `rmdir` | remove a directory |
| `bc` | start a bc (basic calculator) session |
| `hugehugeturtlo` | spawn huge turtlo |
| `eval` | evaluate javascript code |
| `head` | display the first lines of a file |
| `cw` | get the calendar week of a date |
| `whatday` | get the weekday of a date |
| `brainfuck` | parse given brainfuck code |
| `clock` | display a clock |
| `color-test` | test the color capabilities of the terminal |
| `pascal` | print a pascal triangle |
| `base64` | encode/decode a message using base64 |
| `mv` | move a file |
| `img2ascii` | Convert an image to ASCII art |
| `helloworld` | display the hello-world text |
| `touch` | create a file in the current directory |
| `hi` | say hello to the terminal |
| `reboot` | reboot the website |
| `highscores` | Show global highscores for a game |
| `pwd` | print the current working directory |
| `rm` | remove a file |
| `chess` | play a game of chess against the computer |
| `turtlo` | spawn turtlo |
| `binomcdf` | calculate the binomial cumulative distribution function |
| `factor` | print the prime factors of a number |
| `sha256` | calculate the SHA-256 hash of a message |
| `kill` | kill a process |
| `help` | shows this help menu |
| `du` | display disk usage of current directory |
| `vigenere` | encrypt/decrypt a message using the vigenere cipher |
| `cal` | print a calendar |
| `rndm` | generate a random number based on the current time |
| `2048` | play a game of 2048 |
| `history` | print the command history |
| `cp` | copy a file |
| `morse` | translate latin to morse or morse to latin |
| `sorting` | display a sorting algorithm |
| `cowthink` | let the cow think something |
| `number-guess` | guess a random number |
| `turing` | run a turing machine file |
| `qr` | generate a qr code |
| `exit` | exit the terminal |
| `search` | search something via google.com |
| `plotter` | plot mathematical functions |
| `f` | calculate friendship score with a friend |
| `cmatrix` | show the matrix |
| `wc` | display word and line count of file |
| `particle` | start a particle simulation |
| `highscore-remove` | Remove a highscore |
| `echo` | print a line of text |
| `donut` | display a spinning donut |
| `rate` | rate a programming language |
| `labyrinth` | play a game of labyrinth |
| `lunar-lander` | play a classic game of moon-lander |
| `lscmds` | list all available commands |
| `foreground` | change the foreground color of the terminal |
| `hugeturtlo` | spawn huge turtlo |
| `kaprekar` | display the kaprekar steps of a number |
| `type-test` | test your typing speed |
| `ls` | list all files of current directory |
| `timer` | set a timer |
| `copy` | copy the file content to the clipboard |
| `cd` | change current directory |
| `bin` | convert a number to another base |
| `letters` | prints the given text in ascii art |
| `cowsay` | let the cow say something |
| `4inarow` | play a game of Connect Four against the computer |
| `name` | set a default name for the highscore system to use |
| `tetris` | play a classic game of tetris |
| `reset` | reset the terminal |
| `highscore-admin` | Login as Admin |
| `pv` | print a message with a typing animation |
| `lsusb` | list all usb devices |
| `reload` | Reloads the terminal |
| `w` | print the current time elapsed |
| `terminal` | a terminal inside a terminal |
| `flaci-to-turing` | Converts a flaci.com JSON File of a turing machine to a turing machine file |
| `style` | change the style of the terminal |
| `cheese` | take a foto with your webcam |
| `uname` | print the operating system name |
| `sudo` | try to use sudo |
| `raycasting` | play with raycasting |
| `cardoid` | start a cardoid generator |
| `ceasar` | shift the letters of a text |
| `cat` | print file content |
| `image-crop` | start image cropper program |
| `name-gen` | start a name generator |
| `pi` | calculate pi to the n-th digit |
| `logistic-map` | draw the logistic map |
| `debug` | activate the debug mode to enable untested new features |
| `yes` | print a message repeatedly |
| `compliment` | get info about yourself |
| `games` | shows the game menu |
| `curl` | download a file from the internet |
| `code` | show the source code of a command |
| `clear` | clear the terminal |
| `alias` | create a new alias for a given function |
| `perilious-path` | play perilous path |
| `set` | set a value on the server |
| `download` | download a file |
| `collatz` | Calculate the Collatz Sequence (3x+1) for a given Number |
| `draw` | start simple drawing app |
| `background` | change the background color of the terminal |
| `mandelbrot` | draws the mandelbrot set |
| `snake` | play a game of snake |
| `plot` | plot a mathematical function within bounds |
| `reverse` | reverse a message |
| `edit` | edit a file of the current directory |
| `zip` | zip a file |
| `mill2player` | play a game of mill with a friend locally |
| `stacker` | play a stacker game |
| `solve` | solve a mathematical equation for x |
| `man` | show the manual page for a command |
| `todo` | manage a todo list |
| `lscpu` | get some helpful info about your cpu |
| `bezier` | play with bezier curves |
| `shutdown` | shutdown the terminal |
| `sleep` | sleep for a number of seconds |
| `whoami` | get client info |
| `get` | get a value from the server |
| `href` | open a link in another tab |

## Status
Project is _IN PROGRESS_