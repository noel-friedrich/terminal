terminal.addCommand("panik", async function(args) {
    await terminal.modules.import("game", window)

    terminal.printError("This command is in german.\n", "Warning")

    await terminal.animatePrint("Du hast eine Panikattacke oder fühlst, dass es", 20)
    await terminal.animatePrint("dir nicht gut geht?", 20)
    await sleep(200)
    await terminal.animatePrint("Dann bist du hier richtig!\n", 20)

    terminal.printLine("Wie geht es dir aktuell? Wähle eine option aus:\n")
    terminal.printLine("(a) ich habe eine panikattacke und brauche akut hilfe.")
    terminal.printLine("(b) ich merke dass es sich was aufbaut und will verhindern,")
    terminal.printLine("    dass sich eine Panikattacke aufbaut.\n")

    let answer = (await terminal.prompt("['a' oder 'b']: ")).toLowerCase().trim()
    while (!["a", "b"].includes(answer)) {
        terminal.printError("Die Antwort habe ich nicht verstanden.")
        terminal.printLine("Gib nur den Buchstaben 'a' oder 'b' ein, ohne Anführungszeichen.\n")
        answer = (await terminal.prompt("['a' oder 'b']: ")).toLowerCase().trim()
    }

    if (answer == "a") {

        terminal.print("\nOkay. ")
        terminal.print("Wir schaffen das.\n", undefined, {forceElement: true, element: "b"})
        await terminal.sleep(1000)
        await terminal.animatePrint("Ich starte jetzt einen timer, der die ganze zeit")
        await terminal.sleep(300)
        await terminal.animatePrint("zeigen wird, wie lange wir bisher hier machen:\n")
        await terminal.sleep(2000)
        terminal.scroll()

        let timeOutput = terminal.print("00:00:00:000", undefined, {forceElement: true})
        timeOutput.style.fontSize = "2em"
        const startTime = Date.now()

        function updateTime() {
            const timeDiff = Date.now() - startTime
            let [ms, s, m, h] = [
                (timeDiff % 1000),
                (Math.floor(timeDiff / 1000) % 60),
                (Math.floor(timeDiff / 60000) % 60),
                (Math.floor(timeDiff / 3600000) % 24),
            ].map(n => n.toString().padStart(2, "0"))
            ms = ms.padStart(3, "0")
            timeOutput.textContent = `${h}:${m}:${s}:${ms}`

            terminal.window.requestAnimationFrame(updateTime)
        }

        updateTime()

        await terminal.sleep(2000)
        terminal.printLine("\n\nOkay. Es geht jetzt nur ums Überleben.")
        await terminal.sleep(700)
        await terminal.animatePrint("In deinem Körper wurde gerade Adrenalin")
        await terminal.animatePrint("ausgeschüttet. Das ist nicht schlimm,")
        await terminal.animatePrint("aber verhindert dass du klar denken kannst.\n")
        
        terminal.scroll(); await terminal.sleep(2000)

        await terminal.animatePrint("Wenn du jemanden in deiner Nähe hast oder")
        await terminal.animatePrint("anrufen kannst, wäre jetzt ein guter Zeitpunkt.\n")
        await terminal.animatePrint("Wenn du es gerade nicht kannst oder keiner da ist,")
        await terminal.animatePrint("schaffen wir das jetzt auch zusammen.\n")
        
        terminal.scroll(); await terminal.sleep(2000)

        await terminal.animatePrint("Ab jetzt bitte auf Atemübungen fokussieren!")
        await terminal.animatePrint("Versuche dich auf deinen Atem zu konzentrieren.")
        await terminal.animatePrint("Du schaffst das. Alles ist gut. Du hast eine")
        await terminal.animatePrint("Panikattacke und du wirst *nicht* sterben.\n")
        terminal.scroll(); await terminal.sleep(1000)
        await terminal.animatePrint("Deine Sinne sind gerade völlig außer rand und band.")
        terminal.scroll(); await terminal.sleep(1000)
        await terminal.animatePrint("Das fühlt sich scheiße an, aber das geht weg.")
        terminal.scroll(); await terminal.sleep(1000)
        await terminal.animatePrint("Versuche so ruhig wie nur möglich zu atmen.\n")
        terminal.scroll(); await terminal.sleep(1000)

        await terminal.animatePrint("Ich habe hier eine Grafik für dich, mit der es")
        await terminal.animatePrint("dir vielleicht einfacher fällt, rythmisch zu atmen.")

        terminal.scroll(); await terminal.sleep(1000)

        const canvas = printSquareCanvas({widthChars: 30})
        const context = canvas.getContext("2d")

        function easeInOut(t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t
            return -1 / 2 * ((--t) * (t - 2) - 1)
        }
        
        const startCanvasTime = Date.now()
        function redrawCanvas() {
            const middle = new Vector2d(canvas.width / 2, canvas.height / 2)
            const breathTime = (Date.now() - startCanvasTime) % 10000
            let t = 0
            if (breathTime < 5000) {
                t = breathTime / 5000
            } else {
                t = 1 - (breathTime - 5000) / 5000
            }

            const cirlceMaxRadius = Math.min(canvas.width, canvas.height) / 2.5

            context.clearRect(0, 0, canvas.width, canvas.height)
            const cirlceSize = easeInOut(t * 0.9 + 0.1)
            context.beginPath()
            context.arc(middle.x, middle.y, cirlceSize * cirlceMaxRadius, 0, Math.PI * 2)
            context.fillStyle = "rgba(255, 255, 255, 0.8)"
            context.fill()
            context.lineWidth = 3
            context.strokeStyle = "black"
            context.stroke()

            const timeDiff = Date.now() - startTime
            let [ms, s, m, h] = [
                (timeDiff % 1000),
                (Math.floor(timeDiff / 1000) % 60),
                (Math.floor(timeDiff / 60000) % 60),
                (Math.floor(timeDiff / 3600000) % 24),
            ].map(n => n.toString().padStart(2, "0"))
            ms = ms.padStart(3, "0")
            const timeString = `${h}:${m}:${s}:${ms}`
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.font = "20px monospace"
            context.fillStyle = "blue"
            context.fillText(timeString, middle.x, middle.y)

            terminal.window.requestAnimationFrame(redrawCanvas)
        }

        terminal.window.requestAnimationFrame(redrawCanvas)

        terminal.scroll(); await terminal.sleep(1000)

        await terminal.animatePrint("\n\nDenk dran: in ein paar minuten ist das vorbei.")
        await terminal.animatePrint("Es *wird* besser, du wirst *nicht* sterben.")
        await terminal.animatePrint("Das Gefühl ist ganz normal. Nach ungefähr 5 Minuten")
        await terminal.animatePrint("Sollte die akute Panik weg sein. Du wirst wieder")
        await terminal.animatePrint("Denken können. Bis dahin: Atmen!")

        await terminal.animatePrint("\nIch melde mich wieder in 8 minuten. Bleib dran.")
        terminal.scroll()
        await sleep(1000 * 60 * 8)

        await terminal.animatePrint("\nOkay. Das waren 8 Minuten.\n")
        await sleep(1000)
        await terminal.animatePrint("Hier endet die Akuthilfe. Aber!:")
        await terminal.animatePrint("Die Panikattacke ist noch nicht ganz vorbei.")
        await terminal.animatePrint("Die Grafiken laufen weiter, ruf am besten")
        await terminal.animatePrint("Personen an, die die jetzt helfen können.\n")

        terminal.scroll(); await sleep(1000)
        await terminal.animatePrint("Wenn die Panik wieder kommt, mache weiter")
        await terminal.animatePrint("die Übungen. Du schaffst das.\n")

        terminal.scroll(); await sleep(1000)
        await terminal.animatePrint("Wenn du Tipps brauchst, was du jetzt tun kannst,")
        await terminal.animatePrint("tippe nochmal den Befehl ein und öffne Option (b).\n")
        terminal.scroll(); await sleep(1000)

        await terminal.animatePrint("Viel Erfolg (ruf Leute an!)")

        terminal.scroll()

    } else {

        terminal.print("\nOkay. ")
        terminal.print("Wir schaffen das!\n", undefined, {forceElement: true, element: "b"})
        terminal.scroll()
        await terminal.sleep(1000)

        await terminal.animatePrint("Das schwerste hast du gerade schon geschafft:")
        await terminal.animatePrint("Du hast erkannt, dass eine Panikattacke kommt")
        await terminal.animatePrint("und machst jetzt etwas dagegen. Perfekt!\n")

        terminal.scroll()
        await terminal.sleep(3000)
        await terminal.animatePrint("Wenn du merkst, dass es schlimm wird, lad")
        await terminal.animatePrint("die Website neu und führ den Befehl nochmal")
        await terminal.animatePrint("aus und öffne Option (a). Alles gut.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Hm. Jetzt musst du etwas machen, damit es dir")
        await terminal.animatePrint("besser geht. Am besten rufst du jemanden an")
        await terminal.animatePrint("oder frag jemanden in deiner Nähe, ob ihr")
        await terminal.animatePrint("quatschen wollt. Es hilft, zu erklären, dass")
        await terminal.animatePrint("es dir komisch geht. Alles gut.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Auch wenn du noch keine Panikattacke hast,")
        await terminal.animatePrint("lohnt es sich jetzt jemanden anzuschreiben.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Wenn du wirklich niemanden hast, z.b. weil")
        await terminal.animatePrint("es Nacht ist, dann machen wir jetzt hier weiter.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Was würde dir jetzt gut tun? Trink Wasser!")
        await terminal.animatePrint("Vielleicht hilft es, aufzustehen?")
        await terminal.animatePrint("Lauf ein paar Schritte, vielleicht kannst du")
        await terminal.animatePrint("sogar Sport machen? Das soll helfen? Glaube ich.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Mach nichts langweiliges zur Ablenkung. Instagram")
        await terminal.animatePrint("ist keine gute Idee. Dein Lieblingsfilm und")
        await terminal.animatePrint("Lieblingsmusik aber vielleicht schon?\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Mir hilft es, Schach auf ")
        terminal.printLink("chess.com", "https://chess.com", undefined, false)
        await terminal.animatePrint(" zu spielen.")
        await terminal.animatePrint("Oder einen Zauberwürfel zu lösen.")
        await terminal.animatePrint("Oder einfach nur jemanden anzuschreiben.\n")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Wahrscheinlich ist dein Körper gerade")
        await terminal.animatePrint("sehr angespannt. Mir hilft es sehr zu lachen!")
        await terminal.animatePrint("Hier eine auswahl an lustigen Videos (Playlist):")
        terminal.printLink("youtube.com/playlist?list=PLZX43-yn58b1WVAWo8TRpL1uJ5yFRioZ1",
            "https://www.youtube.com/playlist?list=PLZX43-yn58b1WVAWo8TRpL1uJ5yFRioZ1")

        terminal.scroll()
        await terminal.sleep(3000)
    
        await terminal.animatePrint("\nMehr Tipps habe ich gerade nicht.")
        await terminal.animatePrint("Bitte schreib jemanden an! Du schaffst das!")

        terminal.scroll()
        await terminal.sleep(3000)

        await terminal.animatePrint("Wenn es dir schlecht geht, führ den")
        await terminal.animatePrint("Befehl nochmal aus und wähle option (a).")
        await terminal.animatePrint("DU SCHAFFST DAS!")
    }
}, {
    description: "[german command] mäßige hilfe bei einer panikattacke",
    isSecret: true
})