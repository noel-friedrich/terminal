terminal.addCommand("helloworld", async function() {
    const printLinks = links => {
        for (const {name, url} of links) {
            terminal.printLink(name, url, undefined, false)
            terminal.print(" ")
        }
        terminal.print(" ")
    }

    const welcomeLineFuncs = [
        () => terminal.print("                  _    __      _          _      _      _       "),
        () => terminal.print("                 | |  / _|    (_)        | |    (_)    | |      "),
        () => terminal.print(" _ __   ___   ___| | | |_ _ __ _  ___  __| |_ __ _  ___| |__    "),
        () => terminal.print("| '_ \\ / _ \\ / _ \\ | |  _| '__| |/ _ \\/ _\` | '__| |/ __| '_ \\   "),
        () => terminal.print("| | | | (_) |  __/ |_| | | |  | |  __/ (_| | |  | | (__| | | |  "),
        () => terminal.print("|_| |_|\\___/ \\___|_(_)_| |_|  |_|\\___|\\__,_|_|  |_|\\___|_| |_|  "),
        () => terminal.print("                                                                "),
        () => terminal.print("Welcome to my homepage. It's also a very interactive terminal.  "),
        () => terminal.print("Enter commands to navigate over 200 unique tools and features.  "),
        () => {
            terminal.print("Start your adventure using the ")
            terminal.printCommand("help", "help", undefined, false)
            terminal.print(" command. Have lots of fun!  ")
        },
        () => terminal.print("                                                                "),

        // --------------------------------------------------------------
        // Instagram GitHub Perli Library AntiCookieBox Stray GUI YouTube
        // Partycolo HR-Codes 3d Turtlo Coville Compli Spion Lettre Presi

        () => printLinks([
                {name: "Instagram", url: "https://instagram.com/noel.friedrich/"},
                {name: "GitHub", url: "https://github.com/noel-friedrich/terminal"},
                {name: "Perli", url: "https://noel-friedrich.de/perli"},
                {name: "Library", url: "https://noel-friedrich.de/lol"},
                {name: "AntiCookieBox", url: "https://noel-friedrich.de/anticookiebox"},
                {name: "Stray", url: "https://noel-friedrich.de/stray"},
                {name: "GUI", url: "https://noel-friedrich.de/terminal/gui"},
                {name: "YouTube", url: "https://www.youtube.com/@noel.friedrich"}
        ]),
        () => printLinks([
            {name: "Partycolo", url: "https://noel-friedrich.de/partycolo"},
            {name: "HR-Codes", url: "https://noel-friedrich.de/hr-code"},
            {name: "3d", url: "https://noel-friedrich.de/3d"},
            {name: "Turtlo", url: "https://noel-friedrich.de/turtlo"},
            {name: "Coville", url: "https://noel-friedrich.de/coville"},
            {name: "Compli", url: "https://play.google.com/store/apps/details?id=de.noelfriedrich.compli"},
            {name: "Spion", url: "https://noel-friedrich.de/spion"},
            {name: "Lettre", url: "https://noel-friedrich.de/lettre"},
            {name: "Presi", url: "https://noel-friedrich.de/presi"}
        ])
    ]

    let size = {
        x: welcomeLineFuncs.length * 2,
        y: welcomeLineFuncs.length
    }

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