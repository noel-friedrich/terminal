const PieceType = {
    ROOK: 'R',
    KNIGHT: 'N',
    BISHOP: 'B',
    QUEEN: 'Q',
    KING: 'K',
    PAWN: 'P',
    NONE: ' '
}

const ColorType = {
    WHITE: 'w',
    BLACK: 'b',
    NONE: '-'
}

const CastlingType = {
    KINGSIDE: 'K',
    QUEENSIDE: 'Q',
    NONE: '-'
}

const centerHeatmap = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

function oppositeColor(color) {
    if (color === ColorType.WHITE) {
        return ColorType.BLACK;
    } else if (color === ColorType.BLACK) {
        return ColorType.WHITE;
    } else {
        return ColorType.NONE;
    }
}

class Position {

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    addX(x) {
        return new Position(this.x + x, this.y)
    }

    addY(y) {
        return new Position(this.x, this.y + y)
    }

    add(x, y) {
        return new Position(this.x + x, this.y + y)
    }

    addPos(pos) {
        return new Position(this.x + pos.x, this.y + pos.y)
    }

    toString() {
        const numbers = "87654321".split("")
        const letters = "abcdefgh".split("")
        return letters[this.x] + numbers[this.y]
    }

    equals(pos) {
        return this.x === pos.x && this.y === pos.y
    }

    diff(pos) {
        return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y)
    }

    copy() {
        return new Position(this.x, this.y)
    }

    static fromString(str) {
        const numbers = "87654321".split("")
        const letters = "abcdefgh".split("")
        return new Position(letters.indexOf(str[0]), numbers.indexOf(str[1]))
    }

}

class Move {
    
    constructor() {
        this.start = new Position(0, 0)
        this.end = new Position(0, 0)
        this.castling = null
        this.promotion = null
        this.enPassant = null
        this.activeEnPassant = null
        this.capture = false
    }

    setCastling(castling) {
        if (castling === undefined)
            console.error("castling is undefined")
        this.castling = castling
        return this
    }

    setPromotion(promotion) {
        this.promotion = promotion
        return this
    }

    setEnPassant(enPassant) {
        this.enPassant = enPassant
        return this 
    }

    setActiveEnPassant(activeEnPassant) {
        this.activeEnPassant = activeEnPassant
        return this
    }

    setStart(pos) {
        this.start.x = pos.x
        this.start.y = pos.y
        return this
    }

    setEnd(pos) {
        this.end.x = pos.x
        this.end.y = pos.y
        return this
    }

    static fromString(str) {
        let newMove = new Move()
        let positions = str.split("-").map(p => p.trim()) 
        newMove.start = Position.fromString(positions[0])  
        newMove.end = Position.fromString(positions[1])
        return newMove     
    }

    toString() {
        return `${this.start.toString()}_${this.end.toString()}`
    }

    equals(move) {
        return this.start.equals(move.start) && this.end.equals(move.end)
    }

}

class Piece {
        
    constructor(color, type) {
        this.color = color
        this.type = type
    }

    get value() {
        switch(this.type) {
            case PieceType.ROOK: return 5
            case PieceType.KNIGHT: return 3
            case PieceType.BISHOP: return 3
            case PieceType.QUEEN: return 9
            case PieceType.KING: return 100
            case PieceType.PAWN: return 1
            default: return 0
        }
    }

    toString() {
        if (this.color == ColorType.WHITE) {
            return this.type.toUpperCase()
        } else {
            return this.type.toLowerCase()
        }
    }

    get oppositeColor() {
        return oppositeColor(this.color)
    }

    getMoves() {
        return Array()
    }

}

class Pawn extends Piece {
    
