terminal.addCommand("qr", async function(args) {
    
    let api = "https://chart.apis.google.com/chart?chs=500x500&cht=qr&chld=L&chl="
    let url = api + encodeURIComponent(args.text)

    terminal.addLineBreak()
    terminal.printImg(url)
    terminal.addLineBreak()

}, {
    description: "generate a qr code",
    args: {
        "*text": "the text to encode"
    }
})