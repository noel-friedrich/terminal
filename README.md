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
* 179 commands such as `ls`, `cd` and of course `cowsay`
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
| `2048` | play a game of 2048 |
| `4inarow` | play a game of Connect Four against the computer |
| `alias` | create a new alias for a given function |
| `ant-opt` | interactive solution to the travelling salesman problem using ant colony optimization |
| `asteroids` | simulate a bunch of balls jumping around |
| `background` | change the background color of the terminal |
| `base64` | encode/decode a message using base64 |
| `bc` | start a bc (basic calculator) session |
| `bezier` | play with bezier curves |
| `bin` | convert a number to another base |
| `binomcdf` | calculate the binomial cumulative distribution function |
| `binompdf` | calculate binomial distribution value |
| `blocks` | 3d raycasting test |
| `brainfuck` | parse given brainfuck code |
| `cal` | print a calendar |
| `cardoid` | start a cardoid generator |
| `cat` | print file content |
| `cd` | change current directory |
| `ceasar` | shift the letters of a text |
| `cheese` | take a foto with your webcam |
| `chess` | play a game of chess against the computer |
| `clear` | clear the terminal |
| `clock` | display a clock |
| `cmatrix` | show the matrix |
| `cmdnotfound` | display that a command was not found |
| `code` | show the source code of a command |
| `collatz` | Calculate the Collatz Sequence (3x+1) for a given Number |
| `color-test` | test the color capabilities of the terminal |
| `compliment` | get info about yourself |
| `contact` | Open contact form |
| `copy` | copy the file content to the clipboard |
| `coville` | interactive virus simulation (in german) |
| `cowsay` | let the cow say something |
| `cowthink` | let the cow say something |
| `cp` | copy a file |
| `crossp` | calculate the cross product of 2 3d vectors |
| `curl` | download a file from the internet |
| `cw` | get the calendar week of a date |
| `debug` | activate the debug mode to enable untested new features |
| `donut` | display a spinning donut |
| `download` | download a file |
| `draw` | start simple drawing app |
| `du` | display storage of current directory |
| `easter-eggs` | open easter egg hunt |
| `echo` | print a line of text |
| `edit` | edit a file of the current directory |
| `enigma` | Simulate an Enigma machine |
| `error404` | Display a 404 error |
| `eval` | evaluate javascript code |
| `exit` | exit the terminal |
| `f` | calculate friendship score with a friend |
| `factor` | print the prime factors of a number |
| `fakechat` | fake a whatsapp chat conversation |
| `fibo` | Prints the Fibonacci sequence |
| `fizzbuzz` | print the fizzbuzz sequence |
| `flaci-to-turing` | Converts a flaci.com JSON File of a turing machine to a turing machine file |
| `flappy` | play a game of flappy turtlo |
| `font` | change the font of the terminal |
| `foreground` | change the foreground color of the terminal |
| `games` | shows the game menu |
| `get` | get a value from the server |
| `greed` | play a game of greed |
| `grep` | search for a pattern in a file |
| `hangman` | play a game of hangman |
| `head` | display the first lines of a file |
| `helloworld` | display the hello-world text |
| `help` | shows this help menu |
| `hi` | say hello to the terminal |
| `highscore-admin` | Login as Admin |
| `highscore-remove` | Remove a highscore |
| `highscores` | Show global highscores for a game |
| `history` | print the command history |
| `hr` | create a hr code |
| `hr-draw` | turn drawings into bitmaps |
| `href` | open a link in another tab |
| `image-crop` | start image cropper program |
| `img2ascii` | Convert an image to ASCII art |
| `isprime` | Check if a number is prime |
| `joke` | tell a joke |
| `kaprekar` | display the kaprekar steps of a number |
| `keyboard` | Toggle mobile mode |
| `kill` | kill a process |
| `labyrinth` | play a game of labyrinth |
| `letters` | prints the given text in ascii art |
| `live-quiz` | a simple quiz game that uses your camera as input for your answer |
| `live-rocket` | a simple avoid game that you steer using camera input |
| `logistic-map` | draw the logistic map |
| `longjump` | Play a game of longjump |
| `lorem` | generate lorem ipsum text |
| `ls` | list all files of current directory |
| `lscmds` | list all available commands |
| `lscpu` | get some helpful info about your cpu |
| `lunar-lander` | play a classic game of moon-lander |
| `man` | show the manual page for a command |
| `mandelbrot` | draws the mandelbrot set |
| `mill2player` | play a game of mill with a friend locally |
| `minesweeper` | play a game of minesweeper |
| `minigolf` | play a game of minigolf |
| `mkdir` | create a new directory |
| `morse` | translate latin to morse or morse to latin |
| `mv` | move a file |
| `name` | set a default name for the highscore system to use |
| `name-gen` | start a name generator |
| `ncr` | calculate binomial distribution value |
| `neural-car` | start a neural car simulation |
| `neural-rocket` | trains neural networks to fly rockets |
| `number-guess` | guess a random number |
| `particle` | start a particle simulation |
| `pascal` | print a pascal triangle |
| `password` | Generate a random password |
| `pendulum` | start a pendulum wave simulation |
| `perilious-path` | play perilous path |
| `physics` | start a physics simulation |
| `pi` | calculate pi to the n-th digit |
| `piano` | play a piano with your keyboard |
| `plane` | play the plane game |
| `plot` | plot a mathematical function within bounds |
| `plotter` | plot mathematical functions |
| `polyrythm` | creates a polyrythm |
| `pong` | play a game of pong against the computer |
| `primes` | generate mersenne primes |
| `pull` | pull a file from the server |
| `push` | push a file to the server |
| `pv` | print a message with a typing animation |
| `pwd` | print the current working directory |
| `python` | run a script or open a python shell |
| `qr` | generate a qr code |
| `rate` | rate a programming language |
| `raycasting` | play with raycasting |
| `reboot` | reboot the website |
| `reload` | Reloads the terminal |
| `rename` | rename a file or folder |
| `reset` | reset the terminal |
| `reverse` | reverse a message |
| `rm` | remove a file |
| `rmdir` | remove a directory |
| `rndm` | generate a random number based on the current time |
| `sc` | manage the startup commands |
| `search` | search something via google.com |
| `set` | set a value on the server |
| `sha256` | calculate the SHA-256 hash of a message |
| `shoot` | Play a game of Shoot against another player locally |
| `shutdown` | shutdown the terminal |
| `sl` | Steam Locomotive |
| `sleep` | sleep for a number of seconds |
| `slime` | Start a slime simulation |
| `snake` | play a game of snake |
| `sodoku` | Solve or generate a sodoku puzzle |
| `solve` | solve a mathematical equation for x |
| `sorting` | display a sorting algorithm |
| `spion` | Spiel Spiel Manager |
| `stacker` | play a stacker game |
| `stat` | show a statistic of a given data set |
| `style` | change the style of the terminal |
| `sudo` | try to use sudo |
| `terminal` | a terminal inside a terminal |
| `terml` | run a .terml file |
| `tetris` | play a classic game of tetris |
| `tictactoe` | play a game of tic tac toe against the computer. |
| `time` | Shows the current time. |
| `timer` | set a timer |
| `todo` | manage a todo list |
| `touch` | create a file in the current directory |
| `turing` | run a turing machine file |
| `turtlo` | spawn turtlo |
| `type-test` | test your typing speed |
| `uname` | print the operating system name |
| `upload` | upload a file from your computer |
| `vigenere` | encrypt/decrypt a message using the vigenere cipher |
| `visits` | Shows the number of page visits |
| `w` | print the current time elapsed |
| `wave` | play with a wave |
| `wc` | display word and line count of file |
| `weather` | Get the current weather |
| `whatday` | get the weekday of a date |
| `whatis` | display a short description of a command |
| `whoami` | get client info |
| `yes` | print a message repeatedly |
| `zip` | zip a file |

## Status
Project is _IN PROGRESS_