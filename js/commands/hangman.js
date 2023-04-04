const englishWords = [
    "spokesman", "slots", "man", "targets", "sec", "reflects", "constitutional", "hereby", "progressive", 
    "authors", "secrets", "basically", "wild", "beautiful", "theatre", "cry", "vhs", "fraction", "breakfast", "meal", "far", 
    "out", "glow", "literally", "specialist", "touch", "coastal", "ala", "ingredients", "medal", "adsl", "extract", "corresponding", 
    "twelve", "wizard", "micro", "cartoon", "steering", "moved", "inspection", "jul", "jpeg", "christopher", "index", 
    "value", "initially", "motivated", "threads", "friends", "worldwide", "frontier", "intense", "proprietary", "loaded", 
    "otherwise", "spider", "civilian", "detect", "tulsa", "closely", "trick", "expenditure", "responses", "deleted", "pubmed", 
    "listening", "thrown", "rosa", "relief", "magical", "thickness", "zone", "prot", "lectures", "prove", "published", "crap", 
    "allah", "dimensions", "panties", "perl", "ricky", "front", "tradition", "favourites", "naples", "sleep", "anime", 
    "introduces", "classical", "ntsc", "breeds", "city", "casey", "printable", "radar", "spend", "signed", "claimed", 
    "anymore", "accident", "which", "crossword", "evening", "iran", "matters", "justice", "sarah", "textbook", 
    "silly", "follows", "iraqi", "butts", "discrete", "pod", "afraid", "error", "homeless", "tracker", "optimize", "infected", 
    "side", "nice", "knock", "clinic", "diana", "reputation", "representation", "lyric", "compensation", "std", 
    "uploaded", "possess", "balls", "bon", "until", "info", "legs", "section", "lodging", "gallery", "allows", "attachments", 
    "mini", "mighty", "characterized", "mit", "restore", "swiss", "profiles", "herald", "henderson", "bedford", "peru", "jerry", 
    "movements", "condos", "asn", "annotation", "expand", "electron", "photoshop", "inquire", "anybody", "clip", "formed", 
    "processes", "casa", "cassette", "part", "inch", "difference", "dump", "carter", "knows", "undertake", "twisted", "were", 
    "rover", "versions", "farmers", "cartridges", "permit", "wolf", "decimal", "millions", "republic", "promotions", "photographers", 
    "unlock", "mono", "deck", "boots", "repair", "varieties", "sophisticated", "impacts", "liberal", "investment", "training", 
    "republicans", "fifth", "actor", "skating", "acts", "operated", "clear", "swaziland", "dylan", "nation", "aud", "bizrate", 
    "harm", "approaches", "martin", "confused", "pharmaceutical", "viking", "tunisia", "howto", "viagra", "conceptual", "downtown", 
    "geek", "fell", "observations", "managed", "select", "outer", "calculator", "barriers", "attributes", "rules", "spy", 
    "close", "foul", "wheels", "warrior", "bandwidth", "compressed", "bond", "creature", "minor", "mysql", "tuition", "invitations", 
    "elsewhere", "girls", "identical", "captured", "corporation", "ellis", "fifteen", "cds", "culture", "teeth", "frozen", 
    "rugs", "explained", "pop", "deutsch", "replace", "regulation", "against", "prominent", "higher", "arena", "commonly", 
    "int", "sucks", "equations", "enjoying", "marcus", "assembled", "denmark", "edinburgh", "purchasing", "printer", "puts", 
    "delivered", "oaks", "implement", "controller", "pets", "numerous", "celebs", "actors", "lottery", "biographies", "surprising", 
    "situated", "design", "penalties", "sheer", "insert", "craps", "report", "endorsement", "manage", "award", "medicines", 
    "degree", "farm", "skin", "tongue", "flight", "upload", "portuguese", "activities", "bound", "mongolia", "internship", 
    "three", "boys", "spray", "tests", "ppc", "shades", "consequence", "institute", "wang", "poly", "pins", "notion", "ever", 
    "starting", "yea", "somehow", "visibility", "surplus", "seeing", "noble", "andrea", "applied", "mpg", "ear", "normal", 
    "victoria", "necessity", "never", "juvenile", "bhutan", "techniques", "temple", "qualification", "trial", "carolina", 
    "potential", "diagnosis", "butter", "ant", "belt", "titles", "consideration", "unexpected", "evanescence", "sunrise", 
    "gone", "opportunity", "resort", "occurrence", "dictionaries", "amp", "commissioners", "atlantic", "von", "scanner", 
    "worn", "hollywood", "corporations", "documentary", "shift", "ambien", "hobby", "organisations", "poet", "oliver", "weekly", 
    "particular", "mark", "permitted", "wallpaper", "output", "wage", "donna", "hammer", "spirit", "university", 
    "licensed", "girl", "navy", "blogger", "poem", "descending", "powder", "cad", "website", "graphical", "root", 
    "needed", "printed", "recreational", "ordered", "mounting", "arcade", "dictionary", "lately", "computer", "responded", 
    "much", "saves", "street", "modified", "pretty", "denied", "happy", "pose", "mice", "desert", "package", "rewards", "than", 
    "pickup", "instantly", "relatives", "flooring", "better", "cycle", "indie", "leg", "health", "magnificent", "hacker", 
    "databases", "classics", "translator", "ian", "shine", "assignment", "verify", "chevrolet", "vendors", "applicants", 
    "legislation", "prozac", "beta", "blend", "soup", "perfect", "midwest", "matter", "kathy", "snake", "treo", "features", 
    "howard", "discounted", "probably", "patient", "polyphonic", "shoot", "ram", "thousands", "couples", "gabriel", "dense", 
    "plugins", "alumni", "terrorism", "parental", "deer", "build", "counted", "tokyo", "promotion", "sensitive", 
    "improved", "ultimate", "alloy", "scroll", "iceland", "knife", "featuring", "nodes", "helmet", "maintained", "male", 
    "adults", "logical", "kenneth", "sticker", "band", "sciences", "mild", "holders", "stable", "singapore", "recipients", 
    "rolling", "ranked", "wheat", "main", "slovenia", "severe", "handles", "forecasts", "fabric", "presence", 
    "mediawiki", "slope", "situations", "displays", "api", "sympathy", "manga", "straight", "obtaining", "preferred", "locking", 
    "performance", "guarantees", "approval", "davis", "activation", "calcium", "coal", "raises", "characteristics", 
    "behavioral", "sri", "reached", "takes", "reflect", "linear", "poverty", "canvas", "controversial", "drink", "cashiers", 
    "meals", "enables", "shortcuts", "budgets", "articles", "altered", "valve", "sex", "accessories", "advice", "countries", 
    "indicators", "unfortunately", "budapest", "vacancies", "argue", "den", "potter", "victor", "able", "dealtime", "idle", 
    "tax", "lucky", "reservations", "along", "spouse", "funding", "pre", "wound", "job", "exploring", "threatening", "ceo", 
    "scores", "stages", "combinations", "would", "satisfied", "seemed", "gratuit", "miracle", "poor", "abortion", 
    "interaction", "developer", "original", "trail", "wait", "lawyer", "pressure", "hint", "estimates", "arranged", 
    "bye", "sim", "therapy", "commercial", "ghost", "withdrawal", "finishing", "whereas", "vocal", "began", "shape", "language", 
    "forty", "told", "thinks", "rent", "patents", "chem", "asset", "officials", "drove", "deutsche", "central", "bargain", 
    "arbitration", "pull", "females", "ball", "chi", "compact", "path", "disorder", "revolution", "marie", "cemetery", "earliest", 
    "direction", "slide", "books", "consequently", "gourmet", "sports", "bite", "material", "nickname", 
    "burning", "caroline", "titten", "addition", "juice", "oscar", "measures", "pharmacology", "assumes", "professor", "adjustments", 
    "yeast", "monte", "magazines", "blessed", "partially", "whole", "reform", "distinction", "annex", "arm", "usage", "sen", 
    "buried", "stuffed", "continues", "game", "inf", "minimum", "inquiry", "visits", "kim", "campaigns", "album", "teen", 
    "ethical", "sic", "architecture", "judge", "nursery", "half", "textile", "mambo", "politicians", "offline", "you", "consistency", 
    "refused", "crimes", "cruz", "maintains", "prepare", "beatles", "manor", "things", "standard", "adaptation", "cons", 
    "market", "crops", "chuck", "configure", "scheme", "platforms", "obvious", "atm", "wants", "guides", "statewide", "goods", 
    "supported", "tennessee", "chaos", "zum", "rights", "hamburg", "bachelor", "infant", "take", "espn", "died", "decision", 
    "importantly", "defining", "wallpapers", "prep", "sept", "sapphire", "careful", "albany", "holly", "liberty", "appropriations", 
    "depends", "heavily", "shemales", "undergraduate", "relaxation", "injury", "placement", "stress", "day", "recipient", 
    "achieving", "header", "explanation", "figures", "grove", "amd", "currently", "immigrants", 
    "strings", "protein", "lung", "spending", "donation", "inter", "belly", "product", "tent", "instead", 
    "css", "fuzzy", "observed", "leasing", "several", "moldova", "remove", "complaint", "correct", "accountability", "bolt", 
    "second", "serial", "wrapped", "screw", "sake", "tasks", "recommend", "spring", "bad", "grants", "ken", "illustration", 
    "upgrades", "chronicles", "agencies", "missile", "limits", "varying", "laundry", "emission", "bow", "honey", "expenditures", 
    "library", "xxx", "merit", "selections", "wearing", "differently", "forests", "pounds", "restrict", "containing", "apnic", 
    "florence", "other", "ddr", "interracial", "initiated", "ins", "units", "attempt", "ran", "railroad", "appearance", "over", 
    "trials", "paint", "performs", "deborah", "tears", "merely", "none", "realtors", "ryan", "gpl", "def", "queens", "jewish", 
    "receive", "cables", "tuner", "intelligent", "louis", "beds", "restricted", "gangbang", "earth", "internet", "best", 
    "master", "screensavers", "continuity", "swift", "luis", "iso", "shall", "jane", "fool", "posts", "different", "teacher", 
    "manual", "scholarships", "mad", "clearing", "improvements", "lancaster", "federation", "nut", "ceiling", "furnishings", 
    "twice", "concepts", "francis", "give", "licenses", "down", "context", "scored", "deficit", "dos", "demands", "spam", 
    "tom", "suggest", "bind", "rich", "perspective", "thanksgiving", "dave", "metallica", "greece", "translation", "adventure", 
    "rail", "plaza", "stability", "chart", "paperback", "component", "abuse", "tel", "daniel", "backing", "feelings", "rid", 
    "skills", "reed", "filled", "voyeurweb", "proceeds", "ministries", "delivering", "departments", "deployment", "framing", 
    "pan", "contacting", "shakespeare", "retained", "remedy", "answer", "denial", "events", "opens", "integral", "tried", 
    "recorded", "fallen", "accurately", "coupons", "sending", "levy", "hot", "ppm", "commands", "hosts", "wireless", "above", 
    "thriller", "off", "forecast", "fundamental", "thanks", "harbor", "dark", "manner", "usb", "instance", "imagine", "bridge", 
    "tigers", "cigarettes", "deviant", "include", "fame", "qualifying", "distant", "minds", "trainer", "wonderful", "involving", 
    "visit", "chorus", "prediction", "associate", "threats", "contributor", "restaurant", "strategies", "postage", "sounds", 
    "watching", "die", "demonstrated", "florist", "transition", "greatest", "postal", "format", "playstation", 
    "blowing", "graphs"
]

