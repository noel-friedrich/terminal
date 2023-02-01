const default_welcome_txt_content = `This is my personal Homepage!
                  _    __      _          _      _      _     
                 | |  / _|    (_)        | |    (_)    | |    
 _ __   ___   ___| | | |_ _ __ _  ___  __| |_ __ _  ___| |__  
| '_ \\ / _ \\ / _ \\ | |  _| '__| |/ _ \\/ _\` | '__| |/ __| '_ \\ 
| | | | (_) |  __/ |_| | | |  | |  __/ (_| | |  | | (__| | | |
|_| |_|\\___/ \\___|_(_)_| |_|  |_|\\___|\\__,_|_|  |_|\\___|_| |_|

I'm a hobbyist programmer and like to play around with stuff.

This site is built to work like a terminal:
- use 'help' to see a list of available commands
- have lots of fun messing around`

terminal.addCommand("helloworld", async function() {
    let welcomeText = default_welcome_txt_content

    if (terminal.fileExists("welcome.txt")) {
        let file = terminal.getFile("root/welcome.txt")
        if (file instanceof TextFile) {
            if (file.content.length > 0)
                welcomeText = file.content
        }
    }

    const welcomeLines = welcomeText.split("\n")

    let size = {
        x: welcomeLines.length * 2,
        y: welcomeLines.length
    }

    const maxLineWidth = Math.max(...welcomeLines.map(line => line.length))
    for (let i = 0; i < size.y; i++) {
        terminal.print(stringPadBack(welcomeLines[i], maxLineWidth+4))
        for (let j = 0; j < size.x; j++) {
            let x = (j / size.x - 0.5) * 2
            let y = (i / size.y - 0.5) * 2
            if (x*x + y*y > 1) {
                terminal.print(" ")
            } else {
                let angle = Math.atan2(y, x) / Math.PI * 180
                let hue = Math.round(angle)
                let lightness = Math.round(90 - (x*x + y*y) * 90)
                terminal.print("#", Color.hsl(hue / 360, 1, lightness / 100))
            }
        }
        terminal.addLineBreak()
    }
}, {
    description: "display the hello-world text",
    rawArgMode: true,
})