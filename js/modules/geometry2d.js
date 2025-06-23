class UnknownGeometry2dComparisonError extends Error {

    constructor(message = "", ...args) {
        super(message, ...args)
        this.message = message + " cannot be compared (yet?)"
    }

}

class NotImplementedGeometry2dError extends Error {

    constructor(message = "", ...args) {
        super(message, ...args)

        if (message.length > 0) {
            this.message = message + " has not been implemented (yet?)"
        } else {
            this.message = "Not implemented (yet?)"
        }
    }

}


class Geometry2dObject {

    constructor(type) {
        this.type = type
    }

    intersect(geometry2dObject) {
        throw NotImplementedGeometry2dError()
    }

    distance(geometry2dObject) {
        throw NotImplementedGeometry2dError()
    }

    copy() {
        throw NotImplementedGeometry2dError()
    }

    equals(geometry2dObject) {
        if (geometry2dObject.type != this.type) {
            return false
        }
        return this._equalsSameType(geometry2dObject)
    }

    _equalsSameType() {
        throw NotImplementedGeometry2dError()
    }

}

class Point extends Geometry2dObject {

    constructor(x, y) {
        super("Point")
        this.x = x
        this.y = y
    }

    static get zero() {
        return new Point(0, 0)
    }

    static get unit01() {
        return new Point(0, 1)
    }

    static get unit10() {
        return new Point(1, 0)
    }

    static get unit11() {
        return new Point(1, 1)
    }

    static fromFunc(f) {
        return new Point(f(0), f(1))
    }

    applyFunc(f) {
        return new Point(f(this.x), f(this.y))
    }

    iapplyFunc(f) {
        this.x = f(this.x)
        this.y = f(this.y)
    }

    copy() {
        return new Point(this.x, this.y)
    }

    add(v) {
        return new Point(this.x + v.x, this.y + v.y)
    }

    iadd(v) {
        this.x += v.x
        this.y += v.y
    }

    sub(v) {
        return new Point(this.x - v.x, this.y - v.y)
    }

    isub(v) {
        this.x -= v.x
        this.y -= v.y
    }

    mul(v) {
        return new Point(this.x * v.x, this.y * v.y)
    }

    imul(v) {
        this.x *= v.x
        this.y *= v.y
    }

    div(v) {
        return new Point(this.x / v.x, this.y / v.y)
    }

    idiv(v) {
        this.x /= v.x
        this.y /= v.y
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    get normalized() {
        let m = this.length
        return new Point(this.x / m, this.y / m)
    }
    
    scale(x) {
        return new Point(this.x * x, this.y * x)
    }

    lerp(v, t) {
        let delta = v.sub(this)
        return this.add(delta.scale(t))
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    iscale(x) {
        this.x *= x
        this.y *= x
    }

    cross(v) {
        return this.x * v.y - this.y * v.x
    }

    round() {
        return new Point(Math.round(this.x), Math.round(this.y))
    }

    static fromAngle(angle) {
        return new Point(Math.cos(angle), Math.sin(angle))
    }

    static fromPolar(mag, angle) {
        return new Point(mag * Math.cos(angle), mag * Math.sin(angle))
    }

    static fromArray(arr) {
        return new Point(arr[0], arr[1])
    }

    set(x, y) {
        if (x instanceof Point && y == undefined) {
            this.x = x.x
            this.y = x.y
        } else {
            this.x = x
            this.y = y
        }
        
    }

    addX(x) {
        return new Point(this.x + x, this.y)
    }

    addY(y) {
        return new Point(this.x, this.y + y)
    }

    rotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        return new Point(x, y)
    }

    irotate(angle) {
        let x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        let y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        this.x = x
        this.y = y
    }

    static randomAngle() {
        let direction = Math.random() * Math.PI * 2
        return Point.fromAngle(direction)
    }

    static random() {
        return new Point(Math.random(), Math.random())
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    angleDifference(v) {
        return angleDifference(this.angle, v.angle)
    }

    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x)
    }

