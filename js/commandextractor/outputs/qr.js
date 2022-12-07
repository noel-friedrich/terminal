terminal.addCommand("qr", async function(args) {
    
    let api = "https://chart.apis.google.com/chart?chs=500x500&cht=qr&chld=L&chl="
    let url = api + encodeURIComponent(args.text)

    terminal.addLineBreak()
    terminal.printImg(url)
    terminal.addLineBreak()

}, {
    description: "generate a qr code",
    args: {
        "*text": "the text to encode"
    }
})

function binom(n, k) {
    let res = 1
    for (let i = 1; i <= k; i++) {
        res *= n - k + i
        res /= i
    }
    return res
}

function binompdf(n, p, k) {
    return binom(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

function binomcdf(n, p, lower, upper) {
    let res = 0
    for (let i = lower; i <= upper; i++) {
        res += binompdf(n, p, i)
    }
    return res
}

