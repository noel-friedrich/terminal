terminal.addCommand("binomcdf", async function(args) {
    const binomcdf = (await terminal.modules.load("binom", terminal)).binomcdf
    let n = ~~args.n
    let lower = ~~args.lower
    let upper = ~~args.upper
    terminal.printLine(binomcdf(n, args.p, lower, upper))
}, {
    description: "calculate the binomial cumulative distribution function",
    args: {
        "n:n:1~1000": "the number of trials",
        "p:n:0~1": "the probability of success",
        "lower:n:0~1000": "the lower bound",
        "upper:n:0~1000": "the upper bound"
    }
})

