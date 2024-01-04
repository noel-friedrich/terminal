terminal.addCommand("freq", async function(args) {
    await playFrequency(args.f, args.t * 1000)

    if (args.f == 3500) {
        terminal.print("Random Fun Fact! ", Color.COLOR_1)
        terminal.printEasterEgg("Loudest-Egg")
        terminal.printLine("According to some research, the perceived loundness of")
        terminal.printLine("sounds is actually very different from the actual amplitude")
        terminal.printLine("of the soundwaves. For example, a frequency of 3500 is")
        terminal.printLine("found to be the perceived* loudest that a speaker can play!")
    }
}, {
    description: "play a frequency for an amount of time",
    args: {
        "f=frequency:n:0~30000": "the frequency to play",
        "?t=time:n:0~9999": "time in seconds to play frequency"
    },
    defaultValues: {
        time: 0.5
    }
})