terminal.addCommand("abinote", async function(args) {
    function punkteInNote(punkte) {
        // could be done with a formula, but this
        // is more readable and less error-prone
        const gradeBorders = {
            300: 4.0, 318: 3.9, 336: 3.8, 354: 3.7,
            372: 3.6, 390: 3.5, 408: 3.4, 426: 3.3,
            444: 3.2, 462: 3.1, 480: 3.0, 498: 2.9,
            516: 2.8, 534: 2.7, 552: 2.6, 570: 2.5,
            588: 2.4, 606: 2.3, 624: 2.2, 642: 2.1,
            660: 2.0, 678: 1.9, 696: 1.8, 714: 1.7,
            732: 1.6, 750: 1.5, 768: 1.4, 786: 1.3,
            804: 1.2, 822: 1.1, 900: 1.0,
        }

        if (punkte > 900) throw new Error(`Too many points (${punkte})`)
        if (punkte < 300) throw new Error(`Too few points (${punkte})`)
        if (punkte !== parseInt(punkte)) throw new Error(`Points must be an integer (${punkte})`)

        for (let i = 0; i < Object.keys(gradeBorders).length; i++) {
            if (punkte <= Object.keys(gradeBorders)[i]) {
                return Object.values(gradeBorders)[i]
            }
        }
    }

    const SCHWERPUNKT = {
        MATHEMATISCH_NATUR: "mathematisch-naturwissenschaftlich",
        SPRACHLICH: "sprachlich",
        GESELLSCHAFTLICH: "gesellschaftlich",
        MUSISCH_KUNSTLICH: "musisch-künstlerisch"
    }

    async function askBool(question) {
        let answer = null
        while (answer === null) {
            answer = (await terminal.prompt(question)).toLowerCase()
            if (answer === "y" || answer === "yes" || answer === "j" || answer === "ja") {
                return true
            } else if (answer === "n" || answer === "no" || answer === "nein") {
                return false
            } else {
                answer = null
            }
        }
    }

    async function chooseBetween(header, options) {
        terminal.printLine(header)
        for (let i = 0; i < options.length; i++) {
            terminal.printLine(`${i + 1}. ${options[i]}`)
        }
        let answer = await terminal.promptNum(
            `Bitte wähle eine Option aus (1-${options.length}): `,
            {min: 1, max: options.length, integer: true}
        ) - 1
        terminal.printLine(`Du hast "${options[answer]}" gewählt.`)
        terminal.addLineBreak()
        return options[answer]
    }

    let schwerpunkt = await chooseBetween("Wähle deinen Schwerpunkt:", Object.values(SCHWERPUNKT))
    let hatErdkundeP3 = false
    if (schwerpunkt == SCHWERPUNKT.GESELLSCHAFTLICH)
        hatErdkundeP3 = await askBool("Hast du Erdkunde als Leistungskurs? (y/n): ")

    function getEinbringungsverpflichtungen(schwerpunkt) {
        let verpflichtungen = []

        const addVerpflichtung = (name, anzahl) => {
            for (let i = 0; i < anzahl; i++) {
                verpflichtungen.push(name + (anzahl > 1 ? ` (${i + 1}. Hj)` : ""))
            }
        }
        
        addVerpflichtung("Deutsch", 4)
        addVerpflichtung("Fremdsprache", 4)
        if (schwerpunkt == SCHWERPUNKT.SPRACHLICH)
            addVerpflichtung("Weitere Fremdsprache", 4)
        addVerpflichtung("Kunst ODER Musik", 2)
        if (!(schwerpunkt == SCHWERPUNKT.GESELLSCHAFTLICH && hatErdkundeP3))
            addVerpflichtung("Politik/Wirtschaft", 2)
        addVerpflichtung("Geschichte", 2)
        addVerpflichtung("Religion ODER Werte und Normen ODER Philosophie", 2)
        addVerpflichtung("Mathematik", 4)
        addVerpflichtung("Naturwissenschaft", 4)
        if (schwerpunkt == SCHWERPUNKT.MATHEMATISCH_NATUR)
            addVerpflichtung("Weitere Naturwissenschaft oder Informatik", 4)
        addVerpflichtung("Seminarfach (Hj mit der Facharbeit)", 1)
        addVerpflichtung("Seminarfach (beliebiges Hj ohne die Facharbeit)", 1)
        if (schwerpunkt == SCHWERPUNKT.GESELLSCHAFTLICH)
            addVerpflichtung("Weitere Fremdsprache ODER weitere Naturwissenschaft ODER Informatik", 2)

        return verpflichtungen
    }

    let einbringungsverpflichtungen = getEinbringungsverpflichtungen(schwerpunkt)

    terminal.printLine("Bitte gib die Punkte für deine Einbringungsverpflichtungen ein:")
    for (let i = 0; i < einbringungsverpflichtungen.length; i++) {
        let note = await terminal.promptNum(`[${(i + 1).toString().padStart(2, "0")}] ${einbringungsverpflichtungen[i]} (1-15): `, {min: 1, max: 15, integer: true})
        einbringungsverpflichtungen[i] = {name: einbringungsverpflichtungen[i], note: note}
    }

}, {
    description: "calculate the finale grade of your german abitur"
})