const stages = [`
    
          
Welcome to Hangman!
I'm thinking of a random (common) english word...
You may guess single letters or whole words.
Good Luck!
    
    
`,`
    
          
          
         
           
          
    
    
+===+===+`,`
    +
    |      
    |      
    |     
    |       
    |      
    |
    | 
+===+===+`,`
    +
    |      
    |      
    |     
    |       
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    |      
    |      
    |     
    |       
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     
    |/     
    |     
    |      
    |     
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      
    |         
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |       |
    |       |  
    |      
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      /|\\
    |       |  
    |       
   /|\\
  / | \\
+===+===+`,`
    +--+----+
    | /     |
    |/      O
    |      /|\\
    |       |  
    |      / \\
   /|\\
  / | \\
+===+===+`]

terminal.addCommand("hangman", async function(args) {
    let secretWord = englishWords[Math.floor(Math.random() * englishWords.length)]
    let guessedLetters = []
    let correctLetters = new Set()
    let coveredLetters = "_".repeat(secretWord.length).split("")
    let stageIndex = 0

    let stageOutput = terminal.print("", undefined, {forceElement: true})
    terminal.addLineBreak(2)
    let letterOutput = terminal.print("", undefined, {forceElement: true})

    while (stageIndex + 1 < stages.length) {
        stageOutput.textContent = stages[stageIndex] + "\n"
        if (guessedLetters.length)
            stageOutput.textContent += `(${guessedLetters.length}) ${guessedLetters.join(",")}`
        letterOutput.textContent = coveredLetters.join(" ") + " : "

        if (!coveredLetters.includes("_"))
            break

        let guess = await terminal.prompt("", {printInputAfter: false})

        if (correctLetters.has(guess))
            continue
        
        if (guess.length == 1) {
            let replaceCount = 0
            for (let i = 0; i < secretWord.length; i++) {
                if (coveredLetters[i] == "_" && secretWord.charAt(i) == guess) {
                    coveredLetters[i] = guess
                    replaceCount++
                    correctLetters.add(guess)
                }
            }

            if (!replaceCount && !guessedLetters.includes(guess)) {
                guessedLetters.push(guess)
                stageIndex++
            }
        } else if (guess.length == 0) {
            // do nothing
        } else {
            if (guess.trim().toLowerCase() == secretWord.toLowerCase()) {
                break
            } else if (guess.length == secretWord.length) {
                stageIndex++
            }
        }
    }

    stageOutput.textContent = stages[stageIndex]

    if (stageIndex == stages.length - 1) {
        terminal.printLine("You lost!", Color.ERROR)
        terminal.printLine(`The correct word was: ${secretWord}`)
    } else {
        letterOutput.textContent = secretWord.split("").join(" ") + " : "
        terminal.printSuccess("You won!")
    }
}, {
    description: "play a game of hangman",
    isGame: true
})