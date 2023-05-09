//             152
//             / \
//            /   \
//          51    101
//                / \
//               /   \
//             100    1

terminal.addCommand("huffman", function(args) {
    function indent(level) {
        return "  ".repeat(level || 0)
    }

    class Tree {
        children = []
        constructor(children) {
            this.children = children
        }

        get value() {
            let sum = 0
            for (let child of this.children) {
                sum += child.value
            }
            return sum
        }

        toString(indentLevel) {
            indentLevel ||= 0
            return `${indentString}${this.value}\n${indentString}${this.children.map(c => c.toString(indentLevel + 1)).join("\n" + indentString)}`
        }

        static fromValueMap(valueMap) {
            let tempNodes = []
            let entries = Object.entries(valueMap).map(e => new Leaf(e[1], e[0]))
            let tries = 0

            while (entries.length > 1 || tempNodes.length) {
                let minValue = Math.min(...entries.map(n => n.value))
                for (let i = 0; i < entries.length; i++) {
                    let value = entries[i].value
                    if (value === minValue) {
                        tempNodes.push(entries.splice(i, 1)[0])
                    }
                }

                if (tempNodes.length === 2) {
                    entries.push(new Tree(tempNodes))
                    tempNodes = []
                }
            }

            return entries[0]
        }
    }

    class Leaf {
        value = undefined
        key = undefined
        constructor(value, key) {
            this.value = value
            this.key = key
        }

        toString(indentLevel) {
            indentLevel ||= 0
            return `${"  ".repeat(indentLevel)}${this.value} (${this.key})`
        }
    }

    let tree = Tree.fromValueMap({
        "A": 10,
        "B": 20,
        "C": 9,
        "D": 2,
        "E": 15,
        "F": 22,
        "G": 35,
        "V": 10
    })

    terminal.printLine(tree.toString())
}, {
    description: "create a huffman tree"
})