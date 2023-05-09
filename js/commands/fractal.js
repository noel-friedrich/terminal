terminal.addCommand("fractal", async function(args) {
    await terminal.modules.import("game", window)

    const canvas = printSquareCanvas({widthChars: 50})
    const context = canvas.getContext("2d")

}, {
    description: "solve a mathematical equation",
    args: {
        "fractal:s": "the fractal to draw"
    },
    disableEqualsArgNotation: true
})