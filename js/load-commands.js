terminal.commandData = {"python": {"description": "run a script or open a python shell", "args": {"?script": "the script to run"}}, "binompdf": {"description": "calculate binomial distribution value", "args": {"n:n:0~100": "the number of trials", "p:n:0~1": "the probability of success", "k:n:0~100": "the number of successes"}}, "greed": {"description": "play a game of greed", "isGame": true, "args": {"?b": "play the bigger version"}}, "upload": {"description": "upload a file from your computer"}, "password": {"description": "Generate a random password", "args": {"?l:n:1~1000": "The length of the password", "?c": "The characters to use in the password", "?norepeat:b": "If present, the password will not repeat characters", "?n:n:1~100": "Number of passwords to generate", "?nocopy:b": "Do not copy the password to the clipboard"}, "standardVals": {"l": 20, "c": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&", "n": 1}}, "pong": {"description": "play a game of pong against the computer", "isGame": true}, "slime": {"description": "Start a slime simulation"}, "mkdir": {"description": "create a new directory", "args": ["directory_name"]}, "joke": {"description": "tell a joke"}, "fakechat": {"description": "fake a whatsapp chat conversation", "args": {"?f=fast:b": "skip typing animations [fast mode]", "?o=offset:n:-100~100": "offset the chat by a procentage of the screen height", "?s=scale:n:0.1~5": "scale the chat by a factor", "?x=width:n:100~10000": "set the width of the screen in pixels", "?y=height:n:100~10000": "set the height of the screen in pixels"}, "standardVals": {"o": 0, "s": 1, "x": 720, "y": 1560}}, "physics": {"description": "start a physics simulation"}, "cmdnotfound": {"description": "display that a command was not found", "rawArgMode": true, "isSecret": true}, "ncr": {"description": "calculate binomial distribution value", "args": {"n:n:0~100": "the number of trials", "k:n:0~100": "the number of successes"}}, "wave": {"description": "play with a wave"}, "fizzbuzz": {"description": "print the fizzbuzz sequence", "args": {"?max:n:1~100000": "the maximum number to print"}, "standardVals": {"max": 15}}, "grep": {"description": "search for a pattern in a file", "args": {"pattern": "the pattern to search for", "file": "the file to search in", "?r": "search recursively", "?i": "ignore case", "?v": "invert match", "?x": "match whole lines"}}, "tictactoe": {"description": "play a game of tic tac toe against the computer.", "isGame": true}, "pendulum": {"description": "start a pendulum wave simulation", "args": {"?n:i:1~10000": "number of pendulums", "?o:n:0~1": "offset of pendulums"}, "standardVals": {"n": 20, "o": 0.025}}, "loadall": {"description": "preload all possible commands"}, "whatis": {"description": "display a short description of a command", "args": ["command"]}, "rmdir": {"description": "remove a directory", "args": ["directory"]}, "bc": {"description": "start a bc (basic calculator) session"}, "hugehugeturtlo": {"description": "spawn huge turtlo"}, "eval": {"description": "evaluate javascript code", "rawArgMode": true}, "head": {"description": "display the first lines of a file", "args": ["file", "?l:i:1~1000"], "standardVals": {"l": 10}}, "cw": {"description": "get the calendar week of a date", "args": {"?date": "the date to get the calendar week of"}, "standardVals": {"date": null}}, "whatday": {"description": "get the weekday of a date", "args": ["DD.MM.YYYY"]}, "brainfuck": {"description": "parse given brainfuck code", "args": ["*code"]}, "clock": {"description": "display a clock", "args": {"?m": "display milliseconds"}}, "color-test": {"description": "test the color capabilities of the terminal"}, "pascal": {"description": "print a pascal triangle", "args": {"?depth:n:1~100": "the depth of the triangle", "?f": "only show the final row"}, "standardVals": {"depth": 10}}, "base64": {"description": "encode/decode a message using base64", "args": {"*message": "the message to encode/decode", "?d": "decode the message instead of encoding it"}}, "mv": {"description": "move a file", "args": ["file", "directory"]}, "img2ascii": {"description": "Convert an image to ASCII art"}, "helloworld": {"description": "display the hello-world text", "rawArgMode": true}, "touch": {"description": "create a file in the current directory", "args": {"filename": "the name of the file"}}, "hi": {"description": "say hello to the terminal"}, "reboot": {"description": "reboot the website"}, "highscores": {"description": "Show global highscores for a game", "args": {"game": "the game to show the highscores for", "?n": "only show highscores with this name", "?l:n:1~10000": "limit the number of highscores to show"}, "standardVals": {"n": null, "l": 10}}, "pwd": {"description": "print the current working directory"}, "rm": {"description": "remove a file", "args": ["file"]}, "chess": {"description": "play a game of chess against the computer", "isGame": true}, "turtlo": {"description": "spawn turtlo"}, "binomcdf": {"description": "calculate the binomial cumulative distribution function", "args": {"n:n:1~1000": "the number of trials", "p:n:0~1": "the probability of success", "lower:n:0~1000": "the lower bound", "upper:n:0~1000": "the upper bound"}}, "factor": {"description": "print the prime factors of a number", "args": {"?n:n": "number to factorize"}, "standardVals": {"n": null}}, "sha256": {"description": "calculate the SHA-256 hash of a message", "args": {"?s": "a string to hash", "?f": "a file to hash"}, "standardVals": {"s": null, "f": null}}, "kill": {"description": "kill a process", "args": {"process": "the process to kill"}}, "help": {"description": "shows this help menu"}, "du": {"description": "display disk usage of current directory", "args": {"?folder": "folder to display disk usage of"}}, "vigenere": {"description": "encrypt/decrypt a message using the vigenere cipher", "args": {"message": "the message to encrypt/decrypt", "key": "the key to use", "?d": "decrypt the message instead of encrypting it"}}, "cal": {"description": "print a calendar", "args": {"?month": "the month to print", "?year": "the year to print"}}, "rndm": {"description": "generate a random number based on the current time", "args": {"?min:n:0~100000": "minimum value (inclusive)", "?max:n:0~100000": "maximum value (inclusive)"}, "standardVals": {"min": 1, "max": 100}}, "2048": {"description": "play a game of 2048", "isGame": true}, "history": {"description": "print the command history", "args": {"?l=limit:n:1~100000": "the maximum number of commands to print"}, "standardVals": {"l": 1000}}, "cp": {"description": "copy a file", "args": ["file", "directory"]}, "morse": {"description": "translate latin to morse or morse to latin", "args": {"*text": "text to translate"}}, "sorting": {"description": "display a sorting algorithm", "args": {"?algorithm": "the algorithm to display", "?n:n:10~1000": "the number of elements to sort", "?speed:n:0~100": "the speed of the sorting algorithm", "?s": "silent mode (deactivate sound)"}, "standardVals": {"algorithm": null, "n": 20, "speed": 1}}, "cowthink": {"description": "let the cow think something", "args": ["*message"]}, "number-guess": {"description": "guess a random number", "isGame": true}, "turing": {"description": "run a turing machine file", "args": {"file": "file to run", "?t=startTape": "starting tape content", "?s=sleep:i:0~10000": "sleep time between steps (in ms)", "?d=startingState": "starting state", "?m=maxSteps:i:0~9999999999": "maximum number of steps to run", "?turbo:b": "run as fast as possible"}, "standardVals": {"startTape": "", "s": 100, "d": "0", "m": 100000}}, "qr": {"description": "generate a qr code", "args": {"*text": "the text to encode"}}, "exit": {"description": "exit the terminal"}, "search": {"description": "search something via google.com", "args": {"*query": "the search query", "?b": "the base search-engine url"}, "standardVals": {"b": "https://www.google.com/search?q="}}, "plotter": {"description": "plot mathematical functions"}, "f": {"description": "calculate friendship score with a friend", "args": ["friend"]}, "cmatrix": {"description": "show the matrix"}, "wc": {"description": "display word and line count of file", "args": {"?f=file": "file to open", "?s": "string to count instead of file"}}, "particle": {"description": "start a particle simulation", "args": {"?n:i:1000~10000000": "number of particles"}, "standardVals": {"n": 100000}}, "highscore-remove": {"description": "Remove a highscore", "isSecret": true, "args": {"game": "the game to remove the highscore from", "?n": "only show highscores with this name", "?l:n:1~10000": "limit the number of highscores to show", "?uid": "the uid of the highscore to remove"}, "standardVals": {"n": null, "l": Infinity}}, "echo": {"description": "print a line of text", "rawArgMode": true}, "donut": {"description": "display a spinning donut"}, "rate": {"description": "rate a programming language", "args": ["language"]}, "labyrinth": {"description": "play a game of labyrinth", "isGame": true, "args": {"?fps:n:1~60": "the frames per second of the game"}, "standardVals": {"fps": 30}}, "lunar-lander": {"description": "play a classic game of moon-lander", "args": {"?particles:n:1~1000": "number of particles to generate"}, "standardVals": {"particles": 10}, "isGame": true}, "lscmds": {"description": "list all available commands", "helpVisible": true, "args": {"?m:b": "format output as markdown table"}}, "foreground": {"description": "change the foreground color of the terminal", "args": {"color": "the color to change the foreground to"}}, "hugeturtlo": {"description": "spawn huge turtlo"}, "kaprekar": {"description": "display the kaprekar steps of a number", "args": {"n:n:1~999999999": "the number to display the kaprekar steps of"}}, "type-test": {"description": "test your typing speed", "isGame": true}, "ls": {"helpVisible": true, "description": "list all files of current directory", "args": {"?folder:f": "folder to list", "?r:b": "list recursively"}, "standardVals": {"folder": ""}}, "timer": {"description": "set a timer", "rawArgMode": true}, "copy": {"description": "copy the file content to the clipboard", "args": {"file": "the file to copy the content of"}}, "cd": {"helpVisible": true, "args": {"directory": "the directory relative to your current path"}, "description": "change current directory"}, "bin": {"description": "convert a number to another base", "args": {"n": "number to convert", "?t:i:2~36": "base to convert to", "?f:i:2~36": "base to convert from"}, "standardVals": {"t": 2, "f": 10}}, "letters": {"description": "prints the given text in ascii art", "args": {"*text": "the text to print"}}, "cowsay": {"description": "let the cow say something", "args": ["*message"]}, "4inarow": {"description": "play a game of Connect Four against the computer", "args": {"?depth": "The depth of the search tree"}, "standardVals": {"depth": 4}, "isGame": true}, "name": {"description": "set a default name for the highscore system to use", "args": {"method": "set | get | reset", "?newname": "the new name"}}, "tetris": {"description": "play a classic game of tetris", "isGame": true}, "reset": {"description": "reset the terminal"}, "highscore-admin": {"description": "Login as Admin", "isSecret": true, "args": {"?d": "Delete password from local storage"}}, "pv": {"description": "print a message with a typing animation", "args": ["*message"]}, "lsusb": {"description": "list all usb devices"}, "reload": {"description": "Reloads the terminal"}, "w": {"description": "print the current time elapsed"}, "terminal": {"description": "a terminal inside a terminal"}, "flaci-to-turing": {"description": "Converts a flaci.com JSON File of a turing machine to a turing machine file", "args": {"file": "file to convert", "?s=save": "save the converted file"}}, "style": {"description": "change the style of the terminal", "args": ["?preset"], "standardVals": {"preset": null}}, "cheese": {"description": "take a foto with your webcam"}, "uname": {"description": "print the operating system name"}, "sudo": {"description": "try to use sudo", "args": ["**"]}, "raycasting": {"description": "play with raycasting"}, "cardoid": {"description": "start a cardoid generator"}, "ceasar": {"description": "shift the letters of a text", "args": {"text": "the text to shift", "?s=shift:i:-26~26": "the shift value"}, "standardVals": {"shift": 1}}, "cat": {"description": "print file content", "args": {"file": "file to display the content of"}}, "image-crop": {"description": "start image cropper program"}, "name-gen": {"description": "start a name generator"}, "pi": {"description": "calculate pi to the n-th digit", "args": {"?n:n:1~1000": "the number of digits"}, "standardVals": {"n": 100}}, "logistic-map": {"description": "draw the logistic map", "args": {"?min:n:-2~4": "minimum R value", "?max:n:-2~4": "maximum R value", "?w:n:10~200": "width of display", "?h:n:5~100": "height of display"}, "standardVals": {"min": 0, "max": 4, "w": 80, "h": 20}}, "debug": {"description": "activate the debug mode to enable untested new features"}, "yes": {"description": "print a message repeatedly", "args": {"?message": "the message to print", "?s:b": "slow mode"}, "standardVals": {"message": "y"}}, "compliment": {"description": "get info about yourself"}, "games": {"description": "shows the game menu"}, "curl": {"description": "download a file from the internet", "rawArgMode": true}, "code": {"description": "show the source code of a command", "args": {"command": "the command to show the source code of"}}, "clear": {"description": "clear the terminal"}, "alias": {"description": "create a new alias for a given function", "args": {"alias": "name of the new alias", "command": "name of the command to be aliased"}}, "perilious-path": {"description": "play perilous path"}, "set": {"description": "set a value on the server", "args": {"key": "the key to set the value of", "value": "the value to set"}}, "download": {"description": "download a file", "args": {"file": "the file to download"}}, "collatz": {"description": "Calculate the Collatz Sequence (3x+1) for a given Number", "args": {"n:i": "the starting number of the sequence", "?m=max:i": "max number of steps to print"}, "standardVals": {"m": 999999999999}}, "draw": {"description": "start simple drawing app"}, "background": {"description": "change the background color of the terminal", "args": ["color"]}, "mandelbrot": {"description": "draws the mandelbrot set", "args": {"?x:i:10~1000": "width of the plot", "?y:i:10~1000": "height of the plot"}}, "snake": {"description": "play a game of snake", "args": {"?s:n:1~10": "speed level of snake moving"}, "standardVals": {"s": 2}, "isGame": true}, "plot": {"description": "plot a mathematical function within bounds", "args": {"equation": "the equation to plot", "?xmin:n:-1000~1000": "the minimum x value", "?xmax:n:-1000~1000": "the maximum x value", "?ymin:n:-1000~1000": "the minimum y value", "?ymax:n:-1000~1000": "the maximum y value", "?playtime:i:0~10000": "the time to play the sound for in milliseconds"}, "standardVals": {"xmin": -3, "xmax": 3.1, "ymin": -3, "ymax": 3.1, "playtime": 2500}}, "reverse": {"description": "reverse a message", "args": {"*message": "the message to reverse", "?c": "copy the reversed message to the clipboard"}}, "edit": {"description": "edit a file of the current directory", "args": {"?file": "the file to open"}}, "zip": {"description": "zip a file"}, "mill2player": {"description": "play a game of mill with a friend locally", "isGame": true}, "stacker": {"description": "play a stacker game", "isGame": true}, "solve": {"description": "solve a mathematical equation for x", "args": {"*equation": "the equation to solve", "?i:n:1~5": "the number of iteration-steps to perform", "?m:n:1~100000": "the maximum number of total iterations to perform", "?l:n": "the lower bound of the search interval", "?u:n": "the upper bound of the search interval"}, "standardVals": {"i": 4, "m": 100000, "l": -100, "u": 100}, "disableEqualsArgNotation": true}, "man": {"description": "show the manual page for a command", "args": {"command": "the command to show the manual page for"}, "helpVisible": true}, "todo": {"description": "manage a todo list", "rawArgMode": true}, "lscpu": {"description": "get some helpful info about your cpu"}, "bezier": {"description": "play with bezier curves"}, "shutdown": {"description": "shutdown the terminal"}, "sleep": {"description": "sleep for a number of seconds", "args": ["seconds:n:0~1000000"]}, "whoami": {"description": "get client info"}, "get": {"description": "get a value from the server", "args": {"key": "the key to get the value of"}}, "href": {"description": "open a link in another tab", "args": ["url"]}}