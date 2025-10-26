terminal.addCommand("barrel-roll", async function(args) {
    let frames = [
        { transform: "rotate(0deg)" },
        { transform: "rotate(360deg)" }
    ]

    if (args.counterclockwise) {
        frames = frames.reverse()
    }

    await terminal.document.body.animate(frames, {
        duration: args.duration,
        iterations: args.repeats,
        easing: "ease-in-out"
    }).finished
}, {
    description: "Do a barrel roll!",
    args: {
        "?d=duration:i:100~5000": "Duration of the barrel roll in milliseconds",
        "?r=repeats:i:1~10": "Number of times to do a barrel roll",
        "?c=counterclockwise:b": "If set, does the barrel roll counterclockwise",
    },
    defaultValues: {
        duration: 2000,
        repeats: 1,
    }
})