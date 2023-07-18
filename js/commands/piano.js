const asciiPiano = `+-+---+---+-+-+---+---+---+-+-+---+---+-+
| | C | D | | | F | G | A | | | C | D | |
| | # | # | | | # | # | # | | | # | # | |
| |   |   | | |   |   |   | | |   |   | |
| | q | w | | | r | t | z | | | i | o | |
| +---+---+ | +---+---+---+ | +---+---+ |
|   |   |   |   |   |   |   |   |   |   |
| C | D | E | F | G | A | H | C | D | E |
|   |   |   |   |   |   |   |   |   |   |
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
+---+---+---+---+---+---+---+---+---+---+
      < Press keys to play notes. >      
      
Star Wars (Main Theme):   1 5 4-3-2 8 5 4-3-2 8 5 4-3-4-2
Star Wars (Force Theme):  36 7 8-9-8 3 3-6 7 8 3 8 6 0 9
Happy Birthday:           112143 112154 1186432 zz6454
Avengers Theme:           2 22 65 4 3 2, 22 67 5 6
Twinkle Twinkle:          1 1 5 5 6 6 5, 4 4 3 3 2 2 1
Harry Potter:             36 876 09 7 6 875 z3
Shrek Intro (All Star):   r i-zztrr 7-zzttrr izztrrtw
Country Roads:            123 312 321 356 6553 2123 211 121
Despacito:
  8 7 63 3333 6666 6564 4444 66667 8 5 5555 888 99 7 8 7 6 3
Disney's Up Theme:
  4643 4632 2421 265 265 4-2 4543 3531 8-0-8-7
USSR Anthem:
  8 58 567 336 545 11 2 234 456 789
  550 989 558 767 336 545 118 7650`

terminal.addCommand("piano", async function(args) {
    const notesToUrl = {
        "C": "https://carolinegabriel.com/demo/js-keyboard/sounds/040.wav",
        "C#": "https://carolinegabriel.com/demo/js-keyboard/sounds/041.wav",
        "D": "https://carolinegabriel.com/demo/js-keyboard/sounds/042.wav",
        "D#": "https://carolinegabriel.com/demo/js-keyboard/sounds/043.wav",
        "E": "https://carolinegabriel.com/demo/js-keyboard/sounds/044.wav",
        "F": "https://carolinegabriel.com/demo/js-keyboard/sounds/045.wav",
        "F#": "https://carolinegabriel.com/demo/js-keyboard/sounds/046.wav",
        "G": "https://carolinegabriel.com/demo/js-keyboard/sounds/047.wav",
        "G#": "https://carolinegabriel.com/demo/js-keyboard/sounds/048.wav",
        "A": "https://carolinegabriel.com/demo/js-keyboard/sounds/049.wav",
        "A#": "https://carolinegabriel.com/demo/js-keyboard/sounds/050.wav",
        "H": "https://carolinegabriel.com/demo/js-keyboard/sounds/051.wav",
        "C2": "https://carolinegabriel.com/demo/js-keyboard/sounds/052.wav",
        "C2#": "https://carolinegabriel.com/demo/js-keyboard/sounds/053.wav",
        "D2": "https://carolinegabriel.com/demo/js-keyboard/sounds/054.wav",
        "D2#": "https://carolinegabriel.com/demo/js-keyboard/sounds/055.wav",
        "E2": "https://carolinegabriel.com/demo/js-keyboard/sounds/056.wav",
        "F2": "https://carolinegabriel.com/demo/js-keyboard/sounds/057.wav",
    }

    const audioElements = {}
    for (let note in notesToUrl) {
        audioElements[note] = new Audio(notesToUrl[note])
        audioElements[note].preload = true
    }

    const keysToNotes = {
        "1": "C", "q": "C#", "2": "D", "w": "D#", "3": "E",
        "4": "F", "r": "F#", "5": "G", "t": "G#", "6": "A",
        "z": "A#", "7": "H", "8": "C2", "i": "C2#", "9": "D2",
        "o": "D2#", "0": "E2",
    }

    let running = true
    terminal.onInterrupt(() => running = false)

    terminal.printLine(asciiPiano)
    terminal.scroll()

    terminal.document.addEventListener("keydown", function(event) {
        if (!running) return
        if (event.repeat) return
        if (event.key in keysToNotes) {
            // play even if already playing
            let note = keysToNotes[event.key]
            let audioElement = audioElements[note]
            audioElement.currentTime = 0
            audioElement.play()
        }
    })

    while (running) {
        await sleep(100)
    }
}, {
    description: "play a piano with your keyboard"
})