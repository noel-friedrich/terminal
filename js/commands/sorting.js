terminal.addCommand("sorting", async function(args) {

    let array = Array.from({length: args.n}, (_, i) => i + 1)

    function shuffleArray() {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffleArray()

    let windowSize = Math.min((terminal.parentNode.clientWidth - 100) * 0.9, (terminal.parentNode.clientHeight - 100) * 0.9)

    const elementSize = Math.max(Math.floor(windowSize / array.length), 1)

    let elements = []
    
    function firstDraw() {
        let parentContainer = document.createElement("div")
        parentContainer.style.width = `${args.n * elementSize}px`
        parentContainer.style.height = `${args.n * elementSize}px`
        parentContainer.style.display = "grid"
        parentContainer.style.gridTemplateColumns = `repeat(${args.n}, 1fr)`
        parentContainer.style.alignItems = "end"
        for (let i = 0; i < array.length; i++) {
            let element = document.createElement("div")
            element.style.backgroundColor = "white"
            element.style.width = `${elementSize}px`
            element.style.height = `${array[i] * elementSize}px`
            elements.push(element)
            parentContainer.appendChild(element)
        }
        terminal.parentNode.appendChild(parentContainer)
    }

    let prevElements = []
    const swapColor = "lightgreen"

    function unmark() {
        for (let element of prevElements) {
            element.style.backgroundColor = "white"
        }
        prevElements = []
    }

    function heightToFreq(height) {
        const minFreq = 100
        const maxFreq = 1000
        return (height / args.n) * (maxFreq - minFreq) + minFreq
    }

    let waitTime = 100 / args.speed

    function swap(i, j) {
        unmark()
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
        elements[i].style.height = `${array[i] * elementSize}px`
        elements[j].style.height = `${array[j] * elementSize}px`
        elements[i].style.backgroundColor = swapColor
        elements[j].style.backgroundColor = swapColor
        prevElements = [elements[i], elements[j]]
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function mark(i) {
        elements[i].style.backgroundColor = swapColor
        prevElements.push(elements[i])
        if (!args.s) {
            playFrequency(heightToFreq(array[i]), waitTime)
        }
    }

    function update(i) {
        elements[i].style.height = `${array[i] * elementSize}px`
    }

    async function endAnimation() {
        unmark()
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = swapColor
            if (!args.s) {
                playFrequency(heightToFreq(array[i]), waitTime)
            }
            await sleep(waitTime)
        }
        await sleep(waitTime)
        for (let i = 0; i < array.length; i++) {
            elements[i].style.backgroundColor = "white"
        }
    }

    const algorithms = {
        "bubble": async function() {
            for (let i = 0; i < array.length; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    if (array[j] > array[j + 1]) {
                        swap(j, j + 1)
                        await sleep(waitTime)
                    }
                }
            }
        },
        "insertion": async function() {
            for (let i = 1; i < array.length; i++) {
                let j = i - 1
                let key = array[i]
                while (j >= 0 && array[j] > key) {
                    swap(j, j + 1)
                    await sleep(waitTime)
                    j--
                }
                array[j + 1] = key
            }
        },
        "selection": async function() {
            for (let i = 0; i < array.length; i++) {
                let minIndex = i
                for (let j = i + 1; j < array.length; j++) {
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[j] < array[minIndex]) {
                        minIndex = j
                    }
                }
                swap(i, minIndex)
                await sleep(waitTime)
            }
        },
        "quick": async function() {
            async function partition(min, max) {
                let pivot = array[max]
                let i = min - 1
                for (let j = min; j < max; j++) {
                    if (array[j] < pivot) {
                        i++
                        swap(i, j)
                        await sleep(waitTime)
                    }
                }
                swap(i + 1, max)
                await sleep(waitTime)
                return i + 1
            }

            async function quickSort(min, max) {
                if (min < max) {
                    let pi = await partition(min, max)
                    await quickSort(min, pi - 1)
                    await quickSort(pi + 1, max)
                }
            }

            await quickSort(0, array.length - 1)
        },
        "heap": async function() {
            async function heapify(n, i) {
                let largest = i
                let l = 2 * i + 1
                let r = 2 * i + 2
                if (l < n && array[l] > array[largest]) {
                    largest = l
                }
                if (r < n && array[r] > array[largest]) {
                    largest = r
                }
                if (largest != i) {
                    swap(i, largest)
                    await sleep(waitTime)
                    await heapify(n, largest)
                }
            }

            for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
                await heapify(array.length, i)
            }
            for (let i = array.length - 1; i >= 0; i--) {
                swap(0, i)
                await sleep(waitTime)
                await heapify(i, 0)
            }
        },
        "merge": async function() { 
            // inplace merge sort with marking
            async function merge(start, mid, end) {
                let i = start
                let j = mid + 1
                let temp = []
                while (i <= mid && j <= end) {
                    mark(i)
                    mark(j)
                    await sleep(waitTime)
                    unmark()
                    if (array[i] <= array[j]) {
                        temp.push(array[i])
                        i++
                    } else {
                        temp.push(array[j])
                        j++
                    }
                }
                while (i <= mid) {
                    temp.push(array[i])
                    i++
                }
                while (j <= end) {
                    temp.push(array[j])
                    j++
                }
                for (let i = start; i <= end; i++) {
                    array[i] = temp[i - start]
                    update(i)
                    mark(i)
                    await sleep(waitTime)
                }
            }

            async function mergeSort(start, end) {
                if (start < end) {
                    let mid = Math.floor((start + end) / 2)
                    await mergeSort(start, mid)
                    await mergeSort(mid + 1, end)
                    await merge(start, mid, end)
                }
            }

            await mergeSort(0, array.length - 1)
        }
    }

    if (args.algorithm === null) {
        terminal.printLine("Available algorithms:")
        for (let algorithm in algorithms) {
            terminal.print("- ")
            terminal.printCommand(algorithm, `sorting ${algorithm}`)
        }
        return
    }

    if (!(args.algorithm in algorithms)) {
        throw new Error("Unknown algorithm")
    }

    firstDraw()

    terminal.scroll()

    await sleep(1000)

    await algorithms[args.algorithm]()

    await endAnimation()

    unmark()

}, {
    description: "display a sorting algorithm",
    args: {
        "?algorithm": "the algorithm to display",
        "?n:i:10~1000": "the number of elements to sort",
        "?speed:n:0~100": "the speed of the sorting algorithm",
        "?s:b": "silent mode (deactivate sound)"
    },
    standardVals: {
        algorithm: null,
        n: 20,
        speed: 1,
    }
})