    equals(v) {
        return this.x == v.x && this.y == v.y
    }

    map(f) {
        return new Point(f(this.x), f(this.y))
    }

    product() {
        return this.x * this.y
    }

    get array() {
        return [this.x, this.y]
    }

    get min() {
        return Math.min(...this.array)
    }

    get max() {
        return Math.max(...this.array)
    }

    abs() {
        return new Point(Math.abs(this.x), Math.abs(this.y))
    }

    toArray() {
        return [this.x, this.y]
    }

    static fromEvent(event, element) {
        let x = 0, y = 0

        if (event.touches && event.touches[0]) {
            x = event.touches[0].clientX
            y = event.touches[0].clientY
        } else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
            x = event.originalEvent.changedTouches[0].clientX
            y = event.originalEvent.changedTouches[0].clientY
        } else if (event.clientX !== undefined && event.clientY !== undefined) {
            x = event.clientX
            y = event.clientY
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            x = event.changedTouches[0].clientX
            y = event.changedTouches[0].clientY
        }

        const rect = element.getBoundingClientRect()
        return new Point(x - rect.left, y - rect.top)
    }

    distance(geometry2dObject) {
        if (geometry2dObject.type == "Line") {
            return geometry2dObject.distance(this)
        } else if (geometry2dObject.type == "LineSegment") {
            return geometry2dObject.distance(this)
        } else if (geometry2dObject.type == "Point") {
            return this.sub(geometry2dObject).length
        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.distance(this)
        } else {
            throw UnknownGeometry2dComparisonError()
        }
    }

    intersect(geometry2dObject) {
        if (geometry2dObject.type == "Line") {
            return geometry2dObject.distance(this) == 0 ? this.copy() : null
        } else if (geometry2dObject.type == "LineSegment") {
            return geometry2dObject.distance(this) == 0 ? this.copy() : null
        } else if (geometry2dObject.type == "Point") {
            return this.sub(v).length == 0 ? this.copy() : null
        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.distance(this) == 0 ? this.copy() : null
        } else {
            throw UnknownGeometry2dComparisonError()
        }
    }

    _equalsSameType(point) {
        return this.x == point.x && this.y == point.y
    }

}

class Line extends Geometry2dObject {

    constructor(point, angle) {
        super("Line")
        this.point = point
        this.angle = angle
    }

    get directionVector() {
        return Point.fromAngle(this.angle)
    }

    copy() {
        return new Line(this.point.copy(), this.angle)
    }

    intersect(geometry2dObject) {
        if (geometry2dObject.type == "Line") {
            let firstLinePoint = this.point
            let firstLineDirection = this.directionVector
            let secondLinePoint = geometry2dObject.point
            let secondLineDirection = new Point(
                Math.cos(geometry2dObject.angle),
                Math.sin(geometry2dObject.angle)
            )

            let crossOfDirections = firstLineDirection.cross(secondLineDirection)
            if (crossOfDirections === 0) {
                return null
            }

            let vectorBetweenLinePoints = secondLinePoint.sub(firstLinePoint)
            let intersectionParameterOnFirstLine = vectorBetweenLinePoints.cross(secondLineDirection) / crossOfDirections

            return firstLinePoint.add(
                firstLineDirection.scale(intersectionParameterOnFirstLine)
            )
        } else if (geometry2dObject.type == "LineSegment") {
            let infiniteLinePoint = this.point
            let infiniteLineDirection = this.directionVector
            let segmentStart = geometry2dObject.startPoint
            let segmentEnd = geometry2dObject.endPoint
            let segmentVector = segmentEnd.sub(segmentStart)

            let crossOfDirections = infiniteLineDirection.cross(segmentVector)
            if (crossOfDirections === 0) {
                return null
            }

            let vectorFromLineToSegmentStart = 
                segmentStart.sub(infiniteLinePoint)

            let segmentParameter = 
                vectorFromLineToSegmentStart.cross(infiniteLineDirection)
                / crossOfDirections

            if (segmentParameter < 0 || segmentParameter > 1) {
                return null
            }

            let lineParameter = 
                vectorFromLineToSegmentStart.cross(segmentVector)
                / crossOfDirections

            return infiniteLinePoint.add(
                infiniteLineDirection.scale(lineParameter)
            )
        } else if (geometry2dObject.type == "Point") {
            return geometry2dObject.intersect(this)

        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.intersect(this)

        } else {
            throw UnknownGeometry2dComparisonError()
        }
    }

