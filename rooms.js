var ROOMS = function () {
    const CITY_SCALE = 0.025, BATTERY_SCALE = 0.0125;
    var DIRECTION = {
        UP: 0,
        LEFT: 1,
        DOWN: 2,
        RIGHT: 3
    };
    var idMatrix = mat4.create();
    var testRooms = {
        "rooms": [
            ["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"],
            ["s", 0, 0, 0, 0, 0, "s", 1, 1, 1, 1, 1, "s"],
            ["s", 0, 0, 0, 0, 0, "p", 1, 1, 1, 1, 1, "s"],
            ["s", 0, 0, 0, 0, 0, "s", 1, 1, 1, 1, 1, "s"],
            ["s", 0, 0, 0, 0, 0, "p", 1, 1, 1, 1, 1, "s"],
            ["s", 0, 0, 0, 0, 0, "s", 1, 1, 1, 1, 1, "s"],
            ["s", 0, 0, 0, 0, 0, "s", "s", "p", "s", "p", "s", "s"],
            ["s", 0, 0, 0, 0, 0, "s", 2, 2, 2, 2, 2, "s"],
            ["s", 0, 0, 0, 0, 0, "p", 2, 2, 2, 2, 2, "s"],
            ["s", 0, 0, 0, 0, 0, "s", 2, 2, 2, 2, 2, "s"],
            ["s", 0, 0, 0, 0, 0, "p", 2, 2, 2, 2, 2, "s"],
            ["s", 0, 0, 0, 0, 0, "s", 2, 2, 2, 2, 2, "s"],
            ["s", 0, 0, 0, 0, 0, "s", "s", "s", "s", "s", "s", "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", 0, 0, 0, 0, 0, "s"],
            ["s", "s", "s", "s", "s", "s", "s"],
        ],
        "furniture": [
            [0, 0, 0, "sphere", 2],
            [0, 1, 0, "sphere", 2],
            [0, 2, 0, "sphere", 2],
            [0, 3, 0, "sphere", 2],
            [0, 4, 0, "sphere", 2],
            // [1, 4, 4, "triangleset", 0],
            // [0, 3, 2, "standard", 0],
            // [1, 0, 4, "standard", 1],
        ],
    };
    var triangles = {
        floor: {
            "material": {
                "ambient": [0.1, 0.1, 0.1], "diffuse": [0.6, 0.4, 0.4], "specular": [0.3, 0.3, 0.3],
                "n": 11,
                "texture": "floor", "textureMode": 1
            },
            "vertices": [[0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 0, -0.5], [0, 0, 0]],
            "normals": [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
            "uvs": [[1, 1], [1, 0], [0, 0], [0, 1], [0.5, 0.5]],
            "triangles": [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
        },
        ceiling: {
            "material": {
                "ambient": [0.1, 0.1, 0.1], "diffuse": [0.6, 0.4, 0.4], "specular": [0.3, 0.3, 0.3],
                "n": 11,
                "texture": "ceiling", "textureMode": 1
            },
            "vertices": [[0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5], [-0.5, 0, -0.5], [0, 0, 0]],
            "normals": [[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]],
            "uvs": [[1, 1], [1, 0], [0, 0], [0, 1], [0.5, 0.5]],
            "triangles": [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
            "mark": {
                isCeiling: true
            },
        },
        wall: {
            "material": {
                "ambient": [0.1, 0.1, 0.1], "diffuse": [0.6, 0.4, 0.4], "specular": [0.3, 0.3, 0.3],
                "n": 11,
                "texture": "background", "textureMode": 1
            },
            "vertices": [[0, 1, 0], [0, 0, 0], [1, 0, 0], [1, 1, 0]],
            "normals": [[0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]],
            "uvs": [[1, 1], [1, 0], [0, 0], [0, 1]],
            "triangles": [[0, 1, 2], [2, 3, 0]]
        }
    };
    var sphere = {
        animation: {
            spin: 0.004, axis: vec3.fromValues(0, 1, 0),
        },
    };
    var city = {
        pos: vec3.fromValues(0.5, 0.2, 0.5),
        material: {
            ambient: [0, 0, 0], diffuse: [0.3, 0.3, 0.7], specular: [1.0, 1.0, 1.0], n: 10, textureMode: 0
        },
        scaleMatrix: mat4.scale(mat4.create(), idMatrix, [CITY_SCALE, CITY_SCALE, CITY_SCALE]),
        animation: {
            spin: 0.002, axis: vec3.fromValues(0, 1, 0),
        },
        mark: {
            isStandard: true
        },
    };
    var battery = {
        pos: vec3.fromValues(0.5, 0.3, 0.5),
        material: {
            ambient: [0, 0, 0], diffuse: [0.1, 0.5, 0.1], specular: [1.0, 1.0, 1.0], n: 10, textureMode: 0
        },
        scaleMatrix: mat4.scale(mat4.create(), idMatrix, [BATTERY_SCALE, BATTERY_SCALE, BATTERY_SCALE]),
        animation: {
            spin: 0.003, axis: vec3.fromValues(0, 0.8, 0.2),
        },
        mark: {
            isStandard: true
        },
    };
    var lightModel = {
        "ambient": [1, 1, 1], "diffuse": [1, 1, 1], "specular": [1, 1, 1]
    };

    var createWall = function (i, j, direction, prototype) {
        var x = j + 0.5, y = 0.5, z = i + 0.5;
        switch (direction) {
            case DIRECTION.UP:
                z -= 0.5;
                break;
            case DIRECTION.DOWN:
                z += 0.5;
                break;
            case DIRECTION.LEFT:
                x -= 0.5;
                break;
            case DIRECTION.RIGHT:
                x += 0.5;
                break;
        }
        return MODELS.copyModel(prototype,
            mat4.fromRotation(mat4.create(), direction * Math.PI / 2, [0, 1, 0]),
            mat4.fromTranslation(mat4.create(), vec3.fromValues(x, y, z))
        );
    };
    var createFloor = function (i, j, prototype) {
        return MODELS.copyModel(prototype,
            mat4.create(),
            mat4.fromTranslation(mat4.create(), vec3.fromValues(j + 0.5, 0, i + 0.5))
        );
    };
    var createCeiling = function (i, j, prototype) {
        return MODELS.copyModel(prototype,
            mat4.create(),
            mat4.fromTranslation(mat4.create(), vec3.fromValues(j + 0.5, 1, i + 0.5))
        );
    };
    var createFrame = function (i, j, direction) {
        switch (direction) {
            case DIRECTION.UP:
                return {
                    left: { x: j, z: i },
                    right: { x: j + 1, z: i },
                };
            case DIRECTION.DOWN:
                return {
                    left: { x: j + 1, z: i + 1 },
                    right: { x: j, z: i + 1 },
                };
            case DIRECTION.LEFT:
                return {
                    left: { x: j, z: i + 1 },
                    right: { x: j, z: i },
                };
            case DIRECTION.RIGHT:
                return {
                    left: { x: j + 1, z: i },
                    right: { x: j + 1, z: i + 1 },
                };
        }
    };
    var parseDirection = function (data, i, j, direction, room, cell) {
        if (data[i][j] === undefined) return;
        if (data[i][j] === "s") {
            var wallModel = createWall(i, j, direction, ROOMS.prototype.wall);
            room.walls.push(wallModel);
            cell.array.push(wallModel);
        } else if (room.frames && Number.isInteger(data[i][j])) {
            room.frames[data[i][j]] = createFrame(i, j, direction);
        }
    };
    var eachDirection = function (data, i, j, room, cell) {
        parseDirection(data, i + 1, j, DIRECTION.UP, room, cell);
        parseDirection(data, i, j + 1, DIRECTION.LEFT, room, cell);
        parseDirection(data, i - 1, j, DIRECTION.DOWN, room, cell);
        parseDirection(data, i, j - 1, DIRECTION.RIGHT, room, cell);
    };


    return {
        CELL_TYPE: {
            ROOM: 0,
            PORTAL: 1,
        },
        map: [],
        cellMap: [],
        prototype: { furniture: { standard: [] } },
        ready: false,
        rooms: [],
        portals: [],
        cells: [],
        initialTrans: [],
        initialRot: 0,
        rVisited: [],
        pVisited: [],
        renderStandard: true,
        renderCeiling: true,
        furniture: {
            array: [],
            selectId: 0,
        },

        filter: function (models) {
            var passedModels = [];
            var model;
            for (var i = 0, m = models.length; i < m; i++) {
                if (models[i].mark && (
                    !ROOMS.renderStandard && models[i].mark.isStandard ||
                    !ROOMS.renderCeiling && models[i].mark.isCeiling
                )) {
                    continue;
                }
                model = LOD.filter(models[i]);
                if (model) passedModels.push(model);
            }
            return passedModels;
        },

        // Call after prototype is initialized
        parseRooms: function (data, map) {
            map.rooms = [];
            map.cellMap = [];
            map.portals = [];
            for (var i = 0, m = data.length; i < m; i++) {
                map.map[i] = data[i].slice();
                map.cellMap[i] = [];
                for (var j = 0, n = data[i].length; j < n; j++) {
                    if (data[i][j] === "s") continue;
                    var floorModel = createFloor(i, j, ROOMS.prototype.floor);
                    var ceilingModel = createCeiling(i, j, ROOMS.prototype.ceiling);
                    map.cellMap[i][j] = { i: i, j: j, array: [floorModel, ceilingModel] };
                    map.cells.push(map.cellMap[i][j]);
                    if (data[i][j] === "p") {
                        var room = {
                            type: ROOMS.CELL_TYPE.PORTAL,
                            id: map.portals.length,
                            walls: [], frames: [],
                            cells: [map.cellMap[i][j]],
                            floor: [floorModel], ceiling: [ceilingModel],
                            xyz: vec3.fromValues(j + 0.5, 0.5, i + 0.5)
                        };
                        eachDirection(data, i, j, room, room.cells[0]);
                        map.portals.push(room);
                        map.map[i][j] = room;
                    } else if (Number.isInteger(data[i][j]) && data[i][j] >= 0) {
                        var room = map.rooms[data[i][j]];
                        if (room === undefined) {
                            room = {
                                type: ROOMS.CELL_TYPE.ROOM,
                                id: data[i][j], cells: [],
                                walls: [], portals: [], furniture: [], connect: [],
                                floor: [floorModel], ceiling: [ceilingModel],
                                first: [i, j], last: [i, j]
                            };
                        } else {
                            room.last = [i, j];
                            room.floor.push(floorModel);
                            room.ceiling.push(ceilingModel);
                        }
                        eachDirection(data, i, j, room, map.cellMap[i][j]);
                        room.cells.push(map.cellMap[i][j]);
                        map.rooms[data[i][j]] = room;
                    }
                }
            }
            // Post-proces portals
            for (var i = 0, m = map.portals.length; i < m; i++) {
                var frames = map.portals[i].frames;
                var inFrames = [];
                for (var j = 0, n = frames.length; j < n; j++) {
                    if (frames[j] === undefined) continue;
                    // Build relationship with rooms
                    for (var k = 0; k < n; k++) {
                        if (k === j || frames[k] === undefined) continue;
                        if (map.rooms[j].connect[k] === undefined)
                            map.rooms[j].connect[k] = [];
                        map.rooms[j].connect[k].push(map.portals[i]);
                    }
                    map.rooms[j].portals.push(map.portals[i]);
                    // Build inside frames
                    inFrames[j] = {
                        left: frames[j].right,
                        right: frames[j].left,
                    };
                }
                map.portals[i].inFrames = inFrames;
                map.portals[i].array = map.portals[i].floor
                    .concat(map.portals[i].ceiling)
                    .concat(map.portals[i].walls);
            }
            // Post-process rooms 
            for (var i = 0, m = map.rooms.length; i < m; i++) {
                var room = map.rooms[i];
                room.center = [(room.first[1] + room.last[1]) / 2 + 0.5,
                    0, (room.first[0] + room.last[0]) / 2 + 0.5];
                room.light = {
                    "x": room.center[0], "y": 1, "z": room.center[2],
                    "ambient": lightModel.ambient, "diffuse": lightModel.diffuse, "specular": lightModel.specular
                };
                room.array = room.floor
                    .concat(room.ceiling)
                    .concat(room.walls);
            }
        },
        parseFurniture: function (data, map) {
            for (var i = 0, n = data.length; i < n; i++) {
                var prototypes;
                if (data[i][3] === 'sphere') {
                    prototypes = ROOMS.prototype.furniture.sphere;
                } else if (data[i][3] === 'triangleset') {
                    prototypes = ROOMS.prototype.furniture.triangleset;
                } else if (data[i][3] === 'standard') {
                    prototypes = ROOMS.prototype.furniture.standard;
                } else continue;
                var room = map.rooms[data[i][0]];
                var pro = prototypes[data[i][4]];
                var indexI = data[i][2] + room.first[0],
                    indexJ = data[i][1] + room.first[1];
                if (pro === undefined ||
                    data[i][1] < 0 || data[i][2] < 0 ||
                    indexI > room.last[0] || indexJ > room.last[1]) continue;
                var model = MODELS.copyModel(pro,
                    mat4.clone(pro.rMatrix),
                    mat4.fromTranslation(mat4.create(), vec3.fromValues(
                        indexJ + pro.tMatrix[12],
                        pro.tMatrix[13],
                        indexI + pro.tMatrix[14]))
                )
                room.furniture.push(model);
                // room.array.push(model);
                room.array.unshift(model);
                ROOMS.furniture.array.push(model);
                map.cellMap[indexI][indexJ].array.push(model);
            }
        },

        addAllModel: function () {
            // Add model to MODELS
            for (var i = 0, n = ROOMS.rooms.length; i < n; i++) {
                MODELS.array = MODELS.array.concat(ROOMS.rooms[i].array);
                LIGHTS.array.push(ROOMS.rooms[i].light);
            }
            for (var i = 0, n = ROOMS.portals.length; i < n; i++) {
                MODELS.array = MODELS.array.concat(ROOMS.portals[i].array);
            }
        },

        getRoom: function (xyz) {
            if (xyz[1] > 1 || xyz[1] < 0) return null;
            var room = ROOMS.map[Math.floor(xyz[2])][Math.floor(xyz[0])];
            if (room === undefined || room === "s") return null;
            if (room >= 0) return ROOMS.rooms[room];
            return room;
        },

        getCurrentFurniture: function () {
            return ROOMS.furniture.array[ROOMS.furniture.selectId];
        },

        load: function (shaders) {
            this.ready = false;
            // Load prototype
            ROOMS.prototype.floor = JSON_MODEL.loadTriangleSets(shaders, [triangles.floor])[0];
            ROOMS.prototype.ceiling = JSON_MODEL.loadTriangleSets(shaders, [triangles.ceiling])[0];
            ROOMS.prototype.wall = JSON_MODEL.loadTriangleSets(shaders, [triangles.wall])[0];

            // Load furniture prototype
            ROOMS.prototype.furniture.triangleset =
                JSON_MODEL.loadTriangleSets(shaders, JSON_MODEL.getJSONFile(URL.triangles, 'triangleset'));
            ROOMS.prototype.furniture.sphere =
                JSON_MODEL.loadSpheres(shaders, JSON_MODEL.getJSONFile(URL.sphere, 'sphere'));
            // Add animation to sphere
            for (var i = 0; i < ROOMS.prototype.furniture.sphere.length; i++) {
                ROOMS.prototype.furniture.sphere[i].animation = sphere.animation;
            }

            // Load standard model prototype
            // SKECHUP_MODEL.loadModel(shaders, URL.cityModel, function (model) {
            //     model.material = city.material;
            //     model.rMatrix = city.scaleMatrix;
            //     model.tMatrix = mat4.fromTranslation(mat4.create(), city.pos);
            //     model.animation = city.animation;
            //     model.mark = city.mark;
            //     ROOMS.prototype.furniture.standard[0] = model;
            // });
            // SKECHUP_MODEL.loadModel(shaders, URL.batteryModel, function (model) {
            //     model.material = battery.material;
            //     model.rMatrix = battery.scaleMatrix;
            //     model.tMatrix = mat4.fromTranslation(mat4.create(), battery.pos);
            //     model.animation = battery.animation;
            //     model.mark = battery.mark;
            //     ROOMS.prototype.furniture.standard[1] = model;
            // });

            // ****************** TEST ******************
            // MODELS.array.push(ROOMS.prototype.furniture.triangleset[2]);
            // MODELS.array.splice(3,1);
            // MODELS.array = MODELS.array.concat(ROOMS.prototype.furniture.sphere);
            // this.ready = true;
            if (true) {
                var data = testRooms;
                ROOMS.data = data;
                ROOMS.ready = true;
                $('canvas#myWebGLCanvas').trigger('loadData');
            } else {
                // ****************** END TEST ******************

                // load topology
                $.getJSON(URL.rooms, function (data) {
                    ROOMS.data = data;

                    ROOMS.ready = true;
                    $('canvas#myWebGLCanvas').trigger('loadData');
                });
            }
        },

        initRoomsModel: function (data) {
            ROOMS.parseRooms(data.rooms, ROOMS);
            ROOMS.parseFurniture(data.furniture, ROOMS);
            ROOMS.addAllModel();

            var room = ROOMS.rooms[0];
            ROOMS.initialTrans = vec3.fromValues(
                CAMERA.xyz[0] - room.center[0],
                CAMERA.xyz[1] - 0.5,
                CAMERA.xyz[2] - room.center[2]);
            if (room.portals.length > 0) {
                var dir = vec3.normalize(vec3.create(),
                    vec3.add(vec3.create(), room.portals[0].xyz, ROOMS.initialTrans));
                if (dir[0] > 0.0001) {
                    ROOMS.initialRot = dir[2] > 0 ? Math.asin(dir[0]) : Math.PI - Math.asin(dir[0]);
                }
            }
        },
    };
}();