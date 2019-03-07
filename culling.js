var CULLING = function () {
    var frustum = function (camera, left, right, up, down) {
        return {
            planeLeft: function () { },
        };
    };
    var resetModels = function (models) {
        var models = ROOMS.filter(models);
        for (var j = 0; j < models.length; j++) {
            models[j].culling = false;
        }
        return models;
    };
    var frustumCulling = function (shaders, frustum, models) {
        var cullingModel = [];
        var filterModels = ROOMS.filter(models);
        for (let i = 0, model; i < filterModels.length; i++) {
            model = filterModels[i];
            model.culling = false;
            for (let j = 0; j < model.indexArray.length; j += 3) {
                if (!frustum.checkTri(model.coordArray, model.indexArray,
                    j, model.rMatrix, model.tMatrix)) {   // Triangle inside
                    if (model.culling)
                        model.indexArrayCulling = model.indexArrayCulling
                            .concat(model.indexArray.slice(j, j + 3));
                } else if (!model.culling) {    // Triangle outside
                    model.culling = true;
                    model.indexArrayCulling = model.indexArray.slice(0, j);
                }
            }

            // Add buffer for culling triangle topology
            if (model.culling) {
                if (model.indexArrayCulling.length === 0) continue;
                model.triBufferSizeCulling = model.indexArrayCulling.length;
                for (var j = 0; j < shaders.length; j++)
                    MODELS.bufferTriangleSetCulling(shaders[j], model);
            }
            if (model === undefined) continue;
            cullingModel.push(model)
        }
        return cullingModel;
    };
    var frustumCullingRoom = function (shaders, frustum, room) {
        return frustumCulling(shaders, frustum, room.array);
    };
    var hierarchicalCulling = function (shaders, frustum, cells) {
        var cullingModel = [];
        for (var i = 0, m = cells.length, cell; i < m; i++) {
            cell = cells[i];
            var cellPos = frustum.checkCell(cell);
            if (cellPos.outside) continue;
            if (cellPos.inside) {
                // var models = ROOMS.filter(cell.array);
                // for (var j = 0; j < models.length; j++) {
                //     models[j].culling = false;
                // }
                cullingModel = cullingModel.concat(resetModels(cell.array));
            } else {
                cullingModel = cullingModel.concat(frustumCulling(shaders, frustum, cell.array));
            }
        }
        return cullingModel;
    };
    var hierarchicalCullingRoom = function (shaders, frustum, room) {
        var roomPos = frustum.checkRoom(room);
        if (roomPos.outside) return [];
        if (roomPos.inside) return resetModels(room.array);
        return hierarchicalCulling(shaders, frustum, room.cells);
    };
    return {
        hierarchy: false,
        model: {},
        room: {},
        update: function (duration, now) {
            for (var i = 0, j, m = ROOMS.rooms.length, n, room, furniture; i < m; i++) {
                room = ROOMS.rooms[i];
                for (j = 0, n = room.furniture.length; j < n; j++) {
                    furniture = room.furniture[j];
                    if (!furniture.animation) continue;
                    if (furniture.animation.spin && furniture.animation.axis) {
                        mat4.multiply(furniture.rMatrix, mat4.fromRotation(
                            mat4.create(), furniture.animation.spin, furniture.animation.axis),
                            furniture.rMatrix);
                    }
                }
            }
        },
        frustumCulling: frustumCulling,
        frustumCullingRoom: frustumCullingRoom,
        hierarchicalCulling: hierarchicalCulling,
        hierarchicalCullingRoom: hierarchicalCullingRoom,
        portalCulling: function (shaders, frustum, cullingRoom, room, rVisited, pVisited) {
            if (room === undefined) return [];
            var cullingModel;
            if (room.type === ROOMS.CELL_TYPE.ROOM) {
                if (rVisited[room.id]) return [];
                rVisited[room.id] = true;
                // Check each neighbor
                cullingModel = cullingRoom(shaders, frustum, room);
                for (var i = 0, j, portals, frame, inFrame, frameFrustum, portalFrustums = [];
                    i < room.connect.length; i++) {
                    portals = room.connect[i];
                    if (!portals) continue;
                    for (j = 0; j < portals.length; j++) {
                        if (pVisited[portals[j].id]) continue;
                        frame = portals[j].frames[room.id];
                        // Check if the frame is visible to current frustum
                        if (frustum.checkFrame(frame)) continue;
                        pVisited[portals[j].id] = true;
                        // Frustum culling the portal model
                        frameFrustum = FRUSTUM.intersectFrustum(frustum, CAMERA.portalFrustum(frame));
                        cullingModel = cullingModel.concat(
                            cullingRoom(shaders, frameFrustum, portals[j]));
                        // Get frustum from this portal
                        inFrame = portals[j].inFrames[i];
                        if (frameFrustum.checkFrame(inFrame)) continue;
                        portalFrustums.push(FRUSTUM.intersectFrustum(
                            frameFrustum, CAMERA.portalFrustum(inFrame)));
                    }
                    // Recursive call portal culling to get models inside these portal frustum
                    if (portalFrustums.length > 0)
                        cullingModel = cullingModel.concat(CULLING.portalCulling(shaders,
                            FRUSTUM.intersectFrustum(frustum, FRUSTUM.multiFrustum(portalFrustums)),
                            cullingRoom, ROOMS.rooms[i], rVisited, pVisited));
                }
            } else if (room.type === ROOMS.CELL_TYPE.PORTAL) {
                // Check visited
                if (pVisited[room.id]) return [];
                pVisited[room.id] = true;
                // Check each frame
                cullingModel = cullingRoom(shaders, frustum, room);
                for (var i = 0, k, m = room.inFrames.length, frame; i < m; i++) {
                    frame = room.inFrames[i];
                    if (frame === undefined) continue;
                    // Check if the frame is visible to current frustims
                    if (frustum.checkFrame(frame)) continue;
                    // Recursive call portal culling to get models inside these portal frustums
                    var neighborModel = CULLING.portalCulling(shaders,
                        FRUSTUM.intersectFrustum(frustum, CAMERA.portalFrustum(frame)),
                        cullingRoom, ROOMS.rooms[i], rVisited, pVisited);
                    cullingModel = cullingModel.concat(neighborModel);
                }
            }
            return cullingModel;
        },
        main: function () {
            DOM.load(OPTION, CAMERA, URL);   // load the data from html page
            // LIGHTS.load(); // load in the lights
            SHADER.setupWebGL(); // set up the webGL environment
            TOP_SHADER.setupWebGL(); // set up the webGL environment
            TOP_CAMERA.initCamera(); // Initialize camera
            CAMERA.initCamera(); // Initialize camera
            ROOMS.load([SHADER, TOP_SHADER]);
            EVENTS.setupEvent();
            RASTERIZE.setupOnLoad();
        },
    };
}();