    distance(geometry2dObject) {
        if (geometry2dObject.type === "Point") {
            // distance from point to infinite line
            let pointToProject = geometry2dObject
            let basePointOnLine = this.point
            let directionUnitVector = this.directionVector  // already unit length
            let vectorFromLineToPoint = pointToProject.sub(basePointOnLine)
            let perpendicularMagnitude = 
                Math.abs(vectorFromLineToPoint.cross(directionUnitVector))
            return perpendicularMagnitude

        } else if (geometry2dObject.type === "Line") {
            // distance between two infinite lines
            let otherLinePoint = geometry2dObject.point
            let otherLineDirection = new Point(
                Math.cos(geometry2dObject.angle),
                Math.sin(geometry2dObject.angle)
            )
            let crossOfDirections = 
                this.directionVector.cross(otherLineDirection)
            if (crossOfDirections === 0) {
                // parallel lines → distance is point-to-line
                return this.distanceTo(otherLinePoint)
            }
            // non-parallel lines intersect → distance is zero
            return 0

        } else if (geometry2dObject.type === "LineSegment") {
            // distance from infinite line to finite segment:
            // minimal distance to either endpoint
            let startPointOfSegment = geometry2dObject.startPoint
            let endPointOfSegment = geometry2dObject.endPoint
            let distanceToStart = this.distanceTo(startPointOfSegment)
            let distanceToEnd = this.distanceTo(endPointOfSegment)
            return Math.min(distanceToStart, distanceToEnd)

        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.distance(this)

        } else {
            throw new UnknownGeometry2dComparisonError()
        }
    }

    paramaterise(t) {
        return this.point.add(this.directionVector.scale(t))
    }

    _equalsSameType(line) {
        return this.angle == line.angle && this.point.equals(line.point)
    }

}

class LineSegment extends Geometry2dObject {

    constructor(startPoint, endPoint) {
        super("LineSegment")
        this.startPoint = startPoint
        this.endPoint = endPoint
    }

    toArray() {
        return [this.startPoint, this.endPoint]
    }

    intersect(geometry2dObject) {
        if (geometry2dObject.type == "LineSegment") {
            // algorithm found on https://paulbourke.net/geometry/pointlineplane/
            const [s1, e1] = this.toArray()
            const [s2, e2] = geometry2dObject.toArray()

            const denominator = (e2.y - s2.y)*(e1.x - s1.x) - (e2.x - s2.x)*(e1.y - s1.y)
            if (denominator == 0) {
                return null
            }

            const ua = ((e2.x - s2.x) * (s1.y - s2.y) - (e2.y - s2.y) * (s1.x - s2.x)) / denominator
            const ub = ((e1.x - s1.x) * (s1.y - s2.y) - (e1.y - s1.y) * (s1.x - s2.x)) / denominator

            if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null
            return new Point(
                s1.x + ua * (e1.x - s1.x),
                s1.y + ua * (e1.y - s1.y),
            )

        } else if (geometry2dObject.type == "Line") {
            return geometry2dObject.intersect(this)

        } else if (geometry2dObject.type == "Point") {
            return geometry2dObject.intersect(this)

        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.intersect(this)

        } else {
            throw UnknownGeometry2dComparisonError()
        }
    }

