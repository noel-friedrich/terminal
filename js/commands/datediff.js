terminal.addCommand("datediff", function(args) {
    const totalDiffMs = args.date2.getTime() - args.date1.getTime()
    const totalDiffSeconds = Math.round(totalDiffMs / 1000)

    // round instead of floor to prevent floating point err
    const totalDays = Math.round(totalDiffSeconds / (60 * 60 * 24))

    const totalHours = totalDays * 24
    const totalMinutes = totalHours * 60
    const totalSeconds = totalMinutes * 60

    const s = Math.abs(totalDays) == 1 ? "" : "s"
    terminal.printLine(`  ${totalDays} day${s}`)
    terminal.printLine(`= ${totalHours} hours`)
    terminal.printLine(`= ${totalMinutes} minutes`)
    terminal.printLine(`= ${totalSeconds} seconds`)
}, {
    description: "calculate the difference between two dates",
    args: {
        "date1:d": "first date",
        "date2:d": "second date"
    },
    category: "tools"
})