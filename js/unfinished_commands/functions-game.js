class 

terminal.addCommand("functions-game", function(args) {
    function generateFunction() {
        return {func: x => x ** 2, funcString: "x^2"}
    }

    const {func, funcString} = generateFunction()
    terminal.printLine(func)
    terminal.printLine(funcString)
}, {
    description: "Find the root of a mistery function as fast as possible"
})