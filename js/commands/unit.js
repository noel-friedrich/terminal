terminal.addCommand("unit", async function(args) {
    const unitData = {
        "distance": [
            {names: ["m", "meter", "meters"], factor: 1},
            {names: ["km", "klick", "klicks", "kilometer", "kilometers"], factor: 1e3},
            {names: ["cm", "centimeter", "centimeters"], factor: 1e-2},
            {names: ["mm", "millimeter", "millimeter"], factor: 1e-3},
            {names: ["micrometer", "micrometers", "micro-meter", "micro-meters"], factor: 1e-6},
            {names: ["nm", "nanometer", "nanometers"], factor: 1e-9},
            {names: ["mi", "mile", "miles"], factor: 1609.344},
            {names: ["yd", "yard", "yards"], factor: 0.9144},
            {names: ["ft", "foot", "feet"], factor: 0.3048},
            {names: ['"', "in", "inch", "inches"], factor: 0.0254},
            {names: ["nmi", "nautical-mile", "nautical-miles"], factor: 1852},
            {names: ["ly", "light-year", "light-y", "light-years"], factor: 9_460_730_472_580.8e3},
            {names: ["h", "hand", "hands"], factor: 0.1016},
            {names: ["lns", "light-ns", "light-nanosecond", "light-nanoseconds"], factor: 0.299792458},
            {names: ["sf", "soccer-field", "soccer-fields", "football-field", "football-fields"], factor: 105},
            {names: ["asf", "american-football-field", "american-football-fields"], factor: 91.44},
            {names: ["er", "earth-radius", "earth-radii"], factor: 6378e3}, // surprisingly hard to approximate!
            {names: ["cu", "cubit", "cubits"], factor: 0.5}, // approximation
            {names: ["p", "palm", "palms"], factor: 0.075}, // ancient egypt hand size (https://en.wikipedia.org/wiki/Palm_(unit))
            {names: ["lk", "lks", "look", "looks"], factor: 100_000} // number of looks from a helicopter 1km high (50km in each direction)
        ],
        
        "area": [
            {names: ["sm", "qm", "m2", "square-meter", "square-meters"], factor: 1},
            {names: ["skm", "qkm", "km2", "square-kilometer", "square-kilometers"], factor: 1e6},
            {names: ["scm", "qcm", "cm2", "square-centimeter", "square-centimeters"], factor: 1e-4},
            {names: ["smm", "qmm", "mm2", "square-millimeter", "square-millimeters"], factor: 1e-6},
            {names: ["ha", "hectare", "hectares"], factor: 1e4},
            {names: ["ac", "acre", "acres"], factor: 4046.86},
            {names: ["sqmi", "square-mile", "square-miles"], factor: 2.58999e6},
            {names: ["sqyd", "square-yard", "square-yards"], factor: 0.836127},
            {names: ["sqft", "square-foot", "square-feet"], factor: 0.092903},
            {names: ["sqin", "square-inch", "square-inches"], factor: 0.00064516},
            {names: ["sqnmi", "square-nautical-mile", "square-nautical-miles"], factor: 3.4299e6},
            {names: ["sqkm", "square-kilometer", "square-kilometers"], factor: 1e6},
            {names: ["sqrd", "rood", "roods"], factor: 1011.71}, // historical unit
            {names: ["sqch", "square-chain", "square-chains"], factor: 404.686}, // historical unit
            {names: ["sqrdm", "square-rod", "square-rods"], factor: 25.2929}, // historical unit
            {names: ["sqperch", "square-perch", "square-perches"], factor: 25.2929}, // historical unit
            {names: ["sqftus", "square-foot-US-Survey", "square-feet-US-Survey"], factor: 0.0929034116}, // US Survey
            {names: ["sqmilesus", "square-mile-US-Survey", "square-miles-US-Survey"], factor: 2.5899881103e6} // US Survey
        ],

        "mass": [
            {names: ["g", "gram", "grams"], factor: 1},
            {names: ["kg", "kilogram", "kilograms"], factor: 1e3},
            {names: ["mg", "milligram", "milligrams"], factor: 1e-3},
            {names: ["μg", "microgram", "micrograms"], factor: 1e-6},
            {names: ["tonne", "metric-ton", "metric-tons"], factor: 1e6},
            {names: ["lb", "pound", "pounds"], factor: 453.592},
            {names: ["oz", "ounce", "ounces"], factor: 28.3495},
            {names: ["ct", "carat", "carats"], factor: 0.2},
            {names: ["st", "stone", "stones"], factor: 6350.29},
            {names: ["gr", "grain", "grains"], factor: 0.0647989},
            {names: ["cwt", "hundredweight", "hundredweights"], factor: 50802.3},
            {names: ["troy-oz", "troy-ounce", "troy-ounces"], factor: 31.1035}, // Precious metals
            {names: ["troy-lb", "troy-pound", "troy-pounds"], factor: 373.242}, // Precious metals
            {names: ["dalton", "atomic-mass-unit", "atomic-mass-units"], factor: 1.66053904e-27} // Atomic and molecular masses
        ],

        "temperature": [
            {names: ["c", "celsius"], factor: 1},
            {names: ["f", "fahrenheit"], to: x => (x - 32) * 5/9, from: x => x * 9/5 + 32},
            {names: ["k", "kelvin"], to: x => x + 273.15, from: x => x - 273.15},
            {names: ["r", "rankine"], to: x => (x - 491.67) * 5/9, from: x => x * 9/5 + 491.67},
            {names: ["d", "delisle"], to: x => 100 - x * 2/3, from: x => (100 - x) * 3/2},
            {names: ["réaumur", "reaumur"], to: x => x * 5/4, from: x => x * 4/5},
            {names: ["rømer", "romer"], to: x => (x - 7.5) * 40/21, from: x => x * 21/40 + 7.5}
        ],

        "speed": [
            {names: ["m/s", "mps", "meter-per-second", "meters-per-second"], factor: 1},
            {names: ["km/h", "kmh", "kph", "kilometer-per-hour", "kilometers-per-hour"], factor: 1 / 3.6},
            {names: ["mi/h", "mph", "mile-per-hour", "miles-per-hour"], factor: 0.447},
            {names: ["ft/s", "fps", "foot-per-second", "feet-per-second"], factor: 0.3048},
            {names: ["knot", "knots"], factor: 0.51444446046222225277},
            {names: ["mach", "machs"], factor: 340.29},
            {names: ["min/km", "minutes-per-kilometer"], to: x => (50/3) / x, from: x => (50/3) / x}
        ],

        "volume": [
            {names: ["m3", "cubic-meter", "cubic-meters"], factor: 1},
            {names: ["km3", "cubic-kilometer", "cubic-kilometers"], factor: 1e9},
            {names: ["cm3", "cubic-centimeter", "cubic-centimeters"], factor: 1e-6},
            {names: ["mm3", "cubic-millimeter", "cubic-millimeters"], factor: 1e-9},
            {names: ["litre", "liter", "liters", "litres"], factor: 1e-3},
            {names: ["ml", "milliliter", "milliliters"], factor: 1e-6},
            {names: ["gal", "gallon", "gallons"], factor: 3.78541},
            {names: ["qt", "quart", "quarts"], factor: 0.946353},
            {names: ["pt", "pint", "pints"], factor: 0.473176},
            {names: ["cup", "cups"], factor: 0.236588},
            {names: ["fl-oz", "fluid-ounce", "fluid-ounces"], factor: 0.0295735},
            {names: ["tbsp", "tablespoon", "tablespoons"], factor: 0.0147868},
            {names: ["tsp", "teaspoon", "teaspoons"], factor: 0.00492892},
            {names: ["yd3", "cubic-yard", "cubic-yards"], factor: 764.554},
            {names: ["ft3", "cubic-foot", "cubic-feet"], factor: 0.0283168},
            {names: ["in3", "cubic-inch", "cubic-inches"], factor: 1.63871e-5},
            {names: ["bbl", "barrel", "barrels"], factor: 0.158987} // Oil barrel (US)
        ],

        "time": [
            {names: ["s", "second", "seconds"], factor: 1},
            {names: ["ms", "millisecond", "milliseconds"], factor: 1e-3},
            {names: ["μs", "microsecond", "microseconds"], factor: 1e-6},
            {names: ["ns", "nanosecond", "nanoseconds"], factor: 1e-9},
            {names: ["min", "minute", "minutes"], factor: 60},
            {names: ["h", "hour", "hours"], factor: 3600},
            {names: ["day", "days"], factor: 86400},
            {names: ["week", "weeks"], factor: 604800},
            {names: ["fortnight", "fortnights"], factor: 1209600},
            {names: ["year", "years"], factor: 31536000},
            {names: ["decade", "decades"], factor: 315360000},
            {names: ["century", "centuries"], factor: 3153600000},
            {names: ["millennium", "millennia"], factor: 31536000000}
        ],

        "digital_storage": [
            {names: ["bit", "bits"], factor: 1},
            {names: ["byte", "bytes"], factor: 8},
            {names: ["kb", "kilobyte", "kilobytes"], factor: 8e3},
            {names: ["mb", "megabyte", "megabytes"], factor: 8e6},
            {names: ["gb", "gigabyte", "gigabytes"], factor: 8e9},
            {names: ["tb", "terabyte", "terabytes"], factor: 8e12},
            {names: ["pb", "petabyte", "petabytes"], factor: 8e15},
            {names: ["eb", "exabyte", "exabytes"], factor: 8e18},
            {names: ["zb", "zettabyte", "zettabytes"], factor: 8e21},
            {names: ["yb", "yottabyte", "yottabytes"], factor: 8e24},
            {names: ["kib", "kibibyte", "kibibytes"], factor: 1024 * 8},
            {names: ["mib", "mebibyte", "mebibytes"], factor: 1024 ** 2 * 8},
            {names: ["gib", "gibibyte", "gibibytes"], factor: 1024 ** 3 * 8},
            {names: ["tib", "tebibyte", "tebibytes"], factor: 1024 ** 4 * 8},
            {names: ["pib", "pebibyte", "pebibytes"], factor: 1024 ** 5 * 8},
            {names: ["eib", "exbibyte", "exbibytes"], factor: 1024 ** 6 * 8},
            {names: ["zib", "zebibyte", "zebibytes"], factor: 1024 ** 7 * 8},
            {names: ["yib", "yobibyte", "yobibytes"], factor: 1024 ** 8 * 8}
        ]
    }

    if (args.l) {
        for (let [category, _units] of Object.entries(unitData)) {
            terminal.printLine(category, Color.COLOR_1)
            terminal.printLine("  Base Unit: " + _units[0].names.slice(-1)[0])
            for (let unit of _units) {
                let conversion = ""
                if (unit.factor) {
                    conversion = `*${unit.factor}`
                } else if (unit.from && unit.to) {
                    conversion = `from: ${unit.from}, to: ${unit.to}`
                }

                terminal.printLine(`  - ${unit.names.slice(-1)} (${conversion})`)
            }
        }
        return
    }

    const units = []
    for (let [category, _units] of Object.entries(unitData)) {
        for (let unit of _units) {
            unit.category = category
            unit.properName = unit.names.slice(-1)[0]
            units.push(unit)
        }
    }

    args.s = args.s.trim().toLowerCase()
    args.r = args.r.trim().toLowerCase()

    const startUnit = units.find(u => u.names.includes(args.s))
    const resultUnit = units.find(u => u.names.includes(args.r))

    if (startUnit == undefined) {
        terminal.printError(`Unknown unit "${args['start-unit']}"`)
        terminal.printCommand("[list all available units]", `unit 1 m m --list-units`)
        return
    }

    if (resultUnit == undefined) {
        terminal.printError(`Unknown unit "${args['result-unit']}"`)
        terminal.printCommand("[list all available units]", `unit 1 m m --list-units`)
        return
    }

    if (startUnit.category != resultUnit.category) {
        throw new Error(`Unit dimensions don't match (${startUnit.category} ≠ ${resultUnit.category})`)
    }

    let result = args.v
    
    if (startUnit.factor) {
        result *= startUnit.factor
    } else if (startUnit.to) {
        result = startUnit.to(result)
    }

    if (resultUnit.factor) {
        result /= resultUnit.factor
    } else if (resultUnit.from) {
        result = resultUnit.from(result)
    }

    terminal.printLine(result)
}, {
    description: "convert numbers between units",
    args: {
        "v=value:n": "numeric value of unit",
        "s=start-unit:s": "starting unit",
        "r=result-unit:s": "resulting unit",
        "?l=list-units:b": "list all known units"
    }
})