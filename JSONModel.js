var JSON_MODEL = function () {
    return {
        loadTriangleSets: function (shaders, inputTriangles) {
            var nShader = shaders.length;
            var triangleSets = [];
            if (inputTriangles != String.null) {
                var whichSetTri; // index of triangle in current triangle set
                var vtxToAdd = []; // vtx coords to add to the coord array

                for (var whichSet = 0; whichSet < inputTriangles.length; whichSet++) {
                    var curSet = inputTriangles[whichSet];
                    var triangleSet = {};
                    triangleSet.doubleSide = true;
                    triangleSet.triBufferSize = 0;
                    triangleSet.specularModel = 1;
                    triangleSet.material = curSet.material;
                    if (curSet.material.texture) {
                        if (curSet.material.textureMode === undefined)
                            triangleSet.material.textureMode = 1;
                    } else {
                        delete triangleSet.material.texture;
                        triangleSet.material.textureMode = 0;
                    }
                    triangleSet.coordArray = []; // 1D array of vertex coords for WebGL
                    triangleSet.normalArray = []; // 1D array of vertex normals for WebGL
                    triangleSet.indexArray = []; // 1D array of vertex indices for WebGL
                    triangleSet.uvArray = []; // 1D array of vertex uvs for WebGL
                    if (curSet.material.textureMode) {
                        triangleSet.texture = [];
                        for (var i = 0; i < nShader; i++)
                            triangleSet.texture[shaders[i].id] = shaders[i].texture[triangleSet.material.texture];
                    }
                    if (curSet.mark) triangleSet.mark = curSet.mark;

                    // Calculate triangles center
                    var triCenter = vec3.create();
                    for (let i = 0; i < curSet.vertices.length; i++) {
                        vec3.add(triCenter, triCenter, curSet.vertices[i]);
                    }
                    vec3.scale(triCenter, triCenter, 1.0 / curSet.vertices.length);

                    // Add coordinates to buffer
                    for (let i = 0; i < curSet.vertices.length; i++) {
                        vtxToAdd = vec3.subtract(vec3.create(), curSet.vertices[i], triCenter);
                        triangleSet.coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                    }

                    // Add normals to buffer
                    for (let i = 0; i < curSet.normals.length; i++) {
                        triangleSet.normalArray.push(curSet.normals[i][0], curSet.normals[i][1], curSet.normals[i][2]);
                    }

                    // Add triangles to buffer
                    for (whichSetTri = 0; whichSetTri < curSet.triangles.length; whichSetTri++) {
                        for (let i = 0; i < 3; i++ , triangleSet.triBufferSize++) {
                            triangleSet.indexArray.push(curSet.triangles[whichSetTri][i]);
                        }
                    } // end for triangles in set

                    // Add uvs
                    for (let i = 0; i < curSet.uvs.length; i++)
                        triangleSet.uvArray.push(curSet.uvs[i][0], curSet.uvs[i][1]);

                    // Buffer data arrays into GPU
                    for (var i = 0; i < nShader; i++)
                        MODELS.bufferTriangleSet(shaders[i], triangleSet);

                    // Initialize model transform matrices
                    triangleSet.tMatrix = mat4.fromTranslation(mat4.create(), triCenter);
                    triangleSet.rMatrix = mat4.identity(mat4.create());

                    // Push triangleset into array
                    // triangleSet.id = MODELS.array.length;
                    // MODELS.array.push(triangleSet);
                    triangleSets.push(triangleSet);
                } // end for each triangle set
            } // end if triangles found
            return triangleSets;
        },
        loadEllipsoids: function (shaders, inputEllipsoids, nLatitude = 15, nLongitude = 30) {
            var nShader = shaders.length;
            // var inputEllipsoids = JSON_MODEL.getJSONFile(URL.ellipsoids, "ellipsoids");
            var ellipsoids = [];

            if (inputEllipsoids != String.null) {
                for (var whichSet = 0; whichSet < inputEllipsoids.length; whichSet++) {
                    var curSet = inputEllipsoids[whichSet];
                    var triangleSet = {};
                    triangleSet.doubleSide = false;
                    triangleSet.triBufferSize = 0;
                    triangleSet.specularModel = 1;
                    triangleSet.material = {};
                    triangleSet.material.ambient = curSet.ambient;
                    triangleSet.material.diffuse = curSet.diffuse;
                    triangleSet.material.specular = curSet.specular;
                    triangleSet.material.n = curSet.n;
                    triangleSet.material.textureMode = curSet.textureMode;
                    triangleSet.coordArray = []; // 1D array of vertex coords for WebGL
                    triangleSet.normalArray = []; // 1D array of vertex normals for WebGL
                    triangleSet.indexArray = []; // 1D array of vertex indices for WebGL
                    triangleSet.uvArray = []; // 1D array of vertex uvs for WebGL
                    if (curSet.textureMode) {
                        triangleSet.texture = [];
                        for (var i = 0; i < nShader; i++)
                            triangleSet.texture[shaders[i].id] = shaders[i].texture[curSet.texture];
                        triangleSet.material.texture = curSet.texture;
                    }

                    // Create triangles center
                    var triCenter = vec3.fromValues(curSet.x, curSet.y, curSet.z);

                    // Calculate and add vertices coordinates and normals
                    let deltaLat = Math.PI / nLatitude;
                    let deltaLong = 2 * Math.PI / nLongitude;
                    for (let i = 0, theta = 0.0; i <= nLatitude; i++ , theta += deltaLat) {
                        let sinT = Math.sin(theta), cosT = Math.cos(theta), v = 1.0 - theta / Math.PI;
                        for (let j = 0, phi = 0.0; j <= nLongitude; j++ , phi += deltaLong) {
                            let sinP = Math.sin(phi), cosP = Math.cos(phi);
                            let xu = cosP * sinT, yu = cosT, zu = sinP * sinT;
                            triangleSet.coordArray.push(xu * curSet.a, yu * curSet.b, zu * curSet.c);
                            triangleSet.normalArray.push(xu / curSet.a, yu / curSet.b, zu / curSet.c);
                            triangleSet.uvArray.push(1 - phi / Math.PI / 2, v);
                        }
                    }

                    // Calculate and add triangles
                    for (let i = 0, up = 0, down = nLongitude + 1; i < nLatitude; i++ , up = down, down += nLongitude + 1) {
                        for (let left = 0, right = 1; left < nLongitude; left++ , right++ , triangleSet.triBufferSize += 6) {
                            triangleSet.indexArray.push(up + left, down + left, up + right);
                            triangleSet.indexArray.push(down + left, down + right, up + right);
                        }
                    }

                    // Buffer data arrays into GPU
                    for (var i = 0; i < nShader; i++)
                        MODELS.bufferTriangleSet(shaders[i], triangleSet);

                    // Initialize model transform matrices
                    triangleSet.tMatrix = mat4.fromTranslation(mat4.create(), triCenter);
                    triangleSet.rMatrix = mat4.identity(mat4.create());

                    // Push triangleset into array
                    ellipsoids.push(triangleSet);
                } // end for each ellipsoid
                return ellipsoids;
            } // end if ellipsoids found
        },
        loadSpheres: function (shaders, inputSpheres, nLatitude = 12, nLongitude = 24) {
            for (var i = 0, n = inputSpheres.length; i < n; i++) {
                if (inputSpheres[i].textureMode === undefined)
                    inputSpheres[i].textureMode = inputSpheres[i].texture ? 1 : 0;
                inputSpheres[i].a = inputSpheres[i].r;
                inputSpheres[i].b = inputSpheres[i].r;
                inputSpheres[i].c = inputSpheres[i].r;
            }
            var models = JSON_MODEL.loadEllipsoids(shaders, inputSpheres, nLatitude, nLongitude);

            // Create LOD
            var simpModels = [
                JSON_MODEL.loadEllipsoids(shaders, inputSpheres, parseInt(nLatitude / 2), parseInt(nLongitude / 2)),
                JSON_MODEL.loadEllipsoids(shaders, inputSpheres, parseInt(nLatitude / 4), parseInt(nLongitude / 4)),
            ];
            for (var i = 0, n = models.length; i < n; i++) {
                LOD.initModel(models[i], inputSpheres[i].r, [simpModels[0][i], simpModels[1][i]]);
            }
            return models;
        },
        getJSONFile: function (url, descr) {
            try {
                if ((typeof (url) !== "string") || (typeof (descr) !== "string"))
                    throw "getJSONFile: parameter not a string";
                else {
                    var httpReq = new XMLHttpRequest(); // a new http request
                    httpReq.open("GET", url, false); // init the request
                    httpReq.send(null); // send the request
                    var startTime = Date.now();
                    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                        if ((Date.now() - startTime) > 3000)
                            break;
                    } // until its loaded or we time out after three seconds
                    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                        throw "Unable to open " + descr + " file!";
                    else
                        return JSON.parse(httpReq.response);
                } // end if good params
            } // end try

            catch (e) {
                console.log(e);
                return (String.null);
            }
        }
    };
}();