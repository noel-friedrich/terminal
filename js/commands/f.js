terminal.addCommand("f", async function(args) {
    async function randomFriendScore(friendName) {
        const round = (num, places) => Math.round(num * 10**places) / 10**places
        let msgBuffer = new TextEncoder().encode(friendName)
        let hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
        let hashArray = Array.from(new Uint8Array(hashBuffer))
        return round(hashArray[0] / 255 * 10, 2)
    }

    let lowerCaseName = args.friend.toLowerCase()

    // best salt was chosen by maximizing the average friendship score
    // of the names of my best friends
    const bestSalt = "oJOMDCVmMJ"

    let friendScore = await randomFriendScore(lowerCaseName + bestSalt)

    terminal.printLine(`Your friendship score with ${args.friend} is ${friendScore}/10.`)
}, {
    description: "calculate friendship score with a friend",
    args: ["*friend"]
})

