var VERTEX_CLUSTER = function () {
    var ERR = 1e-10;
    var calcCos = function (p1, p2, p3) {
        var v1 = vec3.sub(vec3.create(), p1, p2),
            v2 = vec3.sub(vec3.create(), p3, p2);
        vec3.normalize(v1, v1);
        vec3.normalize(v2, v2);
        return vec3.dot(v1, v2);
    };
    var reshape = function (arr, dim) {
        var vec = [];
        for (var i = 0, n = arr.length; i < n; i += dim) {
            var row = [];
            for (var j = 0; j < dim; j++)
                row[j] = arr[i + j];
            vec.push(row);
        }
        return vec;
    };
    // Refer to "Multi-resolution 3D Approximations for Rendering Complex Scenes"
    var clustering = function (V, nx, ny, nz) {
        var n = V.length,
            xlim = [Number.MAX_VALUE, Number.MIN_VALUE],
            ylim = [Number.MAX_VALUE, Number.MIN_VALUE],
            zlim = [Number.MAX_VALUE, Number.MIN_VALUE];
        for (var i = 0; i < n; i += 3) {
            if (V[i] < xlim[0]) xlim[0] = V[i];
            if (V[i] > xlim[1]) xlim[1] = V[i];
            if (V[i + 1] < ylim[0]) ylim[0] = V[i + 1];
            if (V[i + 1] > ylim[1]) ylim[1] = V[i + 1];
            if (V[i + 2] < zlim[0]) zlim[0] = V[i + 2];
            if (V[i + 2] > zlim[1]) zlim[1] = V[i + 2];
        }
        var dx = (xlim[1] - xlim[0]) / nx,
            dy = (ylim[1] - ylim[0]) / ny,
            dz = (zlim[1] - zlim[0]) / nz,
            ids = [], vSets = [];
        for (var i = 0, id; i < n; i += 3) {
            id = Math.min(Math.floor((V[i] - xlim[0]) / dx), nx - 1)
                + Math.min(Math.floor((V[i + 1] - ylim[0]) / dy), ny - 1) * nx
                + Math.min(Math.floor((V[i + 2] - zlim[0]) / dz), nz - 1) * nx * ny;
            ids.push(id);
            if (vSets[id] === undefined) vSets[id] = [i / 3];
            else vSets[id].push(i / 3);
        }
        var R = [], C = [];
        for (var i = 0, nSets = vSets.length, id; i < nSets; i++) {
            if (vSets[i] === undefined) continue;
            id = C.length;
            C.push(vSets[i]);
            for (var j = 0; j < vSets[i].length; j++) {
                R[vSets[i][j]] = id;
            }
        }
        return { R: R, C: C };
    };
    var buildVertices = function (arr) {
        var V = [];
        for (var i = 0, n = arr.length; i < n; i += 3) {
            V.push(vec3.fromValues(arr[i], arr[i + 1], arr[i + 2]));
        }
        return V;
    };
    var updateFactor1 = function (factor, i, p1, p2, p3) {
        if (factor[i] === undefined) factor[i] = Math.sqrt((1 + calcCos(p1, p2, p3)) / 2);
        else factor[i] = Math.min(factor[i], Math.sqrt((1 + calcCos(p1, p2, p3)) / 2));
    };
    var updateFactor2 = function (factor, i, dist) {
        if (factor[i] === undefined) factor[i] = dist;
        else factor[i] = Math.max(factor[i], dist);
    };
    var grading = function (V, T) {
        var n = V.length, m = T.length, factor1 = [], factor2 = [], W = [];
        for (var i = 0, p1, p2, p3, d12, d23, d31; i < m; i += 3) {
            p1 = V[T[i]];
            p2 = V[T[i + 1]];
            p3 = V[T[i + 2]];
            d12 = vec3.dist(p1, p2);
            d23 = vec3.dist(p2, p3);
            d31 = vec3.dist(p3, p1);

            // Only update factor1 when the 3 points forms a valid triangle.
            if (d12 > ERR && d23 > ERR && d31 > ERR) {
                updateFactor1(factor1, T[i], p3, p1, p2);
                updateFactor1(factor1, T[i + 1], p1, p2, p3);
                updateFactor1(factor1, T[i + 2], p2, p3, p1);
            }

            updateFactor2(factor2, T[i], d12);
            updateFactor2(factor2, T[i], d31);
            updateFactor2(factor2, T[i + 1], d23);
            updateFactor2(factor2, T[i + 1], d12);
            updateFactor2(factor2, T[i + 2], d31);
            updateFactor2(factor2, T[i + 2], d23);
        }
        for (var i = 0; i < n; i++) {
            W[i] = factor1[i] * factor2[i];
            if (!W[i]) W[i] = 0;
        }
        return W;
    };
    var synthesis = function (V, N, UV, C, W) {
        var SV = [], SN = [], SUV = [], n = C.length;
        for (var i = 0, max; i < n; i++) {
            // find index of max weight
            id = C[i][0];
            for (var j = 1, m = C[i].length; j < m; j++) {
                if (W[C[i][j]] > W[id]) id = C[i][j];
            }
            // synthesis
            SV.push([V[3 * id], V[3 * id + 1], V[3 * id + 2]]);
            SN.push([N[3 * id], N[3 * id + 1], N[3 * id + 2]]);
            SUV.push([UV[2 * id], UV[2 * id + 1]]);
        }
        return { SV: SV, SN: SN, SUV: SUV };
    };
    var getRepresentVertex = function (vertices, i) {
        if (vertices[i] === undefined) vertices[i] = {id: i, edge: []};
        return vertices[i];
    };
    var getRepresentEdge = function (v1, v2) {
        var n = v1.edge.length;
        for (var i = 0; i < n; i++) {
            if (v1.edge[i].v2 === v2.id) return v1.edge[i]; 
        }
        var e = {v1: v1.id, v2: v2.id, tri: []};
        v1.edge.push(e);
        v2.edge.push(e);
        return e;
    };
    var eliminate = function (T, R) {
        var n = T.length, ST = [], vertices = [];
        for (var i = 0, v1, v2, v3, e1, e2, e3, tri; i < n; i += 3) {
            // get vertices
            v1 = getRepresentVertex(vertices, R[T[i]]);
            v2 = getRepresentVertex(vertices, R[T[i + 1]]);
            v3 = getRepresentVertex(vertices, R[T[i + 2]]);

            // triangle degenerates into an isolated points
            if (v1 === v2 && v2 === v3) continue;
            // triangle degenerates into a dangling edge
            if (v1 === v2 || v2 === v3 || v1 === v3) continue;
            
            // get edges
            e1 = getRepresentEdge(v1, v2);
            e2 = getRepresentEdge(v2, v3);
            e3 = getRepresentEdge(v3, v1);

            // eliminate triangles
            var dup = false;
            for (var j = 0, m = e1.tri.length; !dup && j < m; j++) {
                if (e1.tri[j] !== v3.id) continue;
                dup = true;
            }
            if (dup) continue;
            ST.push([v1.id, v2.id, v3.id]);
            e1.tri.push(v1.id, v2.id, v3.id);
            e2.tri.push(v1.id, v2.id, v3.id);
            e3.tri.push(v1.id, v2.id, v3.id);
        }
        return {ST: ST};
    };
    var eliminateSplit = function (T, R, SV, coord) {
        var n = T.length, ST = [], vertices = [], SVSplit = coord.concat();
        for (var i = 0, v1, v2, v3, e1, e2, e3, tri; i < n; i += 3) {
            // get vertices
            v1 = getRepresentVertex(vertices, R[T[i]]);
            v2 = getRepresentVertex(vertices, R[T[i + 1]]);
            v3 = getRepresentVertex(vertices, R[T[i + 2]]);

            // triangle degenerates into an isolated points
            if (v1 === v2 && v2 === v3) continue;
            // triangle degenerates into a dangling edge
            if (v1 === v2 || v2 === v3 || v1 === v3) continue;
            
            // get edges
            e1 = getRepresentEdge(v1, v2);
            e2 = getRepresentEdge(v2, v3);
            e3 = getRepresentEdge(v3, v1);

            // eliminate triangles
            var dup = false;
            for (var j = 0, m = e1.tri.length; !dup && j < m; j++) {
                if (e1.tri[j] !== v3.id) continue;
                dup = true;
            }
            if (dup) continue;

            ST.push([T[i], T[i + 1], T[i + 2]]);
            e1.tri.push(v1.id, v2.id, v3.id);
            e2.tri.push(v1.id, v2.id, v3.id);
            e3.tri.push(v1.id, v2.id, v3.id);

            SVSplit[T[i]] = SV[v1.id];
            SVSplit[T[i + 1]] = SV[v2.id];
            SVSplit[T[i + 2]] = SV[v3.id];
        }
        return {ST: ST, SV: SVSplit};
    };
    return {
        NX: 20, NY: 20, NZ: 20,
        generate: function (model, nx, ny, nz) {
            var V = buildVertices(model.coordArray);
            var W = grading(V, model.indexArray);
            // console.log('grade:', W);
            var cluster = clustering(model.coordArray, nx, ny, nz);
            // console.log('cluster:', cluster);
            var syn = synthesis(model.coordArray, model.normalArray, model.uvArray, cluster.C, W);
            // console.log('synthesis:', syn);
            var elimination = eliminate(model.indexArray, cluster.R);
            // console.log('elimination:', elimination);
            return {
                material: model.material,
                vertices: syn.SV,
                normals: syn.SN,
                uvs: syn.SUV,
                triangles: elimination.ST,
            };
        },
        generateSplit: function (model, nx, ny, nz) {
            var V = buildVertices(model.coordArray);
            var W = grading(V, model.indexArray);
            // console.log('grade:', W);
            var cluster = clustering(model.coordArray, nx, ny, nz);
            // console.log('cluster:', cluster);
            var syn = synthesis(model.coordArray, model.normalArray, model.uvArray, cluster.C, W);
            // console.log('synthesis:', syn);
            var elimination = eliminateSplit(model.indexArray, cluster.R, syn.SV, model.coordArray);
            // console.log('elimination:', elimination);
            return {
                material: model.material,
                vertices: elimination.SV,
                normals: reshape(model.normalArray, 3),
                uvs: reshape(model.uvArray, 2),
                triangles: elimination.ST,
            };
        },
    };
}();