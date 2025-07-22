terminal.addCommand("np", async function(args) {
    const np = await terminal.modules.load("np", terminal)
    terminal.window.np = np

    // const a = np.array([[[[1,2,3,4], [7,5,2,1], [1,2,3,0]]], [[[1,2,3,4], [7,5,2,1], [1,2,3,0]]]])
    const a = np.array([[1,2,3,4], [4,5,6,7], [8,9,10,11]])
    terminal.window.a = a

    terminal.printLine(a.toString())
}, {
    description: "start a noelpy interpreter for calculations",
    isSecret: false
})