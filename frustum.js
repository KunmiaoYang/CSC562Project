var FRUSTUM = function () {
    var getTriPoints = function (vertex, tri, start, rMatrix, tMatrix) {
        var points = [];
        for (var i = 0, j; i < 3; i++) {
            j = 3 * tri[i + start];
            points[i] = vec3.transformMat4(vec3.create(), vec3.transformMat4(vec3.create(),
                vec3.fromValues(vertex[j], vertex[j + 1], vertex[j + 2]),
                rMatrix), tMatrix);
        }
        return points;
    };
    var getFramePoints = function (frame) {
        return [
            vec3.fromValues(frame.left.x, 0, frame.left.z),
            vec3.fromValues(frame.left.x, 1, frame.left.z),
            vec3.fromValues(frame.right.x, 0, frame.right.z),
            vec3.fromValues(frame.right.x, 1, frame.right.z),
        ];
    };
    var getCellPoints = function (cell) {
        var x1 = cell.j, x2 = x1 + 1, z1 = cell.i, z2 = z1 + 1;
        return [
            vec3.fromValues(x1, 0, z1),
            vec3.fromValues(x1, 0, z2),
            vec3.fromValues(x1, 1, z1),
            vec3.fromValues(x1, 1, z2),
            vec3.fromValues(x2, 0, z1),
            vec3.fromValues(x2, 0, z2),
            vec3.fromValues(x2, 1, z1),
            vec3.fromValues(x2, 1, z2)
        ];
    };
    var getRoomPoints = function (room) {
        var x1 = room.first[1], x2 = room.last[1] + 1, z1 = room.first[0], z2 = room.last[0] + 1;
        return [
            vec3.fromValues(x1, 0, z1),
            vec3.fromValues(x1, 0, z2),
            vec3.fromValues(x1, 1, z1),
            vec3.fromValues(x1, 1, z2),
            vec3.fromValues(x2, 0, z1),
            vec3.fromValues(x2, 0, z2),
            vec3.fromValues(x2, 1, z1),
            vec3.fromValues(x2, 1, z2)
        ];
    };
    var getPortalPoints = function (portal) {
        return getCellPoints(portal.cells[0]);
    };
    return {
        basicFrustum: function (xyz, Nl, Nr, Nb, Nt, Nz, near, far = Number.MAX_SAFE_INTEGER) {
            var checkPos = function (p) {
                var rel = vec3.subtract(vec3.create(), p, xyz);
                var pos = [];

                // Horrizontal relative position
                if (vec3.dot(rel, Nl) <= 0) pos[0] = -1;
                else if (vec3.dot(rel, Nr) <= 0) pos[0] = 1;
                else pos[0] = 0;

                // Vertical relative position
                if (vec3.dot(rel, Nb) <= 0) pos[1] = -1;
                else if (vec3.dot(rel, Nt) <= 0) pos[1] = 1;
                else pos[1] = 0;

                // Depth-wise relative position
                var relZ = -vec3.dot(rel, Nz);
                if (relZ <= near) pos[2] = -1;
                else if (relZ >= far) pos[2] = 1;
                else pos[2] = 0;
                return pos;
            };
            var checkPolygon = function (points) {
                // if (!points || 0 === points.length) return true;
                var pos = [];
                for (var i = 0; i < points.length; i++) {
                    pos[i] = checkPos(points[i]);
                }
                var ans = { inside: true, outside: false };
                for (var j = 0, i; j < 3; j++) {
                    if (pos[0][j] === 0) {
                        if (!ans.inside) continue;
                        for (i = 1; i < pos.length && pos[i][j] === 0; i++) { }
                        if (i < pos.length) ans.inside = false;
                    } else {
                        ans.inside = false;
                        for (i = 1; i < pos.length && pos[i][j] === pos[0][j]; i++) { }
                        if (i === pos.length) ans.outside = true;
                    }
                }
                return ans;
            };
            return {
                Nl: vec3.normalize(vec3.create(), Nl),
                Nr: vec3.normalize(vec3.create(), Nr),
                Nt: vec3.normalize(vec3.create(), Nt),
                Nb: vec3.normalize(vec3.create(), Nb),
                Nz: vec3.normalize(vec3.create(), Nz),
                near: near,
                checkPolygon: checkPolygon,
                checkTri: function (vertex, tri, start, rMatrix, tMatrix) { // Return true if triangle is outside of frustum
                    return checkPolygon(getTriPoints(vertex, tri, start, rMatrix, tMatrix)).outside;
                },
                checkFrame: function (frame) { // Return true if frame is outside of frustum
                    return checkPolygon(getFramePoints(frame)).outside;
                },
                checkCell: function (cell) { // Return true if cell is outside of frustum
                    return checkPolygon(getCellPoints(cell));
                },
                checkRoom: function (room) {
                    if (room.type === ROOMS.CELL_TYPE.ROOM)
                        return checkPolygon(getRoomPoints(room));
                    else if (room.type === ROOMS.CELL_TYPE.PORTAL)
                        return checkPolygon(getPortalPoints(room));
                    else
                        return { inside: false, outside: true };
                },
            };
        },
        multiFrustum: function (inputFrustums) {
            var frustums = inputFrustums;
            var n = frustums.length;
            var checkPolygon = function (points) {
                var ans = { inside: false, outside: true };
                for (var i = 0; i < n; i++) {
                    var subAns = frustums[i].checkPolygon(points);
                    if (subAns.inside) ans.inside = true;
                    if (!subAns.outside) ans.outside = false;
                }
                return ans;
            };
            return {
                n: n,
                frustums: frustums,
                addFrustum: function (frustum) {
                    frustums.push(frustum);
                    n++;
                },
                checkPolygon: checkPolygon,
                checkTri: function (vertex, tri, start, rMatrix, tMatrix) {
                    return checkPolygon(getTriPoints(vertex, tri, start, rMatrix, tMatrix)).outside;
                },
                checkFrame: function (frame) { // Return true if frame is outside of frustum
                    return checkPolygon(getFramePoints(frame)).outside;
                },
                checkCell: function (cell) { // Return true if cell is outside of frustum
                    return checkPolygon(getCellPoints(cell));
                },
                checkRoom: function (room) {
                    if (room.type === ROOMS.CELL_TYPE.ROOM)
                        return checkPolygon(getRoomPoints(room));
                    else if (room.type === ROOMS.CELL_TYPE.PORTAL)
                        return checkPolygon(getPortalPoints(room));
                    else
                        return { inside: false, outside: true };
                },
            };
        },
        intersectFrustum: function (inputFrustums1, inputFrustums2) {
            var frustum1 = inputFrustums1, frustum2 = inputFrustums2;
            var checkPolygon = function (points) {
                var ans1 = frustum1.checkPolygon(points), ans2 = frustum2.checkPolygon(points);
                return {
                    inside: ans1.inside && ans2.inside,
                    outside: ans1.outside || ans2.outside,
                };
            };
            return {
                frustum1: frustum1,
                frustum2: frustum2,
                checkPolygon: checkPolygon,
                checkTri: function (vertex, tri, start, rMatrix, tMatrix) {
                    return checkPolygon(getTriPoints(vertex, tri, start, rMatrix, tMatrix)).outside;
                },
                checkFrame: function (frame) { // Return true if frame is outside of frustum
                    return checkPolygon(getFramePoints(frame)).outside;
                },
                checkCell: function (cell) { // Return true if cell is outside of frustum
                    return checkPolygon(getCellPoints(cell));
                },
                checkRoom: function (room) {
                    if (room.type === ROOMS.CELL_TYPE.ROOM)
                        return checkPolygon(getRoomPoints(room));
                    else if (room.type === ROOMS.CELL_TYPE.PORTAL)
                        return checkPolygon(getPortalPoints(room));
                    else
                        return { inside: false, outside: true };
                },
            };
        },
    };
}();