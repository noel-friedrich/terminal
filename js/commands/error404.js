const warningText = `
 _  _    ___  _  _                            _        __                      _ 
| || |  / _ \\| || |                          | |      / _|                    | |
| || |_| | | | || |_              _ __   ___ | |_    | |_  ___ _   _ _ __   __| |
|__   _| | | |__   _|    ____    | '_ \\ / _ \\| __|   |  _|/ _ \\|| | | '_ \\ / _\` |
   | | | |_| |  | |     |____|   | | | | (_) | |_    | | | (_) ||_| | | | | (_| |
   |_|  \\___/   |_|              |_| |_|\\___/ \\__|   |_|  \\___/\\__,_|_| |_|\\__,_|

You have encountered a 404 error. This means that the page you are looking for
does not exist. Maybe you mistyped the URL? Or maybe the page has been moved or
deleted? Either way, you should try to find what you are looking for elsewhere.

To continue to the terminal homepage, press any key.`

terminal.addCommand("error404", async function() {
    terminal.clear(false)
    terminal.printLine(warningText)
    terminal.print("Alternatively, you can use this link: ")
    terminal.printLink("https://noel-friedrich.de/terminal/", "https://noel-friedrich.de/terminal/")

    terminal.window.addEventListener("keydown", () => {
        terminal.href("https://noel-friedrich.de/terminal/")
    })

    return new Promise(resolve => {})
}, {
    description: "Display a 404 error",
    rawArgMode: true
})