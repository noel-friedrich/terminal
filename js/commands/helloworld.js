const welcome_txt_content = `This is my personal Homepage!
                  _    __      _          _      _      _     
                 | |  / _|    (_)        | |    (_)    | |    
 _ __   ___   ___| | | |_ _ __ _  ___  __| |_ __ _  ___| |__  
| '_ \\ / _ \\ / _ \\ | |  _| '__| |/ _ \\/ _\` | '__| |/ __| '_ \\ 
| | | | (_) |  __/ |_| | | |  | |  __/ (_| | |  | | (__| | | |
|_| |_|\\___/ \\___|_(_)_| |_|  |_|\\___|\\__,_|_|  |_|\\___|_| |_|

I'm a hobbyist programmer and like to play around with stuff.

This site is built to work like a terminal:
- use 'help' to see a list of available commands
- or just use the buttons instead
`

terminal.addCommand("helloworld", async function() {
    terminal.printLine(welcome_txt_content)
}, {
    description: "display the hello-world text",
    rawArgMode: true,
})