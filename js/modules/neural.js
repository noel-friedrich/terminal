const sigmoid = t => 1 / (1 + Math.pow(Math.E, -t))

class Node {
    
    constructor(layer, previousRow, {biasEnabled=false}={}) {
        this.output = 0.0
        this.weights = []
        this.layer = layer
        this.biasEnabled = biasEnabled
        this.bias = (Math.random() - 0.5)

        for (let i = 0; i < previousRow.length; i++) {
            this.weights.push(Math.random())
        }

    }

    fire(previousRow) {
        let cumulativeWeight = 0.0
        for (let i = 0; i < previousRow.length; i++) {
            let combined = previousRow[i].output * this.weights[i]
            cumulativeWeight += combined
        }
        let average = cumulativeWeight / previousRow.length
        if (this.biasEnabled) {
            average += this.bias
        }
        this.output = sigmoid(average)
    }

    copy() {
        let newNode = new Node(this.layer, [])
        newNode.output = this.output
        newNode.weights = this.weights.slice()
        return newNode
    }

}

class Net {

    constructor(nodes, {biasEnabled=false}={}) {
        this.nodes = []

        let previousRow = []
        for (let i = 0; i < nodes.length; i++) {
            let newRow = []
            for (let j = 0; j < nodes[i]; j++) {
                let newNode = new Node(i, previousRow, {biasEnabled})
                newRow.push(newNode)
            }
            previousRow = newRow
            this.nodes.push(newRow)
        }
    }

    train(inputs, expected, cycles = 200, learningRate = 0.5) {
        for (let i = 0; i < cycles; i++) {
            for (let j = 0; j < inputs.length; j++) {
                this.input(inputs[j])
                this.backpropagation(expected[j])
                this.updateWeights(learningRate)
            }
        }
    }

    input(inputData) {
        if (inputData.length != this.nodes[0].length)
            throw new Error("Input Array must be same size as Input Neuron Layer")
        for (let i = 0; i < inputData.length; i++) {
            this.nodes[0][i].output = inputData[i]
        }

        this.fire()

        let output = []
        for (let i = 0; i < this.nodes[this.nodes.length - 1].length; i++) {
            output.push(this.nodes[this.nodes.length - 1][i].output)
        }
        return output
    }

    fire() {
        for (let i = 1; i < this.nodes.length; i++) {
            let previousRow = this.nodes[i - 1]
            for (let j = 0; j < this.nodes[i].length; j++) {
                this.nodes[i][j].fire(previousRow)
            }
        }
    }

    updateWeights(learningRate) {
        for (let i = 1; i < this.nodes.length; i++) {
            let inputs = []
            for (let j = 0; j < this.nodes[i - 1].length; j++)
                inputs.push(this.nodes[i - 1][j].output)
            for (let j = 0; j < this.nodes[i].length; j++) {
                for (let k = 0; k < inputs.length; k++) {
                    this.nodes[i][j].weights[k] += learningRate * this.nodes[i][j].delta * inputs[k]
                }
            }
        }
    }

    backpropagation(expected) {
        function derivative(output) {
            return output * (1.0 - output)
        }

        for (let i = this.nodes.length - 1; i >= 0; i--) {
            let layer = this.nodes[i]
            let errors = []
            if (i != this.nodes.length - 1) {
                for (let j = 0; j < layer.length; j++) {
                    let error = 0.0
                    for (let k = 0; k < this.nodes[i + 1].length; k++) {
                        let neuron = this.nodes[i + 1][k]
                        error += neuron.weights[j] * neuron.delta
                    }
                    errors.push(error)
                }
            } else {
                for (let j = 0; j < layer.length; j++) {
                    let neuron = layer[j]
                    errors.push(expected[j] - neuron.output)
                }
            }
            for (let j = 0; j < layer.length; j++) {
                let neuron = this.nodes[i][j]
                neuron.delta = errors[j] * derivative(neuron.output)
            }
        }
    }

    copy() {
        let newNet = new Net([])
        for (let i = 0; i < this.nodes.length; i++) {
            let newRow = []
            for (let j = 0; j < this.nodes[i].length; j++) {
                newRow.push(this.nodes[i][j].copy())
            }
            newNet.nodes.push(newRow)
        }
        return newNet
    }

    mutate(rate) {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes[i].length; j++) {
                for (let k = 0; k < this.nodes[i][j].weights.length; k++) {
                    if (Math.random() < rate) {
                        this.nodes[i][j].weights[k] = Math.random()
                    }

                    if (Math.random() < rate) {
                        this.nodes[i][j].bias += (Math.random() - 0.5)
                    }
                }
            }
        }
    }

    static crossover(net1, net2) {
        let newNet = net1.copy()
        for (let i = 0; i < newNet.nodes.length; i++) {
            for (let j = 0; j < newNet.nodes[i].length; j++) {
                for (let k = 0; k < newNet.nodes[i][j].weights.length; k++) {
                    if (Math.random() < 0.5) {
                        newNet.nodes[i][j].weights[k] = net2.nodes[i][j].weights[k]
                    }

                    if (Math.random() < 0.5) {
                        newNet.nodes[i][j].bias = net2.nodes[i][j].bias
                    }
                }
            }
        }
        return newNet
    }
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1
    }

    let max = arr[0]
    let maxIndex = 0

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i
            max = arr[i]
        }
    }

    return maxIndex
}

terminal.modules.neural = {
    Net, Node, sigmoid, indexOfMax
}