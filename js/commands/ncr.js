terminal.addCommand("ncr", async function(args) {
    const binom = (await terminal.modules.load("binom", terminal)).binom
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binom(n, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "k:n:0~100": "the number of successes"
    }
})

