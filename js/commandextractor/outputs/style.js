terminal.addCommand("style", async function(args) {
    class Preset {  

        constructor(b=undefined, f=undefined, c1="yellow", c2="rgb(139, 195, 74)", btn=null) {
            this.background = b
            this.foreground = f
            this.accentColor1 = c1
            this.accentColor2 = c2
            this.btnColor = btn || b || "black"
        }

    }

    let PRESETS = {}
    PRESETS["normal"] = new Preset("rgb(3,3,6)", "white")
    PRESETS["ha©k€r"] = new Preset("black", "#4aff36", "#20C20E", "#20C20E")
    PRESETS["light"] = new Preset("#255957", "#EEEBD3")
    PRESETS["fire"] = new Preset("linear-gradient(180deg, red, yellow)", "white")
    PRESETS["phebe"] = new Preset("linear-gradient(to right, red,orange,yellow,lightgreen,blue,indigo,violet)", "white")
    PRESETS["purple"] = new Preset("#371E30", "#F59CA9", "#DF57BC", "#F6828C")
    PRESETS["slate"] = new Preset("#282828", "#ebdbb2", "#d79921", "#98971a")
    PRESETS["red"] = new Preset("#e74645", "white", "#fdfa66", "#fdfa66", "#e74645")
    PRESETS["cold"] = new Preset("#3c2a4d", "#e0f0ea", "#95adbe", "#95adbe")

    if (args.preset == undefined) {
        terminal.printLine("There are a few presets to choose from:")
        let lineWidth = 0
        for (let presetName of Object.keys(PRESETS)) {
            lineWidth += (presetName + " ").length
            terminal.printCommand(presetName + " ", `style ${presetName}`, Color.WHITE, false)
            if (lineWidth > 35) {
                terminal.printLine()
                lineWidth = 0
            }
        }
        terminal.printLine()
        return
    }
    if (!(args.preset in PRESETS))
        throw new Error(`Unknown preset "${args.preset}"`)
    let attributes = ["background", "foreground", "accentColor1", "accentColor2", "btnColor"]
    let preset = PRESETS[args.preset]
    for (let attribute of attributes) {
        if (preset[attribute] == undefined)
            continue
        terminal[attribute] = preset[attribute]
    }
}, {
    description: "change the style of the terminal",
    args: ["?preset"],
    standardVals: {
        preset: undefined
    }
})

