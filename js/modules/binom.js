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
    for (let i = lower; i <= upper; i++)
        res += binompdf(n, p, i)
    return res
}

terminal.modules.binom = {binom, binompdf, binomcdf}