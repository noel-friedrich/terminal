terminal.addCommand("shi", async function(args) {
    const SHI = args.s ** 2 / args.l
    await sleep(100)

    await terminal.printLine("Okay. I will begin the calculation now...")
    await sleep(1000)

    await terminal.animatePrint("Making progress...")
    await sleep(500)

    await terminal.animatePrint("Almost there...")
    await sleep(1000)

    await terminal.animatePrint("Okay I got it.")
    await sleep(500)

    await terminal.animatePrint("In general, a SHI below 10 is considered instable, a SHI")
    await terminal.animatePrint("below 9 is considered dangerous.")
    await sleep(300)

    await terminal.animatePrint("Everything above 11 is fine and 10-11 is maybe a bit wonky.")
    await sleep(700)

    await terminal.animatePrint("Your result is... ", 50, {newLine: false})
    await sleep(2000)

    terminal.printLine(SHI)
    await sleep(1000)

    const diagnoses = [
        {max: 0, diagnosis: "A negative SHI is quite the achievement. Do Kangaroos live in your place?"},
        {max: 1, diagnosis: "You should officially be considered a skyscraper"},
        {max: 5, diagnosis: "It's generally interesting that you're still alive. You should have fallen over."},
        {max: 6, diagnosis: "Well. You should avoid standing up (in general). Good Luck. You'll need it."},
        {max: 7, diagnosis: "Have you ever considered a wheelchair?"},
        {max: 8, diagnosis: "Are you sure you typed in everything correctly? It seems unlikely that you're alive."},
        {max: 8.5, diagnosis: "You're extremely likely to tip over if you go fast around any slight corner."},
        {max: 9, diagnosis: "You're very likely to tip over if you go fast around a corner. Be aware of that!"},
        {max: 9.25, diagnosis: "Ouch. That must have hurt (all the 9523 times you've fallen already). You're instable."},
        {max: 9.5, diagnosis: "Yikes. You're generally pretty instable and people should be afraid around you."},
        {max: 9.75, diagnosis: "It's not very bad but you should consider buying bigger shoes, please. You're instable around corners."},
        {max: 10, diagnosis: "You're almost stable. Drink more milk and maybe you'll not tip over around corners any more!"},
        {max: 10.33, diagnosis: "You should avoid tight corners at all costs, please. You're almost instable!"},
        {max: 10.66, diagnosis: "Okay. All corners that are sharper than 30° should interest you. But other than that, you're fine!"},
        {max: 11, diagnosis: "You're almost in the green zone. Buy a bigger shoe size and you wont tip over anymore."},
        {max: 11.5, diagnosis: "You're as steady as a rock. No chance of tipping over, ever. But still please avoid >80° corners."},
        {max: 12, diagnosis: "You're as steady as a mountain. Almost. But avoid 90° corners."},
        {max: 13, diagnosis: "Wow! You could be Hagrid! You're qualified to help those who need it (SHI under 9)"},
        {max: 14, diagnosis: "Uh-huh. You don't even need this test. You've never tipped over in your life, have you? You're so stable!"},
        {max: 15, diagnosis: "Have you ever considered a career as a structural beam in a skyscraper?"},
        {max: 18, diagnosis: "You're half human half pyramid."},
        {max: 20, diagnosis: "Quite impressive. Tipping you over is like tipping over a flat sheet of paper: impossible!"},
        {max: 100, diagnosis: "Nah. You're lying, right? If I were a life insurance, I'd invest in you!"},
        {max: Infinity, diagnosis: "Have you ever tried getting a negative SHI?"}
    ]

    await terminal.animatePrint("Your Diagnosis is also ready:")
    await sleep(1000)

    let diagnosis = diagnoses[0]
    for (let i = 0; i < diagnoses.length; i++) {
        if (SHI < diagnoses[i].max) {
            diagnosis = diagnoses[i].diagnosis
            break
        }
    }

    await terminal.animatePrint(diagnosis)
}, {
    description: "calculate your SHI (stability height index)",
    args: {
        "s=shoe-size:n:1~99999": "shoe size (european)",
        "l=height:n:1~999999": "body height in centimeters"
    }
})