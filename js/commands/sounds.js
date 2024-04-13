terminal.addCommand("sounds", async function(args) {
    if (args.random) {
        for (let i = 0; i < args.length; i++) {
            args.text += args.alphabet[Math.floor(Math.random() * args.alphabet.length)]
        }
    }

    let context = new AudioContext(),
        osc = context.createOscillator(),
        gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    const alphabet = " abcdefghijklmnopqrstuvwxyz.,\n"
    const frequencies = []

    for (let letter of args.text) {
        if (!alphabet.includes(letter)) {
            throw new Error(`Unknown Character: "${letter}"`)
        }

        const indexInAlphabet = alphabet.indexOf(letter)

        if (indexInAlphabet == 0) {
            frequencies.push(0)
        } else {
            frequencies.push(frequencyFromNoteOffset(indexInAlphabet))
        }
    }

    osc.start(0)

    terminal.onInterrupt(() => {
        osc.stop()
    })

    const output1 = terminal.print("", undefined, {forceElement: true})
    const output2 = terminal.print("", new Color(0, 0, 255), {forceElement: true})
    const output3 = terminal.print("", undefined, {forceElement: true})

    function updateOutput(index) {
        output1.textContent = args.text.slice(0, index)
        output2.textContent = args.text[index]
        output3.textContent = args.text.slice(index + 1, args.text.length)
    }
    
    for (let i = 0; i < frequencies.length; i++) {
        updateOutput(i)
        const freq = frequencies[i]

        osc.frequency.value = freq
    
        if (freq != 0) {
            gain.gain.setValueAtTime(1, context.currentTime) 
            gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + args.interval / 1000)
        } else {
            gain.gain.exponentialRampToValueAtTime(0.000001, context.currentTime + args.interval / 1000)
        }

        await sleep(args.interval)
    }

    osc.stop()

}, {    
    description: "make sounds",
    args: {
        "*text:s": "text to speak",
        "?i=interval:i:1~999999": "interval in ms between letters",
        "?r=random:b": "make random",
        "?l=length:i:1~99999": "length of random notes",
        "?a=alphabet:s": "alphabet of random letters"
    },
    defaultValues: {
        text: "",
        interval: 500,
        length: 10,
        alphabet: " abcdefghijklmnopqrstuvwxyz.,\n"
    }
})