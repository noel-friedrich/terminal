terminal.addCommand("compliment", function() {
    function startsWithVowel(word) {
        return (
            word.startsWith("a")
            || word.startsWith("e")
            || word.startsWith("i")
            || word.startsWith("o")
            || word.startsWith("u")
        )
    }

    const adjectives = [
        "cool", "fresh", "awesome", "beautiful",
        "fantastic", "good", "wonderful", "colorful"
    ], nouns = [
        "queen", "goddess", "person", "king",
        "god", "human", "princess", "prince"
    ], sentences = [
        "you are a<n> <adjective> <noun>. happy to have you here!",
        "a<n> <adjective> <noun>. that's what you are!",
        "you, <noun>, are <adjective>!",
        "i'm going to call you <noun>, because you are <adjective>"
    ], choice = l => l[Math.floor(Math.random() * l.length)]

    let sentence = choice(sentences)
    let lastAdjective = choice(adjectives)
    while (/.*<(?:adjective|n|noun)>.*/.test(sentence)) {
        sentence = sentence.replace(/<n>/, startsWithVowel(lastAdjective) ? "n": "")
        sentence = sentence.replace(/<adjective>/, lastAdjective)
        sentence = sentence.replace(/<noun>/, choice(nouns))
        lastAdjective = choice(adjectives)
    }
    terminal.printLine(sentence)
}, {
    description: "get info about yourself"
})

