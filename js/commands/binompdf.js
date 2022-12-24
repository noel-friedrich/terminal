terminal.addCommand("binompdf", async function(args) {
    const binompdf = (await terminal.modules.load("binom", terminal)).binompdf
    let n = ~~args.n
    let k = ~~args.k
    if (k > n) {
        throw new Error("k must be smaller than n")
    }
    terminal.printLine(binompdf(n, args.p, k))
}, {
    description: "calculate binomial distribution value",
    args: {
        "n:n:0~100": "the number of trials",
        "p:n:0~1": "the probability of success",
        "k:n:0~100": "the number of successes"
    }
})

