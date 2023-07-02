terminal.addCommand("helloworld", async function() {
    const welcomeLineFuncs = [
        () => terminal.print("                  _    __      _          _      _      _       "),
        () => terminal.print("                 | |  / _|    (_)        | |    (_)    | |      "),
        () => terminal.print(" _ __   ___   ___| | | |_ _ __ _  ___  __| |_ __ _  ___| |__    "),
        () => terminal.print("| '_ \\ / _ \\ / _ \\ | |  _| '__| |/ _ \\/ _\` | '__| |/ __| '_ \\   "),
        () => terminal.print("| | | | (_) |  __/ |_| | | |  | |  __/ (_| | |  | | (__| | | |  "),
        () => terminal.print("|_| |_|\\___/ \\___|_(_)_| |_|  |_|\\___|\\__,_|_|  |_|\\___|_| |_|  "),
        () => terminal.print("                                                                "),
        () => terminal.print("Welcome to my website! It's also a very interactive terminal!   "),
        () => terminal.print("You may enter commands to navigate over 200 unique features.    "),
        () => {
            terminal.print("Start your adventure using the ")
            terminal.printCommand("help", "help", undefined, false)
            terminal.print(" command. Have lots of fun!  ")
        },
        () => terminal.print("                                                                "),
        () => {
            terminal.printLink("Blog", "https://noel-friedrich.de/blobber", undefined, false)
            terminal.print(" ")
            terminal.printLink("Github", "https://github.com/noel-friedrich/terminal", undefined, false)
            terminal.print(" ")
            terminal.printLink("StadtOhren", "http://stadt-ohren.de", undefined, false)
            terminal.print(" ")
            terminal.printLink("Compli", "https://play.google.com/store/apps/details?id=de.noelfriedrich.compli", undefined, false)
            terminal.print(" ")
            terminal.printLink("AntiCookieBox", "https://noel-friedrich.de/anticookiebox", undefined, false)
            terminal.print(" ")
            terminal.printLink("Partycolo", "https://noel-friedrich.de/partycolo", undefined, false)
            terminal.print(" ")
            terminal.printLink("Spion", "https://noel-friedrich.de/spion", undefined, false)
            terminal.print("     ")
        }
    ]

    let size = {
        x: welcomeLineFuncs.length * 2,
        y: welcomeLineFuncs.length
    }

    const maxLineWidth = 64
    for (let i = 0; i < size.y; i++) {

        welcomeLineFuncs[i]()
        
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