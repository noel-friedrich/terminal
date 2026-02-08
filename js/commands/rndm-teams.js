terminal.addCommand("rndm-teams", function (args) {
    const numPeople = args.p
    const numTeams = args.t
    
    if (numTeams > numPeople) {
        throw new Error(`Number of teams (${numTeams}) must not be greater than number of people (${numPeople})`)
    }

    terminal.printLine(`Give each person a number from 1 to ${numPeople}.\n`)
    
    const personIdDigits = numPeople.toString().length
    const teamIdDigits = numTeams.toString().length

    const people = Array.from({length: numPeople}, (_, k) => (k + 1).toString().padEnd(personIdDigits, " "))
    const teams = Array.from({length: numTeams}, () => [])

    shuffle(people)

    let currTeamIndex = 0
    while (people.length) {
        teams[(currTeamIndex++) % teams.length].push(people.pop())
    }

    for (let t = 0; t < numTeams; t++) {
        const teamId = (t + 1).toString().padStart(teamIdDigits, " ")
        terminal.print(`Team ${teamId}`, Color.COLOR_1)
        terminal.print(` (${teams[t].length})`)
        terminal.printLine(` : ${teams[t].join(" ")}`)
    }
}, {
    description: "create random teams of a certain size",
    args: {
        "p=num-people:i:1~9999": "number of people",
        "t=teams:i:1~9999": "number of teams"
    },
    category: "tools"
})