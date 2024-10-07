terminal.addCommand("f-optimize", async function(args) {
    if (args.seconds < 0) {
        throw new Error("Argument 'seconds' can't be negative.")
    }

    if (!args.names) {
        args.names = "alex ben colin"
    }

    const friendNames = args.names.split(" ").map(n => n.toLowerCase())

    async function randomFriendScore(friendName) {
        const msgBuffer = new TextEncoder().encode(friendName)
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const score = hashArray[0] * 256 + hashArray[1]
        return score / (256 * 256) * 10
    }

    async function error(nonce) {
        let worstScore = 10
        for (const name of friendNames) {
            const score = await randomFriendScore(name + nonce)
            worstScore = Math.min(worstScore, score)
        }
        return worstScore
    }

    let bestScore = -Infinity
    let nonceIndex = 0
    const startTime = Date.now()
    let bestNonce = null

    let stopFlag = false

    while (Date.now() - startTime < args.seconds * 1000) {
        const nonce = (nonceIndex).toString()
        const worstNonceScore = await error(nonce)
        
        if (worstNonceScore > bestScore) {
            terminal.printLine(`nonce: "${nonce}" worstScore=${worstNonceScore}`)
            bestScore = worstNonceScore
            bestNonce = nonce
            
            const scoreNameObj = []
            for (const name of friendNames) {
                const score = await randomFriendScore(name + bestNonce)
                scoreNameObj.push([name, score.toFixed(2)])
            }
            terminal.printLine(scoreNameObj.map(([n, s]) => `${n}=${s}`).join(", "))
            terminal.addLineBreak()

            terminal.scroll()
        }

        nonceIndex++

        if (nonceIndex % 100 == 0) {
            await sleep(0)
        }
    }
}, {
    args: {
        "?*names": "names to optimize",
        "?s=seconds:i": "how long to optimize for (seconds)"
    },
    defaultValues: {
        seconds: 99999999
    },
    description: "finds a good nonce value for the friendship score generator"
})