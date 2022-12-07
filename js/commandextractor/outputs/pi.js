terminal.addCommand("pi", function(args) {
    let pi = "1415926535897932384626433832795028841971693993751058209749445923078164"
    pi += "0628620899862803482534211706798214808651328230664709384460955058223172535"
    pi += "9408128481117450284102701938521105559644622948954930381964428810975665933"
    pi += "4461284756482337867831652712019091456485669234603486104543266482133936072"
    pi += "6024914127372458700660631558817488152092096282925409171536436789259036001"
    pi += "1330530548820466521384146951941511609433057270365759591953092186117381932"
    pi += "6117931051185480744623799627495673518857527248912279381830119491298336733"
    pi += "6244065664308602139494639522473719070217986094370277053921717629317675238"
    pi += "4674818467669405132000568127145263560827785771342757789609173637178721468"
    pi += "4409012249534301465495853710507922796892589235420199561121290219608640344"
    pi += "1815981362977477130996051870721134999999837297804995105973173281609631859"
    pi += "5024459455346908302642522308253344685035261931188171010003137838752886587"
    pi += "5332083814206171776691473035982534904287554687311595628638823537875937519"
    pi += "577818577805321712268066130019278766111959092164201989"

    let digits = "3." + pi.slice(0, ~~args.n)
    terminal.printLine(digits)
}, {
    description: "calculate pi to the n-th digit",
    args: {
        "?n:n:1~1000": "the number of digits"
    },
    standardVals: {
        n: 100
    }
})


