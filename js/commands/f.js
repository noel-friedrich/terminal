terminal.addCommand("f", async function(args) {
    const round = (num, places) => Math.round(num * 10**places) / 10**places

    async function randomFriendScore(friendName) {
        const msgBuffer = new TextEncoder().encode(friendName)
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const score = hashArray[0] * 256 + hashArray[1]
        return round(score / (256 * 256) * 10, 2)
    }

    const lowerCaseName = args.name.toLowerCase()
    const friendScore = await randomFriendScore(lowerCaseName + "pXxThFnonv4Qtbzz")

    terminal.printLine(`friendship score with ${args.name}: ${friendScore}/10`)
}, {
    description: "calculate friendship score with a friend",
    args: {
        "*name": "name of friend"
    }
})

