terminal.commandData = {"2048": {"description": "play a game of 2048", "isGame": true}, "4inarow": {"description": "play a game of Connect Four against the computer", "args": {"?depth:i:1~100": "The depth of the search tree"}, "standardVals": {"depth": 4}, "isGame": true}, "alias": {"description": "create a new alias for a given function", "args": {"?alias:s": "name of the new alias", "?*command:s": "name of the command to be aliased", "?s=show:b": "show all aliases", "?r=remove:s": "remove a given alias"}}, "ant-opt": {"description": "interactive solution to the travelling salesman problem using ant colony optimization", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "asteroids": {"description": "simulate a bunch of balls jumping around", "args": {"?f=fullscreen:b": "start in fullscreen mode", "?c=chaos:b": "start with chaos mode enabled"}, "isGame": true}, "avoida": {"description": "play a game of avoida", "isGame": true}, "background": {"description": "change the background color of the terminal", "args": ["color"]}, "base64": {"description": "encode/decode a message using base64", "args": {"*message": "the message to encode/decode", "?d=decode:b": "decode the message instead of encoding it", "?c=copy:b": "copy the result to the clipboard"}}, "bc": {"description": "start a bc (basic calculator) session"}, "bezier": {"description": "play with bezier curves"}, "bin": {"description": "convert a number to another base", "args": {"n": "number to convert", "?t=to-base:i:2~36": "base to convert to", "?f=from-base:i:2~36": "base to convert from"}, "standardVals": {"t": 2, "f": 10}}, "binomcdf": {"description": "calculate the binomial cumulative distribution function", "args": {"n:n:1~1000": "the number of trials", "p:n:0~1": "the probability of success", "lower:n:0~1000": "the lower bound", "upper:n:0~1000": "the upper bound"}}, "binompdf": {"description": "calculate binomial distribution value", "args": {"n:n:0~100": "the number of trials", "p:n:0~1": "the probability of success", "k:n:0~100": "the number of successes"}}, "blocks": {"description": "3d raycasting test", "args": {"?fov:i:1~720": "Field of view in degrees", "?res=resolution:i:1~1000": "Resolution (width) in Pixels", "?x=roomX:i:5~100": "Room size in x direction", "?y=roomY:i:5~100": "Room size in y direction", "?z=roomZ:i:5~100": "Room size in z direction", "?v=viewDistance:i:1~9999": "View distance in blocks"}, "defaultValues": {"fov": 90, "resolution": 90, "roomX": 30, "roomY": 10, "roomZ": 10, "viewDistance": 13}}, "brainfuck": {"description": "parse given brainfuck code", "args": ["*code"]}, "cal": {"description": "print a calendar", "args": {"?month": "the month to print", "?year": "the year to print"}}, "cardoid": {"description": "start a cardoid generator", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "cat": {"description": "print file content", "args": {"file:f": "file to display the content of"}}, "cd": {"helpVisible": true, "args": {"directory:f": "the directory relative to your current path"}, "description": "change current directory"}, "ceasar": {"description": "shift the letters of a text", "args": {"text": "the text to shift", "?s=shift:i:-26~26": "the shift value"}, "standardVals": {"shift": 1}}, "cheese": {"description": "take a foto with your webcam"}, "chess": {"description": "play a game of chess against the computer", "isGame": true}, "clear": {"description": "clear the terminal"}, "clock": {"description": "display a clock", "args": {"?m=millis:b": "display milliseconds"}}, "cmatrix": {"description": "show the matrix", "args": {"?nf=not-fullscreen:b": "make the window fullscreen"}}, "cmdnotfound": {"description": "display that a command was not found", "rawArgMode": true, "isSecret": true}, "code": {"description": "show the source code of a command", "args": {"command:c": "the command to show the source code of"}}, "collatz": {"description": "Calculate the Collatz Sequence (3x+1) for a given Number", "args": {"n:bn": "the starting number of the sequence"}}, "color-test": {"description": "test the color capabilities of the terminal", "args": {"?size:i:1~999": "the size of the test image"}, "defaultValues": {"size": 60}}, "compliment": {"description": "get info about yourself"}, "config": {"description": "manage the terminal configuration", "args": {"?e=edit:e:foreground|background|font|color1|color2|storage|history": "edit a given property"}}, "contact": {"description": "Open contact form"}, "copy": {"description": "copy the file content to the clipboard", "rawArgMode": true}, "coville": {"description": "interactive virus simulation (in german)", "isSecret": true, "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "cowsay": {"description": "let the cow say something", "args": ["*message"]}, "cowthink": {"description": "let the cow say something", "args": ["*thought"]}, "cp": {"description": "copy a file", "args": {"file:f": "file to copy", "?d=directory:f": "directory to copy to", "?n=name:s": "new filename"}, "defaultValues": {"directory": "."}}, "crossp": {"description": "calculate the cross product of 2 3d vectors", "args": {"x1:n": "the x component of the first vector", "y1:n": "the y component of the first vector", "z1:n": "the z component of the first vector", "x2:n": "the x component of the second vector", "y2:n": "the y component of the second vector", "z2:n": "the z component of the second vector"}}, "curl": {"description": "download a file from the internet", "args": {"url:s": "the url to download the file from"}, "disableEqualsArgNotation": true}, "cw": {"description": "get the calendar week of a date", "args": {"?date": "the date to get the calendar week of"}, "standardVals": {"date": null}}, "debug": {"description": "activate the debug mode to enable untested new features", "isSecret": true}, "donut": {"description": "display a spinning donut"}, "download": {"description": "download a file", "args": {"file:f": "the file to download"}}, "draw": {"description": "start simple drawing app"}, "du": {"description": "display storage of current directory", "args": {"?folder:f": "folder to display storage of"}}, "easter-eggs": {"description": "open easter egg hunt", "args": {"?reset:b": "reset easter egg hunt"}}, "echo": {"description": "print a line of text", "rawArgMode": true}, "edit": {"description": "edit a file", "args": {"file:f": "file to edit"}}, "enigma": {"description": "Simulate an Enigma machine", "args": {"?c=config:b": "Enables config mode", "?t=translate:b": "Enables translation mode", "?r=reset:b": "Resets the machine", "?s=show:b": "Shows the current settings"}}, "error404": {"description": "Display a 404 error", "rawArgMode": true}, "eval": {"description": "evaluate javascript code", "rawArgMode": true}, "exit": {"description": "exit the terminal"}, "f": {"description": "calculate friendship score with a friend", "args": ["*friend"]}, "factor": {"description": "print the prime factors of a number", "args": {"?n:bn": "number to factorize"}, "standardVals": {"n": null}}, "fakechat": {"description": "fake a whatsapp chat conversation", "args": {"?f=fast:b": "skip typing animations [fast mode]", "?o=offset:n:-100~100": "offset the chat by a procentage of the screen height", "?s=scale:n:0.1~5": "scale the chat by a factor", "?x=width:n:100~10000": "set the width of the screen in pixels", "?y=height:n:100~10000": "set the height of the screen in pixels"}, "standardVals": {"o": 0, "s": 1, "x": 720, "y": 1560}}, "fibo": {"description": "Prints the Fibonacci sequence", "args": {"?n:i:1~100": "The number of elements to print", "?p=phi:b": "calculate the golden ratio using the last two elements"}, "defaultValues": {"n": 10}}, "fizzbuzz": {"description": "print the fizzbuzz sequence", "args": {"?max:n:1~100000": "the maximum number to print"}, "standardVals": {"max": 15}}, "flaci-to-turing": {"description": "Converts a flaci.com JSON File of a turing machine to a turing machine file", "args": {"file": "file to convert", "?s=save:b": "save the converted file"}, "isSecret": true}, "flappy": {"description": "play a game of flappy turtlo", "args": {"?f=fullscreen:b": "fullscreen", "?s=silent:b": "silent mode"}, "isGame": true}, "font": {"description": "change the font of the terminal", "args": ["*font"]}, "foreground": {"description": "change the foreground color of the terminal", "args": {"color": "the color to change the foreground to"}}, "fraction": {"description": "find a fraction from a decimal number", "args": {"n=number:n": "number (decimal)", "?d=max-denominator:i:1~999999999": "maximum denominator"}, "defaultValues": {"d": 1000}}, "freq": {"description": "play a frequency for an amount of time", "args": {"f=frequency:n:0~30000": "the frequency to play", "?t=time:n:0~9999": "time in seconds to play frequency"}, "defaultValues": {"time": 0.5}}, "games": {"description": "shows the game menu"}, "get": {"description": "get a value from the server", "args": {"key": "the key to get the value of"}, "disableEqualsArgNotation": true}, "greed": {"description": "play a game of greed", "isGame": true, "args": {"?b": "play the bigger version"}}, "grep": {"description": "search for a pattern in a file", "args": {"pattern": "the pattern to search for", "file": "the file to search in", "?r=recurse:b": "search recursively", "?i=ignore-case:b": "ignore case", "?v=invert-match:b": "invert match", "?x=match-whole-lines:b": "match whole lines"}}, "gui": {"description": "open the GUI page for a given command", "args": {"command:c": "a terminal command"}}, "hangman": {"description": "play a game of hangman", "isGame": true}, "head": {"description": "display the first lines of a file", "args": ["file", "?l:i:1~1000"], "standardVals": {"l": 10}}, "helloworld": {"description": "display the hello-world text", "rawArgMode": true}, "help": {"description": "shows this help menu"}, "hi": {"description": "say hello to the terminal"}, "highscore-admin": {"description": "Highscore Admin Management", "isSecret": true, "args": {"?l=list:b": "List all unconfirmed highscores", "?t=tinder:b": "Play Tinder Swiping with highscores", "?d=delete:b": "Delete password from local storage"}}, "highscore-remove": {"description": "Remove a highscore", "isSecret": true, "args": {"game": "the game to remove the highscore from", "?n": "only show highscores with this name", "?l:n:1~10000": "limit the number of highscores to show", "?uid": "the uid of the highscore to remove"}, "standardVals": {"n": null, "l": Infinity}}, "highscores": {"description": "Show global highscores for a game", "args": {"game:s": "the game to show the highscores for", "?n:s": "only show highscores with this name", "?l:i:1~10000": "limit the number of highscores to show", "?show-all:b": "show all highscores, not just the top ones"}, "standardVals": {"n": null, "l": 10}}, "history": {"description": "print the command history", "args": {"?l=limit:n:1~100000": "the maximum number of commands to print", "?show-full:b": "show the full command instead of the shortened version"}, "standardVals": {"l": 1000}}, "hr-draw": {"description": "turn drawings into bitmaps", "args": {"?x=width:i:1~100": "width (pixels)", "?y=height:i:1~100": "height (pixels)"}, "defaultValues": {"width": 5, "height": 5}, "isSecret": true}, "hr": {"description": "create a hr code", "args": {"message:s": "the message to encode", "?f=fontmode:s": "the font mode to use", "?fill:b": "fill empty spaces with random data"}, "defaultValues": {"fontmode": "5x5"}}, "href": {"description": "open a link in another tab", "args": {"?u=url:s": "url to open", "?f=file:s": "file to open"}}, "image-crop": {"description": "start image cropper program"}, "img2ascii": {"description": "Convert an image to ASCII art", "args": {"?w=width:i:1~500": "the width of the output image in characters"}, "defaultValues": {"width": 60}}, "img2pdf": {"description": "convert image files to pdf", "args": {"?f=filename:s": "filename for the pdf", "?p=padding:i:0~50": "padding of pdf (in px)", "?r=rotate:b": "rotate the images to maximise space"}, "defaultValues": {"filename": null, "padding": 5}}, "isprime": {"description": "Check if a number is prime", "args": {"n:i": "The number to check"}}, "joke": {"description": "tell a joke"}, "kaprekar": {"description": "display the kaprekar steps of a number", "args": {"n:n:1~999999999": "the number to display the kaprekar steps of"}}, "keyboard": {"description": "Toggle mobile mode", "args": {"?m=mode:s": "status | on | off | auto"}, "defaultValues": {"m": "status"}}, "kill": {"description": "kill a process", "args": {"process": "the process to kill"}}, "labyrinth": {"description": "play a game of labyrinth", "isGame": true, "args": {"?fps:n:1~60": "the frames per second of the game"}, "standardVals": {"fps": 30}}, "letters": {"description": "prints the given text in ascii art", "args": {"*text": "the text to print"}, "example": "letters hello world"}, "live-quiz": {"description": "a simple quiz game that uses your camera as input for your answer", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "live-rocket": {"description": "a simple avoid game that you steer using camera input", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "logistic-map": {"description": "draw the logistic map", "args": {"?min:n:-2~4": "minimum R value", "?max:n:-2~4": "maximum R value", "?w:n:10~200": "width of display", "?h:n:5~100": "height of display"}, "standardVals": {"min": 0, "max": 4, "w": 80, "h": 20}}, "longjump": {"description": "Play a game of longjump", "isGame": true, "args": {"?f=fullscreen:b": "Play in fullscreen"}}, "lorem": {"description": "generate lorem ipsum text", "args": {"?l=length:i": "number of words to generate", "?c=copy:b": "copy to clipboard"}, "defaultValues": {"l": 100}}, "ls": {"helpVisible": true, "description": "list all files of current directory", "args": {"?folder:f": "folder to list", "?r=recursive:b": "list recursively"}, "standardVals": {"folder": ""}}, "lscmds": {"description": "list all available commands", "helpVisible": true, "args": {"?m:b": "format output as markdown table"}}, "lscpu": {"description": "get some helpful info about your cpu"}, "lunar-lander": {"description": "play a classic game of moon-lander", "args": {"?particles:n:1~1000": "number of particles to generate", "?f=fullscreen:b": "enable fullscreen application"}, "standardVals": {"particles": 10}, "isGame": true}, "man": {"description": "show the manual page for a command", "args": {"command:c": "the command to show the manual page for"}, "helpVisible": true}, "mandelbrot": {"description": "draws the mandelbrot set", "args": {"?x:i:10~1000": "width of the plot", "?y:i:10~1000": "height of the plot"}}, "matdet": {"description": "find the determinant of a matrix", "args": {"?A:sm": "square matrix"}}, "matinv": {"description": "find the inverse of a matrix", "args": {"?A:sm": "matrix to invert"}}, "matmin": {"description": "find the matrix of minors of a given matrix", "args": {"?A:sm": "matrix to find minors of"}}, "matmul": {"description": "multiply two matrices with each other", "args": {"?A:m": "matrix A", "?B:m": "matrix B"}}, "matred": {"description": "reduce a given matrix to reduced row echelon form", "args": {"?A:m": "matrix to reduce"}}, "matvisualize": {"description": "visualize a given 2x2 matrix transformation", "args": {"?m=matrix:sm": "2x2 matrix to left-multiply by", "?x:n": "x coordinate of center", "?y:n": "y coordinate of center", "?z=zoom:n:0.01~99999": "zoom level"}, "defaultValues": {"x": 0, "y": 0, "zoom": 5}}, "mill2player": {"description": "play a game of mill with a friend locally", "isGame": true}, "minesweeper": {"description": "play a game of minesweeper", "args": {"?x=width:i:5~100": "width of the board", "?y=height:i:5~100": "height of the board", "?b=bombs:i:10~90": "percentage of bombs"}, "defaultValues": {"width": 10, "height": 10, "bombs": 20}, "isGame": true}, "minigolf": {"description": "play a game of minigolf", "args": {"?l=level:i": "open a specific level", "?e=edit:b": "open map editor", "?f=file:s": "open a specific file", "?fullscreen:b": "activate fullscreen mode"}, "defaultValues": {"level": 1}, "isGame": true}, "mkdir": {"description": "create a new directory", "args": {"name:s": "name for your shiny new directory"}}, "morse": {"description": "translate latin to morse or morse to latin", "args": {"*text": "text to translate"}}, "mv": {"description": "move a file", "args": {"file:f": "file to move", "d=directory:f": "directory to move to", "?n=name:s": "new filename"}}, "name-gen": {"description": "start a name generator", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "name": {"description": "set a default name for the highscore system to use", "args": {"method": "set | get | reset", "?newname": "the new name"}}, "ncr": {"description": "calculate binomial distribution value", "args": {"n:n:0~100": "the number of trials", "k:n:0~100": "the number of successes"}}, "neural-car": {"description": "start a neural car simulation", "args": {"?cars:i:1~9999": "number of cars to simulate", "?edit:b": "activate the wall editor"}, "defaultValues": {"cars": 100}}, "neural-rocket": {"description": "trains neural networks to fly rockets", "args": {"?population:i:10~99999": "number of rockets in the population"}, "defaultValues": {"population": 100}, "isSecret": true}, "nsolve": {"description": "solve an equation using the newton-raphson method", "args": {"*e=equation:s": "the equation to solve", "?s=startn:n": "Starting number", "?i=iterations:i:1~999999": "number of iterations to perform", "?l=list:b": "list all intermediate values"}, "defaultValues": {"startn": 0.71, "iterations": 1000}}, "number-guess": {"description": "guess a random number", "isGame": true}, "old-edit": {"description": "edit a file of the current directory (old version of editor)", "args": {"?file:f": "the file to open"}, "isSecret": true}, "particle": {"description": "start a particle simulation", "args": {"?n:i:1000~10000000": "number of particles"}, "standardVals": {"n": 100000}, "isSecret": true}, "pascal": {"description": "print a pascal triangle", "args": {"?depth:n:1~100": "the depth of the triangle", "?f:b": "only show the final row"}, "standardVals": {"depth": 10}}, "password": {"description": "Generate a random password", "args": {"?l=length:i:1~9999": "The length of the password", "?c=chars:s": "The characters to use in the password", "?norepeat:b": "If present, the password will not repeat characters", "?nocopy:b": "Do not copy the password to the clipboard", "?d=diverse:b": "Use at least one special character, number, and uppercase letter"}, "standardVals": {"l": 20, "c": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&!?.,;:[]{}()_-+=*"}}, "pendulum": {"description": "start a pendulum wave simulation", "args": {"?n:i:1~10000": "number of pendulums", "?o:n:0~1": "offset of pendulums", "?f=fullscreen:b": "start in fullscreen mode"}, "standardVals": {"n": 20, "o": 0.025}}, "perilious-path": {"description": "play perilous path", "isGame": true, "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "physics": {"description": "start a physics simulation", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "pi": {"description": "calculate pi to the n-th digit", "args": {"?n:i:1~10000": "the number of digits"}, "standardVals": {"n": 100}}, "piano": {"description": "play a piano with your keyboard"}, "plane": {"description": "play the plane game", "args": {"?f=fullscreen:b": "open in fullscreen mode"}, "isGame": true}, "plot": {"description": "plot a mathematical function within bounds", "args": {"equation": "the equation to plot", "?xmin:n:-1000~1000": "the minimum x value", "?xmax:n:-1000~1000": "the maximum x value", "?ymin:n:-1000~1000": "the minimum y value", "?ymax:n:-1000~1000": "the maximum y value", "?playtime:i:0~10000": "the time to play the sound for in milliseconds"}, "standardVals": {"xmin": -3, "xmax": 3.1, "ymin": -3, "ymax": 3.1, "playtime": 2500}}, "plotter": {"description": "plot mathematical functions", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "polyrythm": {"description": "creates a polyrythm", "args": {"*numbers": "numbers (e.g. \"3 4 5\")", "?t=time:n:10~99999": "time in miliseconds for full rotation"}, "defaultValues": {"time": 4000}}, "pong": {"description": "play a game of pong against the computer", "isGame": true}, "primes": {"description": "generate mersenne primes"}, "pull": {"description": "pull a file from the server", "args": {"file": "file to pull"}}, "push": {"description": "push a file to the server", "args": {"file:f": "file to push"}}, "pv": {"description": "print a message with a typing animation", "args": ["*message"]}, "pwd": {"description": "print the current working directory"}, "python": {"description": "run a script or open a python shell", "args": {"?f=file:f": "the script to run", "?c=code:s": "the code to run"}, "disableEqualsArgNotation": true}, "qr": {"description": "generate a qr code", "args": {"*text": "the text to encode"}}, "rate": {"description": "rate a programming language", "args": ["language"]}, "raycasting": {"description": "play with raycasting", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "reboot": {"description": "reboot the website"}, "reload": {"description": "Reloads the terminal"}, "rename": {"description": "rename a file or folder", "args": {"file:f": "the file or folder to rename", "name:s": "the new name of the file or folder"}}, "reset": {"description": "reset the terminal", "args": {"?n=now:b": "reset now"}}, "reverse": {"description": "reverse a message", "args": {"*message": "the message to reverse", "?c": "copy the reversed message to the clipboard"}}, "rm": {"description": "remove a file", "args": {"file:f": "file to remove"}}, "rndm": {"description": "generate a random number based on the current time", "args": {"?min:n:0~100000": "minimum value (inclusive)", "?max:n:0~100000": "maximum value (inclusive)", "?t=time:b": "use a time based random number generator", "?f=float:b": "generate a float instead of an integer"}, "standardVals": {"min": 1, "max": 100}}, "say": {"author": "Colin Chadwick", "description": "Say something", "args": {"*text:s": "The text to say", "?pitch:n:0~2": "The pitch of the voice", "?language:s": "The language of the voice"}, "defaultValues": {"pitch": 1, "language": "en-US"}}, "sc": {"description": "manage the startup commands", "args": {"?mode": "'add', 'remove', 'reset' or 'list'", "?command": "the command to add or remove (or index)"}, "defaultValues": {"mode": "list"}}, "scarpet": {"description": "draws the Sierpinski carpet using the chaos game", "args": {"?s=speed:i:1~99999": "the speed of dots placed. The higher the faster.", "?size:i:10~1000": "size of output canvas in characters"}, "defaultValues": {"speed": 30, "size": 50}}, "search": {"description": "search something via google.com", "args": {"*query": "the search query", "?b=baseUrl": "the base search-engine url"}, "standardVals": {"b": "https://www.google.com/search?q="}}, "session": {"description": "manage a filesystem session", "args": {"action:e:begin|reset|save|load|end": "<enum>"}}, "set": {"description": "set a value on the server", "args": {"key": "the key to set the value of", "value": "the value to set"}, "disableEqualsArgNotation": true}, "sha256": {"description": "calculate the SHA-256 hash of a message", "args": {"?s": "a string to hash", "?f": "a file to hash"}, "standardVals": {"s": null, "f": null}}, "shi": {"description": "calculate your SHI (stability height index)", "args": {"s=shoe-size:n:1~99999": "shoe size (european)", "l=height:n:1~999999": "body height in centimeters"}}, "shoot": {"description": "Play a game of Shoot against another player locally", "isGame": true, "args": {"?l=lives:i:1~100": "The number of lives each player has", "?s=shoot-delay:i:0~1000": "The number of frames between each shot"}, "defaultValues": {"l": 3, "s": 20}}, "shutdown": {"description": "shutdown the terminal"}, "simulate": {"description": "run an implemented simulation", "args": {"s=simulation:e:two-masses-spring": "simulation to run"}}, "sl": {"description": "Steam Locomotive", "args": {"?f=F:b": "Make it fly"}}, "sleep": {"description": "sleep for a number of seconds", "args": ["seconds:n:0~1000000"]}, "slime": {"description": "Start a slime simulation"}, "snake": {"description": "play a game of snake", "args": {"?s:n:1~10": "speed level of snake moving"}, "standardVals": {"s": 2}, "isGame": true}, "sodoku": {"description": "Solve or generate a sodoku puzzle", "args": {"?mode:e:play|solve": "the mode to run in (play, solve)", "?fen:s": "a FEN string to load", "?give-fen:b": "output the FEN string for the inputted puzzle"}, "isGame": true}, "solve": {"description": "solve a mathematical equation for x", "args": {"*equation": "the equation to solve", "?i:n:1~5": "the number of iteration-steps to perform", "?m:n:1~100000": "the maximum number of total iterations to perform", "?l:n": "the lower bound of the search interval", "?u:n": "the upper bound of the search interval"}, "standardVals": {"i": 4, "m": 100000, "l": -100, "u": 100}, "disableEqualsArgNotation": true}, "sorting": {"description": "display a sorting algorithm", "args": {"?algorithm": "the algorithm to display", "?n:i:10~1000": "the number of elements to sort", "?speed:n:0~100": "the speed of the sorting algorithm", "?s:b": "silent mode (deactivate sound)"}, "standardVals": {"algorithm": null, "n": 20, "speed": 1}}, "sounds": {"description": "make sounds", "args": {"*text:s": "text to speak", "?i=interval:i:1~999999": "interval in ms between letters", "?r=random:b": "make random", "?l=length:i:1~99999": "length of random notes", "?a=alphabet:s": "alphabet of random letters"}, "defaultValues": {"text": "", "interval": 500, "length": 10, "alphabet": " abcdefghijklmnopqrstuvwxyz.,\n"}}, "spion": {"description": "Spiel Spiel Manager", "args": {"?a=add:b": "add a new place", "?l=list:s": "list a given places roles"}, "isSecret": true}, "stacker": {"description": "play a stacker game", "isGame": true}, "stat": {"description": "show a statistic of a given data set", "args": {"?*nums:s": "the numbers to show the statistic of", "?f=function:s": "the function to plot", "?min:n": "the minimum value of the function", "?max:n": "the maximum value of the function", "?width:n:1~9999": "the width of the canvas", "?height:n:1~9999": "the height of the canvas", "?x=x-name:s": "the name of the x axis", "?y=y-name:s": "the name of the y axis", "?p=padding:n:0~9999": "the padding of the canvas", "?color=foreground:s": "the color of plot", "?axis-color:s": "the color of the axis", "?a=animateMs": "animate the plot", "?background": "the background color of the canvas", "?l=length:i:2~99999": "the length of a data set", "?linewidth:n:1~999": "the width of the line in pixels", "?nopoints:b": "disable the points being displayed"}, "defaultValues": {"nums": null, "width": 640, "height": 400, "x": null, "y": null, "min": -10, "max": 10, "padding": 20, "axis-color": null, "color": null, "animateMs": 500, "background": null, "length": 100, "linewidth": 2}}, "style": {"description": "change the style of the terminal", "args": ["?preset"], "standardVals": {"preset": null}}, "sudo": {"description": "try to use sudo", "args": ["**"]}, "terminal": {"description": "a terminal inside a terminal", "args": {"?f=fullscreen:b": "Open in fullscreen mode"}}, "terml": {"description": "run a .terml file", "args": {"file": "the file to run"}}, "tetris": {"description": "play a classic game of tetris", "isGame": true}, "tictactoe": {"description": "play a game of tic tac toe against the computer.", "args": {"?d=difficulty": "play against an unbeatable computer."}, "standardVals": {"d": "impossible"}, "isGame": true}, "time": {"description": "Shows the current time.", "args": {"?m=show-milli:b": "Show milliseconds.", "?f=size:n:0.1~99": "Font size in em.", "?s=start:b": "Start a stopwatch."}, "defaultValues": {"size": 3}}, "timer": {"description": "set a timer", "rawArgMode": true}, "todo": {"description": "show and manage a todo list", "args": {"n=name:s": "name of the the todo list", "?u=uncompleted-only:b": "only show the uncompleted todos", "?a=add-item:b": "add an item to the todo list", "?r=rm-item:b": "remove an item from the todo list", "?e=edit-item:b": "edit an item of the todo list", "?rm-completed:b": "remove all completed todos from the todo list"}}, "touch": {"description": "create a file in the current directory", "args": {"filename:s": "the name of the file"}}, "turing": {"description": "run a turing machine file", "args": {"file": "file to run", "?t=startTape": "starting tape content", "?s=sleep:i:0~10000": "sleep time between steps (in ms)", "?d=startingState": "starting state", "?m=maxSteps:i:0~9999999999": "maximum number of steps to run", "?turbo:b": "run as fast as possible"}, "standardVals": {"startTape": "", "s": 100, "d": "0", "m": 100000}}, "turtlo": {"description": "spawn turtlo", "args": {"?size:i:1~3": "size of turtlo", "?silent:b": "don't print anything"}, "defaultValues": {"size": 1}}, "type-test": {"description": "test your typing speed", "isGame": true}, "uname": {"description": "print the operating system name"}, "unit": {"description": "convert numbers between units", "args": {"v=value:n": "numeric value of unit", "s=start-unit:s": "starting unit", "r=result-unit:s": "resulting unit", "?l=list-units:b": "list all known units"}}, "upload": {"description": "upload a file from your computer", "args": {"?f=filename:s": "name of your shiny new uploaded file"}}, "vigenere": {"description": "encrypt/decrypt a message using the vigenere cipher", "args": {"message": "the message to encrypt/decrypt", "key": "the key to use", "?d=decrypt:b": "decrypt the message instead of encrypting it", "?c=copy:b": "copy the result to the clipboard"}}, "visits": {"description": "Shows the number of page visits"}, "w": {"description": "print the current time elapsed"}, "watti": {"description": "manage the walk to trinity database", "isSecret": true, "args": {"action:e:list|add": "<enum>"}}, "wave": {"description": "play with a wave"}, "wc": {"description": "display word and line count of file", "args": {"?f=file:f": "file to open", "?s": "string to count instead of file"}}, "weather": {"description": "Get the current weather", "author": "Colin Chadwick"}, "whatday": {"description": "get the weekday of a date", "args": ["DD.MM.YYYY"]}, "whatis": {"description": "display a short description of a command", "args": ["command"]}, "whoami": {"description": "get client info"}, "yes": {"description": "print a message repeatedly", "args": {"?message": "the message to print", "?s:b": "slow mode"}, "standardVals": {"message": "y"}}, "zip": {"description": "zip a file"}}