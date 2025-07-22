# terminal - Personal Homepage Terminal
> simulating a terminal as my homepage  
> available at [noel-friedrich.de/terminal](https://noel-friedrich.de/terminal/)  

[![Screenshot of Website](https://raw.githubusercontent.com/noel-friedrich/terminal/main/res/img/screenshots/readme-screenshot.png)](https://noel-friedrich.de/terminal/)

## Table of contents
* [Introduction](#introduction)
  * [fun stuff to try](#fun-stuff-to-try)
* [Contributing](#contributing)
* [Commands](#commands)
* [Status](#status)

## Introduction

The page is build to work like a Unix-Terminal, including:
* 214 commands such as `ls`, `cd` and of course `cowsay`
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
| `apc-sim` | play an animation relating to an apc problem |
| `asteroids` | simulate a bunch of balls jumping around |
| `avoida` | play a game of avoida |
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
| `changes` | see latest changes to the terminal |
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
| `config` | manage the terminal configuration |
| `construct` | animate the construction of a given number (using ruler and compass only) |
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
| `echonum` | echo a given number |
| `edit` | edit a file |
| `enigma` | Simulate an Enigma machine |
| `error404` | Display a 404 error |
| `eval` | evaluate javascript code |
| `exit` | exit the terminal |
| `f` | calculate friendship score with a friend |
| `f-optimize` | finds a good nonce value for the friendship score generator |
| `factor` | print the prime factors of a number |
| `fakechat` | fake a whatsapp chat conversation |
| `fibo` | Prints the Fibonacci sequence |
| `fizzbuzz` | print the fizzbuzz sequence |
| `flaci-to-turing` | Converts a flaci.com JSON File of a turing machine to a turing machine file |
| `flappy` | play a game of flappy turtlo |
| `font` | change the font of the terminal |
| `foreground` | change the foreground color of the terminal |
| `fraction` | find a fraction from a decimal number |
| `freq` | play a frequency for an amount of time |
| `games` | shows the game menu |
| `get` | get a value from the server |
| `greed` | play a game of greed |
| `grep` | search for a pattern in a file |
| `gui` | open the GUI page for a given command |
| `hangman` | play a game of hangman |
| `head` | display the first lines of a file |
| `helloworld` | display the hello-world text |
| `help` | shows this help menu |
| `hi` | say hello to the terminal |
| `highscore-admin` | Highscore Admin Management |
| `highscore-remove` | Remove a highscore |
| `highscores` | Show global highscores for a game |
| `history` | print the command history |
| `hr` | create a hr code |
| `hr-draw` | turn drawings into bitmaps |
| `href` | open a link in another tab |
| `hyp-lines` | spawn a simulation of the hyperbolic disk and half-plane model |
| `image-crop` | start image cropper program |
| `img2ascii` | Convert an image to ASCII art |
| `img2pdf` | convert image files to pdf |
| `imgwarp` | warp an image using a geometric step-distance function |
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
| `matdet` | find the determinant of a matrix |
| `mateig` | find the eigenvalues and eigenspaces of a given matrix |
| `matinv` | find the inverse of a matrix |
| `matmin` | find the matrix of minors of a given matrix |
| `matmul` | multiply two matrices with each other |
| `matred` | reduce a given matrix to reduced row echelon form |
| `matvisualize` | visualize a given 2x2 matrix transformation |
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
| `np` | start a noelpy interpreter for calculations |
| `nsolve` | solve an equation using the newton-raphson method |
| `number-guess` | guess a random number |
| `old-edit` | edit a file of the current directory (old version of editor) |
| `panik` | [german command] m��ige hilfe bei einer panikattacke |
| `particle` | start a particle simulation |
| `pascal` | print a pascal triangle |
| `password` | Generate a random password |
| `pendulum` | start a pendulum wave simulation |
| `perilious-path` | play perilous path |
| `physics` | start a physics simulation |
| `pi` | calculate pi to the n-th digit |
| `pi-blocks` | simulate the bouncy blocks from 3b1b |
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
| `rndm` | generate a random number based on the current time |
| `say` | Say something |
| `sc` | manage the startup commands |
| `scarpet` | draws the Sierpinski carpet using the chaos game |
| `search` | search something via google.com |
| `session` | manage a filesystem session |
| `set` | set a value on the server |
| `sha256` | calculate the SHA-256 hash of a message |
| `shi` | calculate your SHI (stability height index) |
| `shoot` | Play a game of Shoot against another player locally |
| `shutdown` | shutdown the terminal |
| `simulate` | Run a simulation. Doesn't work well on phones |
| `sl` | Steam Locomotive |
| `sleep` | sleep for a number of seconds |
| `slime` | Start a slime simulation |
| `snake` | play a game of snake |
| `sodoku` | Solve or generate a sodoku puzzle |
| `solve` | solve a mathematical equation for x |
| `sorting` | display a sorting algorithm |
| `sounds` | make sounds |
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
| `todo` | show and manage a todo list |
| `touch` | create a file in the current directory |
| `turing` | run a turing machine file |
| `turtlo` | spawn turtlo |
| `type-test` | test your typing speed |
| `uname` | print the operating system name |
| `unit` | convert numbers between units |
| `upload` | upload a file from your computer |
| `vigenere` | encrypt/decrypt a message using the vigenere cipher |
| `visits` | Shows the number of page visits |
| `voronoi` | create voronoi diagrams interactively |
| `w` | print the current time elapsed |
| `water` | compute solutions to the longest water problem |
| `watti` | manage the walk to trinity database |
| `wave` | play with a wave |
| `wc` | display word and line count of file |
| `weather` | Get the current weather |
| `whatday` | get the weekday of a date |
| `whatis` | display a short description of a command |
| `whoami` | get client info |
| `wurzle-stats` | show usage stats about wurzle (recmaths.ch/wurzle) |
| `yes` | print a message repeatedly |
| `zip` | zip a file |

## Status
Project is _IN PROGRESS_