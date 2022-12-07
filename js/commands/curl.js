terminal.addCommand("curl", function() {
    terminal.print("this unfortunately doesn't work due to ")
    terminal.printLink("CORS", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS")
}, {description: "download a file from the internet", rawArgMode: true})

