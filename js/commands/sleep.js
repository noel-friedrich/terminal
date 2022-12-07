terminal.addCommand("sleep", async function(args) {
    await sleep(args.seconds * 1000)
}, {
    description: "sleep for a number of seconds",
    args: ["seconds:n:0~1000000"]
})
