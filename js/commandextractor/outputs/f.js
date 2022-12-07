terminal.addCommand("f", function(args) {
    const customFriendScores = {
        "julius": 10.00,
        "julius16": 10.00,
        "klschlitzohr": 10.00,
        "phebe": 10.00,
        "justus": 10.00,
        "erik": 9.80,
        "zoe": 10.00
    }
    
    function randomFriendScore(friendName) {
        function cyrb128(str) {
            let h1 = 1779033703, h2 = 3144134277,
                h3 = 1013904242, h4 = 2773480762;
            for (let i = 0, k; i < str.length; i++) {
                k = str.charCodeAt(i);
                h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
                h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
                h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
                h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
            }
            h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
            h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
            h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
            h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
            return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
        }
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }
        return Math.round((mulberry32(cyrb128(friendName)[0])() * 8 + 2) * 100) / 100
    }

    let friendName = args.friend.toLowerCase()
    let friendScore = randomFriendScore(friendName)

    if (friendName in customFriendScores) friendScore = customFriendScores[friendName]

    terminal.printf`Friendship-Score with ${{[Color.ORANGE]: args.friend}}: ${{[Color.COLOR_1]: String(friendScore) + "/10"}}\n`
}, {
    description: "calculate friendship score with a friend",
    args: ["friend"]
})

