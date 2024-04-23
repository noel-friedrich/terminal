terminal.addCommand("config", async function(args) {
    const properties = [
        {
            id: "foreground",
            name: "Foreground Color",
            value: () => terminal.data.foreground.string.hex,
            prettyValue: () => terminal.data.foreground.toString(),
            edit: v => terminal.data.foreground = v,
            reset: () => terminal.data.resetProperty("foreground"),
            regex: /^#[0-9a-f]{6}$/,
            unitComment: "in hex"
        },
        {
            id: "background",
            name: "Background Color",
            value: () => terminal.data.background.string.hex,
            prettyValue: () => terminal.data.background.toString(),
            edit: v => terminal.data.background = v,
            reset: () => terminal.data.resetProperty("background"),
            regex: /^#[0-9a-f]{6}$/,
            unitComment: "in hex"
        },
        {
            id: "font",
            name: "Terminal Font",
            info: "Unknown fonts will be replaced by the browser's default font.",
            value: () => terminal.data.font,
            prettyValue: () => terminal.data.font,
            edit: v => terminal.data.font = v,
            reset: () => terminal.data.resetProperty("font"),

        },
        {
            id: "color1",
            name: "Primary Accent Color",
            value: () => terminal.data.accentColor1.string.hex,
            prettyValue: () => terminal.data.accentColor1.toString(),
            edit: v => terminal.data.accentColor1 = v,
            reset: () => terminal.data.resetProperty("accentColor1"),
            regex: /^#[0-9a-f]{6}$/,
            unitComment: "in hex"
        },
        {
            id: "color2",
            name: "Secondary Accent Color",
            value: () => terminal.data.accentColor2.string.hex,
            prettyValue: () => terminal.data.accentColor2.toString(),
            edit: v => terminal.data.accentColor2 = v,
            reset: () => terminal.data.resetProperty("accentColor2"),
            regex: /^#[0-9a-f]{6}$/,
            unitComment: "in hex"
        },
        {
            id: "storage",
            name: "Storage Size",
            warning: "This property cannot be increased indefinitely. Most browsers only\nsupport up to 5 Megabytes of total local storage. Going near this limit may break things!",
            value: () => terminal.data.storageSize,
            prettyValue: () => terminal.fileSystem.filesizeStr(terminal.data.storageSize),
            edit: v => terminal.data.storageSize = v,
            reset: () => terminal.data.resetProperty("storageSize"),
            regex: /^[0-9]+$/,
            unitComment: "in bytes"
        },
        {
            id: "history",
            name: "Max History Length",
            warning: "The history uses up a lot of space. Localstorage space is valuable, don't increase it too much.",
            value: () => terminal.data.maxHistoryLength,
            prettyValue: () => terminal.data.maxHistoryLength + " items",
            edit: v => terminal.data.maxHistoryLength = v,
            reset: () => terminal.data.resetProperty("maxHistoryLength"),
            regex: /^[0-9]+$/,
        },
    ]

    if (args.edit) {
        const property = properties.find(p => p.id == args.edit)
        if (!property) {
            // should never happen, still there just in case
            // ( should never happen as arg is set as enum and the           )
            // ( TerminalParser should make sure to only allow valid options )
            throw new Error(`Unknown Property "${args.edit}"`)
        }

        terminal.print("Property Name: ")
        terminal.printLine(property.name, Color.COLOR_1)

        if (property.prettyValue() != property.value()) {
            terminal.printLine(`Prettified Value: ${property.prettyValue()}`)
            terminal.printLine(`Actual Value: ${property.value()}`)
        } else {
            terminal.printLine(`Value: ${property.value()}`)
        }

        if (property.warning) {
            terminal.print("\nWarning", Color.hex("#ff9800"))
            terminal.printLine(`: ${property.warning}`)
        }
        
        if (property.info) {
            terminal.print("\nInfo", Color.COLOR_1)
            terminal.printLine(`: ${property.info}`)
        }

        terminal.addLineBreak()

        let value = undefined
        terminal.printLine("Type \"<default>\" to set it to the default value")
        while (true) {
            const promptUnit = property.unitComment ? `(${property.unitComment})` : ""
            value = await terminal.prompt(`New Value ${promptUnit}: `)
            if (value == "<default>") {
                property.reset()
                terminal.printSuccess(`Successfully reset the value to it's default (${property.value()}).`)
                return
            }

            if (!property.regex || (property.regex && property.regex.test(value))) {
                break
            } else {
                terminal.printError(`Invalid Value! (RegEx: ${property.regex})`)
            }
        }

        property.edit(value)
        terminal.printSuccess(`Successfully edited ${property.name}`)

    } else {
        terminal.printTable(properties.map(p => [p.id, p.name, p.prettyValue()]), ["id", "name", "value"])
        terminal.print("\nTo edit a property, use ")
        terminal.printLine("config <id>", Color.COLOR_1)
    }
}, {
    description: "manage the terminal configuration",
    args: {
        "?e=edit:e:foreground|background|font|color1|color2|storage|history": "edit a given property",
    }
})