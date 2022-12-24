terminal.addCommand("style", async function(args) {
    class Preset {  

        constructor(b=undefined, f=undefined, c1=Color.rgb(255, 255, 0), c2=Color.rgb(139, 195, 74)) {
            this.background = b
            this.foreground = f
            this.accentColor1 = c1
            this.accentColor2 = c2
        }

    }

    let PRESETS = {}
    PRESETS["normal"] = new Preset(Color.rgb(3, 3, 6), Color.WHITE)
    PRESETS["ha©k€r"] = new Preset(Color.BLACK, Color.hex("#4aff36"), Color.hex("#20C20E"), Color.hex("#20C20E"))
    PRESETS["light"] = new Preset(Color.hex("#255957"), Color.hex("#EEEBD3"))
    PRESETS["purple"] = new Preset(Color.hex("#371E30"), Color.hex("#F59CA9"), Color.hex("#DF57BC"), Color.hex("#F6828C"))
    PRESETS["slate"] = new Preset(Color.hex("#282828"), Color.hex("#ebdbb2"), Color.hex("#d79921"), Color.hex("#98971a"))
    PRESETS["red"] = new Preset(Color.hex("#e74645"), Color.WHITE, Color.hex("#fdfa66"), Color.hex("#fdfa66"), Color.hex("#e74645"))
    PRESETS["cold"] = new Preset(Color.hex("#3c2a4d"), Color.hex("#e0f0ea"), Color.hex("#95adbe"), Color.hex("#95adbe"))

    if (args.preset == null) {
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
    let attributes = ["background", "foreground", "accentColor1", "accentColor2"]
    let preset = PRESETS[args.preset]
    for (let attribute of attributes) {
        if (preset[attribute] == undefined)
            continue
        terminal.data[attribute] = preset[attribute]
    }
}, {
    description: "change the style of the terminal",
    args: ["?preset"],
    standardVals: {
        preset: null
    }
})

