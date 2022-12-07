terminal.addCommand("cmatrix", async function(rawArgs) {
    let [canvas, intervalFunc] = makeCMatrix()
    let stopped = false
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.key.toLowerCase() == "c") {
            clearInterval(intervalFunc)
            canvas.remove()
            stopped = true
        }
    })
    while (!stopped) {
        await sleep(100)
    }
}, {
    description: "show the matrix"
})