    constructor(color) {
        super(color, PieceType.PAWN)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        let forward = (this.color == ColorType.WHITE) ? -1 : 1
        let startRank = (this.color == ColorType.WHITE) ? 6 : 1
        let endRank = (this.color == ColorType.WHITE) ? 0 : 7
        
        if (board.isFree(pos.addY(forward))) {
            allMoves.push(new Move().setStart(pos).setEnd(pos.addY(forward))
                .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (pos.y == startRank && board.isFree(pos.addY(forward * 2))) {
                allMoves.push(new Move().setStart(pos).setEnd(pos.addY(forward * 2)).
                    setEnPassant(pos.addY(forward)))
            }
        }
        let frontLeft = pos.add(-1, forward)
        let frontLeftPiece = board.get(frontLeft)
        let frontRight = pos.add(1, forward)
        let frontRightPiece = board.get(frontRight)
        if (frontLeftPiece && ((frontLeftPiece.color == this.oppositeColor) || (board.enPassant && frontLeft.equals(board.enPassant)))) {
            allMoves.push(new Move().setStart(pos).setEnd(frontLeft)
            .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (board.enPassant && frontLeft.equals(board.enPassant)) {
                allMoves[allMoves.length - 1].setActiveEnPassant(frontLeft)
            }
        }
        if (frontRightPiece && ((frontRightPiece.color == this.oppositeColor) || (board.enPassant && frontRight.equals(board.enPassant)))) {
            allMoves.push(new Move().setStart(pos).setEnd(frontRight)
            .setPromotion((pos.y + forward == endRank) ? PieceType.QUEEN : null))
            if (board.enPassant && frontRight.equals(board.enPassant)) {
                allMoves[allMoves.length - 1].setActiveEnPassant(frontRight)
            }
        }
        return allMoves
    }

}

class Rook extends Piece {

    constructor(color) {
        super(color, PieceType.ROOK)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position(0, 1),
            new Position(0, -1),
            new Position(1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Bishop extends Piece {
    
    constructor(color) {
        super(color, PieceType.BISHOP)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Queen extends Piece {
    
    constructor(color) {
        super(color, PieceType.QUEEN)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1),
            new Position( 0, 1),
            new Position( 0,-1),
            new Position( 1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            while (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                currentPos = currentPos.addPos(direction)
            }
            let currPiece = board.get(currentPos)
            if (currPiece && currPiece.color == this.oppositeColor) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            }
        }
        return allMoves
    }

}

class Knight extends Piece {

    constructor(color) {
        super(color, PieceType.KNIGHT)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 2),
            new Position( 2, 1),
            new Position(-1, 2),
            new Position(-2, 1),
            new Position( 1,-2),
            new Position( 2,-1),
            new Position(-1,-2),
            new Position(-2,-1)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            if (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            } else {
                let currPiece = board.get(currentPos)
                if (currPiece && currPiece.color == this.oppositeColor) {
                    allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                }
            }
        }
        return allMoves
    }

}

class King extends Piece {

    constructor(color) {
        super(color, PieceType.KING)
    }

    getMoves(board, pos) {
        let allMoves = Array()
        const directionVectors = [
            new Position( 1, 1),
            new Position( 1,-1),
            new Position(-1, 1),
            new Position(-1,-1),
            new Position( 0, 1),
            new Position( 0,-1),
            new Position( 1, 0),
            new Position(-1, 0)
        ]
        for (let i = 0; i < directionVectors.length; i++) {
            let direction = directionVectors[i]
            let currentPos = pos.addPos(direction)
            if (board.isFree(currentPos)) {
                allMoves.push(new Move().setStart(pos).setEnd(currentPos))
            } else {
                let currPiece = board.get(currentPos)
                if (currPiece && currPiece.color == this.oppositeColor) {
                    allMoves.push(new Move().setStart(pos).setEnd(currentPos))
                }
            }
        }
        if (board.castling[this.color][CastlingType.KINGSIDE]) {
            if (board.isFree(new Position(pos.x + 2, pos.y))) {
                if (board.isFree(new Position(pos.x + 1, pos.y))) {
                    allMoves.push(new Move()
                                        .setStart(pos)
                                        .setEnd(new Position(pos.x + 2, pos.y))
                                        .setCastling(CastlingType.KINGSIDE))
                }
            }
        }
        if (board.castling[this.color][CastlingType.QUEENSIDE]) {
            if (board.isFree(new Position(pos.x - 3, pos.y))) {
                if (board.isFree(new Position(pos.x - 2, pos.y))) {
                    if (board.isFree(new Position(pos.x - 1, pos.y))) {
                        allMoves.push(new Move()
                                            .setStart(pos)
                                            .setEnd(new Position(pos.x - 2, pos.y))
                                            .setCastling(CastlingType.QUEENSIDE))
                    }
                }
            }
        }
        return allMoves
    }

}

class ChessBoard {

    constructor(fenStr) {
        this.board = new Array(8)
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array(8)
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = new Piece(ColorType.NONE, PieceType.NONE)
            }
        }

        this.castling = {
            [ColorType.WHITE]: {
                [CastlingType.KINGSIDE]: true,
                [CastlingType.QUEENSIDE]: true
            },
            [ColorType.BLACK]: {
                [CastlingType.KINGSIDE]: true,
                [CastlingType.QUEENSIDE]: true
            }
        }
        this.enPassant = null
        this.halfMoveClock = 0
        this.fullMoveClock = 1
        this.fen = fenStr
        this.computerColor = ColorType.BLACK
        this.LEGALMOVES = Object()
        this.PSEUDOLEGALMOVES = Object()
        this.whiteToMove = true
        this.parseFen(fenStr)
    }

    get playerColor() {
        return oppositeColor(this.computerColor)
    }

    isFree(pos) {
        let piece = this.get(pos)
        if (!piece) {
            return null
        }
        return piece.color == ColorType.NONE
    }

    get(pos) {
        if (pos.x < 0 || pos.x > 7 || pos.y < 0 || pos.y > 7) {
            return null
        }
        return this.board[pos.y][pos.x]
    }

    set(pos, piece) {
        this.board[pos.y][pos.x] = piece
    }

    getPsuedoLegalMoves(color) {
        if (this.PSEUDOLEGALMOVES[this.toFen() + color]) {
            return this.PSEUDOLEGALMOVES[this.toFen() + color]
        }
        let allMoves = Array()
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == color) {
                    let moves = piece.getMoves(this, new Position(j, i))
                    allMoves = allMoves.concat(moves)
                }
            }
        }
        this.PSEUDOLEGALMOVES[this.toFen() + color] = allMoves
        return allMoves
    }

    makeMove(move) {
        this.whiteToMove = !this.whiteToMove
        let moveInfo = {
            startPiece: this.get(move.start),
            endPiece: this.get(move.end),
            extraMove: null,
            extraMoveStart: null,
            extraMoveEnd: null,
            prevEnPassant: (this.enPassant) ? this.enPassant.copy() : null,
            removedPiece: null,
            removedPiecepos: null,
            prevCastling: {
                [ColorType.WHITE]: {
                    [CastlingType.KINGSIDE]: this.castling[ColorType.WHITE][CastlingType.KINGSIDE],
                    [CastlingType.QUEENSIDE]: this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]
                },
                [ColorType.BLACK]: {
                    [CastlingType.KINGSIDE]: this.castling[ColorType.BLACK][CastlingType.KINGSIDE],
                    [CastlingType.QUEENSIDE]: this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]
                }
            }
        }
        let piece = this.get(move.start)
        this.set(move.start, new Piece(ColorType.NONE, PieceType.NONE))
        this.set(move.end, piece)

        if (move.castling) {
            if (move.castling == CastlingType.KINGSIDE) {
                moveInfo.extraMove = new Move().setStart(move.end.addX(1)).setEnd(move.end.addX(-1))
                moveInfo.extraMoveStart = this.get(move.end.addX(1))
                moveInfo.extraMoveEnd = this.get(move.end.addX(-1))
                this.set(move.end.addX(-1), this.get(move.end.addX(1)))
                this.set(move.end.addX(1), new Piece(ColorType.NONE, PieceType.NONE))
            } else if (move.castling == CastlingType.QUEENSIDE) {
                moveInfo.extraMove = new Move().setStart(move.end.addX(-2)).setEnd(move.end.addX(1))
                moveInfo.extraMoveStart = this.get(move.end.addX(-2))
                moveInfo.extraMoveEnd = this.get(move.end.addX(1))
                this.set(move.end.addX(1), this.get(move.end.addX(-2)))
                this.set(move.end.addX(-2), new Piece(ColorType.NONE, PieceType.NONE))
            }
        }

        if (move.promotion) {
            this.set(move.end, new Queen(piece.color))
        }

        if (move.activeEnPassant) {
            let forward = (piece.color == ColorType.WHITE) ? 1 : -1
            moveInfo.removedPiece = this.get(move.end.addY(forward))
            this.set(move.end.addY(forward), new Piece(ColorType.NONE, PieceType.NONE))
            moveInfo.removedPiecepos = move.end.addY(forward)
        }

        if (this.enPassant) {
            this.enPassant = null
        }

        if (move.enPassant) {
            this.enPassant = move.enPassant
        }

        if (piece.type == PieceType.KING) {
            this.castling[piece.color][CastlingType.KINGSIDE] = false
            this.castling[piece.color][CastlingType.QUEENSIDE] = false
        }

        if (piece.type == PieceType.ROOK) {
            if (move.start.x == 0) {
                this.castling[piece.color][CastlingType.QUEENSIDE] = false
            } else if (move.start.x == 7) {
                this.castling[piece.color][CastlingType.KINGSIDE] = false
            }
        }

        return moveInfo
    }

    unmakeMove(move, moveInfo) {
        this.whiteToMove = !this.whiteToMove
        this.set(move.start, moveInfo.startPiece)
        this.set(move.end, moveInfo.endPiece)

        this.castling = moveInfo.prevCastling
        this.enPassant = moveInfo.prevEnPassant

        if (move.castling) {
            this.set(moveInfo.extraMove.start, moveInfo.extraMoveStart)
            this.set(moveInfo.extraMove.end, moveInfo.extraMoveEnd)
        }

        if (move.activeEnPassant) {
            this.set(moveInfo.removedPiecepos, moveInfo.removedPiece)
        }
    }

    isCheck(chosenColor=null) {
        let color = (chosenColor) ? chosenColor : (this.whiteToMove ? ColorType.BLACK : ColorType.WHITE)
        let moves = this.getPsuedoLegalMoves(oppositeColor(color))
        for (let i = 0; i < moves.length; i++) {
            let endPos = this.get(moves[i].end)
            if (endPos.color == color && endPos.type == PieceType.KING) {
                return true
            }
        }
        return false
    }

    generateMoves(color) {
        if (this.LEGALMOVES[this.toFen() + color]) {
            return this.LEGALMOVES[this.toFen() + color]
        }
        let allMoves = Array()
        for (let move of this.getPsuedoLegalMoves(color)) {
            let moveInfo = this.makeMove(move)
            if (!this.isCheck()) {
                allMoves.push(move)
            }
            this.unmakeMove(move, moveInfo)
        }
        this.LEGALMOVES[this.toFen() + color] = allMoves
        return allMoves
    }

    parseFen(fenStr) {
        function pieceFromChar(char) {
            switch (char) {
                case 'P': return new Pawn(ColorType.WHITE)
                case 'N': return new Knight(ColorType.WHITE)
                case 'B': return new Bishop(ColorType.WHITE)
                case 'R': return new Rook(ColorType.WHITE)
                case 'Q': return new Queen(ColorType.WHITE)
                case 'K': return new King(ColorType.WHITE)
                case 'p': return new Pawn(ColorType.BLACK)
                case 'n': return new Knight(ColorType.BLACK)
                case 'b': return new Bishop(ColorType.BLACK)
                case 'r': return new Rook(ColorType.BLACK)
                case 'q': return new Queen(ColorType.BLACK)
                case 'k': return new King(ColorType.BLACK)
                default: return new Piece(ColorType.NONE, PieceType.NONE)
            }
        }
        let split = fenStr.split(' ')
        let fenPieces = {
            piecePos: split[0],
            color: split[1],
            castle: split[2],
            enPassant: split[3],
            halfMoveClock: split[4],
            fullMoveClock: split[5]
        }

        let currPos = new Position(0, 0)
        for (let char of fenPieces.piecePos) {
            let piece = pieceFromChar(char)
            if (piece.color == ColorType.NONE && String(char).match(/[1-8]/)) {
                currPos.x += parseInt(char)
            } else if (piece.color == ColorType.NONE && char == '/') {
                currPos.x = 0
                currPos.y++
            } else {
                this.set(currPos, piece)
                currPos.x++
            }
        }

        this.whiteToMove = fenPieces.color == "w"
        this.castling = {
            [ColorType.WHITE]: {
                [CastlingType.KINGSIDE]: (fenPieces.castle.indexOf('K') != -1),
                [CastlingType.QUEENSIDE]: (fenPieces.castle.indexOf('Q') != -1)
            },
            [ColorType.BLACK]: {
                [CastlingType.KINGSIDE]: (fenPieces.castle.indexOf('k') != -1),
                [CastlingType.QUEENSIDE]: (fenPieces.castle.indexOf('q') != -1)
            }
        }
        if (fenPieces.enPassant != "-")
            this.enPassant = Position.fromString(fenPieces.enPassant)
        this.halfMoveClock = parseInt(fenPieces.halfMoveClock)
        this.fullMoveClock = parseInt(fenPieces.fullMoveClock)
    }

    toNiceString() {
        let alphabet = "87654321"
        let lineString = "  +---+---+---+---+---+---+---+---+\n"
        for (let i = 0; i < 8; i++) {
            lineString += alphabet[i] + " | "
            for (let j = 0; j < 8; j++) {
                lineString += this.board[i][j].toString() + " | "
            }
            if (i != 7) {
                lineString += "\n  +---+---+---+---+---+---+---+---+\n"
            } else {
                lineString += "\n  +---+---+---+---+---+---+---+---+\n"
            }
        }
        lineString += "    a   b   c   d   e   f   g   h \n"
        return lineString
    }

    purePieceEvaluation() {
        let whiteScore = 0
        let blackScore = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == ColorType.WHITE) {
                    whiteScore += piece.value
                } else if (piece.color == ColorType.BLACK) {
                    blackScore += piece.value
                }
            }
        }
        return (whiteScore - blackScore) * (this.whiteToMove ? 1 : -1)
    }

    castlingEvaluation() {
        let whiteScore = 0
        if (this.castling[ColorType.WHITE][CastlingType.KINGSIDE]) {
            whiteScore += 1
        }
        if (this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]) {
            whiteScore += 1
        }
        if (this.castling[ColorType.BLACK][CastlingType.KINGSIDE]) {
            whiteScore -= 1
        }
        if (this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]) {
            whiteScore -= 1
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    enPassantEvaluation() {
        let whiteScore = 0
        if (this.enPassant) {
            whiteScore += 1
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    centerControlEvaluation() {
        let whiteScore = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == ColorType.WHITE) {
                    whiteScore += centerHeatmap[i][j]
                }
            }
        }
        return whiteScore * (this.whiteToMove ? 1 : -1)
    }

    getKingPosition(color) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.board[i][j]
                if (piece.color == color && piece.type == PieceType.KING) {
                    return new Position(j, i)
                }
            }
        }
        return null
    }

    evaluate() {
        let evaluation = this.purePieceEvaluation() * 100
        evaluation += this.castlingEvaluation() * 10 // max 20
        evaluation +=  this.enPassantEvaluation() * 10 // max 10
        evaluation += this.centerControlEvaluation() * 10 // max 20
        return evaluation
    }

    get movingColor() {
        return this.whiteToMove ? ColorType.WHITE : ColorType.BLACK
    }

    calcMove(depth, alpha=-Infinity) {
        if (depth == 0) {
            return {
                score: this.evaluate(),
                move: null
            }
        }

        let moves = this.generateMoves(this.movingColor)
        let bestMove = null
        if (moves.length == 0) {
            if (this.isCheck()) {
                return {
                    score: -Infinity,
                    move: null
                }
            }
            return {
                score: 0,
                move: null
            }
        }
        for (let move of moves) {
            let moveInfo = this.makeMove(move)
            let score = -this.calcMove(depth - 1).score
            this.unmakeMove(move, moveInfo)
            if (score > alpha || (score == alpha && bestMove == null)) {
                alpha = score
                bestMove = move
            }
        }
        return {
            move: bestMove,
            score: alpha
        }
    }

    toFen() {
        let tempCount = 0
        let outStr = ""
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let currPos = new Position(j, i)
                if (this.isFree(currPos)) {
                    tempCount++
                } else {
                    if (tempCount > 0) {
                        outStr += tempCount.toString()
                        tempCount = 0
                    }
                    let piece = this.get(currPos)
                    outStr += piece.toString()
                }
            }
            if (tempCount > 0) {
                outStr += tempCount.toString()
                tempCount = 0
            }
            outStr += "/"
        }
        outStr = outStr.slice(0, -1) + " "
        outStr += this.whiteToMove ? "w " : "b "
        let castleString = ""
        if (this.castling[ColorType.WHITE][CastlingType.KINGSIDE]) {
            castleString += "K"
        }
        if (this.castling[ColorType.WHITE][CastlingType.QUEENSIDE]) {
            castleString += "Q"
        }
        if (this.castling[ColorType.BLACK][CastlingType.KINGSIDE]) {
            castleString += "k"
        }
        if (this.castling[ColorType.BLACK][CastlingType.QUEENSIDE]) {
            castleString += "q"
        }
        if (castleString == "") {
            castleString = "-"
        }
        outStr += `${castleString} `
        if (this.enPassant) {
            outStr += this.enPassant.toString()
        } else {
            outStr += "-"
        }
        outStr += ` ${this.halfMoveClock} ${this.fullMoveClock}`
        return outStr
    }

}

terminal.addCommand("chess", async function() {
    let board = new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    function makeComputerMove() {
        let bestMove = board.calcMove(3)
        if (!bestMove.move) {
            terminal.printLine("Checkmate!")
            return
        }
        board.makeMove(bestMove.move)
    }

    async function getPlayerMove() {
        let inp = await terminal.prompt("Your Move: ")
        if (!/^[abcdefgh][1-8]\-[abcdefgh][1-8]$/.test(inp)) {
            terminal.printLine("Invalid move format!")
            return getPlayerMove()
        }
        let move = Move.fromString(inp)
        if (!board.generateMoves(board.playerColor).find(m => m.equals(move))) {
            terminal.printLine("Illegal move!")
            return getPlayerMove()
        }
        return move
    }

    terminal.printLine("example move: 'd2-d4'")

    while (board.generateMoves(board.movingColor).length != 0) {
        terminal.printLine(board.toNiceString())
        let playerMove = await getPlayerMove()
        board.makeMove(playerMove)
        makeComputerMove()
    }
    
}, {
    description: "play a game of chess against the computer",
    isGame: true
})