    distance(geometry2dObject) {
        if (geometry2dObject.type === "Point") {
            // distance from point to this segment
            let point = geometry2dObject
            let segmentVector = this.endPoint.sub(this.startPoint)
            let lengthSquared = segmentVector.dot(segmentVector)
            if (lengthSquared === 0) {
                // degenerate segment → just a point
                return point.distance(this.startPoint)
            }
            // project (point – start) onto segmentVector
            let t = point.sub(this.startPoint).dot(segmentVector) / lengthSquared
            if (t < 0) {
                return point.distance(this.startPoint)
            } else if (t > 1) {
                return point.distance(this.endPoint)
            }
            let projection = this.startPoint.add(segmentVector.scale(t))
            return point.distance(projection)

        } else if (geometry2dObject.type === "Line") {
            // distance from infinite line to this segment
            // delegate to line.distanceTo(segment)
            return geometry2dObject.distanceTo(this)

        } else if (geometry2dObject.type === "LineSegment") {
            // minimal distance between two finite segments
            // if they intersect, distance is zero
            if (this.intersect(geometry2dObject) !== null) {
                return 0
            }
            // otherwise, consider endpoint‐to‐segment distances
            let otherSegment = geometry2dObject
            let distances = [
                this.distanceTo(otherSegment.startPoint),
                this.distanceTo(otherSegment.endPoint),
                otherSegment.distanceTo(this.startPoint),
                otherSegment.distanceTo(this.endPoint)
            ]
            return Math.min(...distances)

        } else if (geometry2dObject.type === "GeometryObjectCollection") {
            return geometry2dObject.distance(this)

        } else {
            throw new UnknownGeometry2dComparisonError()
        }
    }
    
    paramaterise(t) {
        if (t < 0 || t > 1) {
            throw Error("Invalid t value")
        }
        return this.startPoint.lerp(this.endPoint, t)
    }

    _equalsSameType(lineSegment) {
        return this.startPoint.equals(lineSegment.startPoint) && this.endPoint.equals(lineSegment.endPoint)
    }

}

class GeometryObjectCollection extends Geometry2dObject {

    constructor(objects) {
        super("GeometryObjectCollection")
        this.objects = objects ?? []
    }

    get size() {
        return this.objects.length
    }

    addObject(object) {
        this.objects.push(object)
    }

    addObjects(objects) {
        this.objects.push(...objects)
    }

    concat(geometryObjectCollection) {
        const collection = this.copy()
        for (const obj of geometryObjectCollection.objects) {
            collection.addObject(obj.copy())
        }
        return collection
    }

    selfIntersect() {
        const intersections = []
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i <= j) continue
                    
                const intersection = this.objects[i].intersect(this.objects[j])
                if (intersection !== null) {
                    intersections.push(intersection)
                }
            }
        }
        return new GeometryObjectCollection(intersections)
    }

    intersect(geometry2dObject) {
        const intersections = []
        for (const object of this.objects) {
            const intersection = object.intersect(geometry2dObject)
            if (intersection !== null) {
                intersections.push(intersection)
            }
        }
        return new GeometryObjectCollection(intersections)
    }

    distance(geometry2dObject) {
        let minDistance = Infinity
        for (const object of this.objects) {
            const distance = object.distance(geometry2dObject)
            if (distance < minDistance) {
                minDistance = distance
            }
        }
        return minDistance
    }

    copy() {
        return new GeometryObjectCollection(
            this.objects.map(o => o.copy())
        )
    }

    _equalsSameType(objectCollection) {
        return (
            this.length == objectCollection.length
            && objectCollection.objects.every((o, i) => o.equals(this.objects[i]))
        )
    }

}

terminal.modules.geometry2d = {
    Point,
    Line,
    LineSegment,
    Geometry2dObject,
    GeometryObjectCollection,
    UnknownGeometry2dComparisonError,
    NotImplementedGeometry2dError
}