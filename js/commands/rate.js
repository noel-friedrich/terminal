terminal.addCommand("rate", function(args) {
    let languageEvaluations = {
        "py": "it's got everything: explicity, typing, great syntax, just speed is lacking",
        "python2": "who really uses python2 nowadays? just update to python3",
        "java": "not too fond of strict object oriented programming, but it's quite beginner friendly",
        "ruby": "let me introduce: a worse python",
        "html": "is this really supposed to be a programming language?",
        "css": "secretely a big fan but don't tell anyone",
        "js": "this one is just a mix of everything. it aged like milk",
        "javascript": "this one is just a mix of everything. it aged like milk",
        "jsx": "this one is just a mix of everything. it aged like milk",
        "php": "i hate myself for using this one",
        "lua": "i wish i could use lua more often - it's actually quite awesome",
        "go": "liked the 8 hour long tutorial but have yet to use it",
        "c": "i really want to hate it but its simplictiy and speed is just awesome",
        "c++": "use this instead of c when you want complexity",
        "c#": "java but better syntax - love it",
        "kotlin": "c# but not from microsoft lol",
        "swift": "what is this language? i don't know",
        "rust": "c but 2020 version. A person that doesn't love rust hasn't used rust",
        "hs": "functional programming requires so much brain power.\nyou automatically feel smarter when using it.\nLOVE IT!!",
    }
    
    languageEvaluations["python"] = languageEvaluations["py"]
    languageEvaluations["python3"] = languageEvaluations["py"]
    languageEvaluations["javascript"] = languageEvaluations["js"]
    languageEvaluations["jsx"] = languageEvaluations["js"]
    languageEvaluations["csharp"] = languageEvaluations["c#"]
    languageEvaluations["cpp"] = languageEvaluations["c++"]
    languageEvaluations["haskell"] = languageEvaluations["hs"]

    if (languageEvaluations[args.language]) {
        terminal.printLine(languageEvaluations[args.language])
    } else {
        terminal.printLine("i don't know that one")
    }
}, {
    description: "rate a programming language",
    args: ["language"]
})