const getApiUrl = "../spion/api/get.php"
const addApiUrl = "../spion/api/add.php"

terminal.addCommand("spion", async function(args) {
    let result = await fetch(getApiUrl)
    let places = await result.json()
    let placeNames = places.map(place => place.place.toLowerCase())

    if (args.add && args.list) {
        throw new Error("Cannot add and list at the same time")
    }

    if (args.add) {
        let name = await terminal.prompt("Ort Name: ")
        name = name.trim()
        while (name == "" || placeNames.includes(name.toLowerCase())) {
            if (name == "") {
                terminal.printLine("Name darf nicht leer sein", Color.COLOR_1)
            } else {
                terminal.printLine("Name bereits vorhanden", Color.COLOR_1)
            }
            name = await terminal.prompt("Ort Name: ")
            name = name.trim()
        }

        let roles = []
        while (roles.length < 20) {
            let role = await terminal.prompt("Rolle " + (roles.length + 1) + ": ")
            role = role.trim()

            if (role == "") {
                terminal.printError("Name darf nicht leer sein")
                continue
            }

            let roleNames = roles.map(role => role.toLowerCase())
            if (roleNames.includes(role.toLowerCase())) {
                terminal.printError("Name bereits vorhanden")
                continue
            }

            roles.push(role)
        }

        let formData = new FormData()

        formData.append("json", JSON.stringify({
            place: name,
            roles: roles,
        }))

        let result = await fetch(addApiUrl, {
            method: "POST",
            body: formData,
        })

        let json = await result.json()
        if (json.ok) {
            terminal.printSuccess("Ort hinzugefügt")
        } else {
            terminal.printError("Fehler beim hinzufügen: " + json.message)
        }
    } else if (args.list) {
        let place = places.find(place => place.place == args.list)
        if (!place) {
            terminal.print("Ort nicht gefunden", Color.COLOR_1)
            return
        }
        terminal.printLine("Ort: " + place.place, Color.COLOR_1)
        terminal.printLine("Rollen:")
        for (let i = 0; i < place.roles.length; i++) {
            const role = place.roles[i]
            terminal.print(i + 1, Color.COLOR_1)
            terminal.printLine(": " + role)
        }
    } else {
        terminal.printLine("Alle Orte:", Color.COLOR_1)
        for (let i = 0; i < places.length; i++) {
            const place = places[i]
            terminal.print(i + 1, Color.COLOR_1)
            terminal.print(": ")
            terminal.printCommand(place.place, "spion --list \"" + place.place + "\"")
        }
        terminal.addLineBreak()
        terminal.printCommand("Ort hinzufügen", "spion --add")
    }
}, {
    description: "Spiel Spiel Manager",
    args: {
        "?a=add:b": "add a new place",
        "?l=list:s": "list a given places roles"
    },
    isSecret: true
})