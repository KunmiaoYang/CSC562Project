var EVENTS = function () {
    var currentlyPressedKeys = [];
    var renderModelCamera = function () {
        TOP_SHADER.camera = MODEL_CAMERA;
        TOP_SHADER.hide = false;
        $('#topCanvas').show('fade');
        DOM.lodInfo.show('fade');
    };
    var changeModel = function (models, offset) {
        var size = models.array.length;
        if (size) {
            models.selectId = (models.selectId + size + offset) % size;
            CAMERA.updateModelCamera();
            renderModelCamera();
            LOD.updateLodInfo(models);
        }
    };
    var toggleSelection = function (models) {
        var model = models.array[models.selectId];
        if (!model || !model.lod) return;
        if (model.lod.select === LOD.selectByArea) model.lod.select = LOD.selectByRange;
        else model.lod.select = LOD.selectByArea;
        LOD.select(models.array);
    }
    return {
        DELTA_TRANS: 0.05,
        DELTA_ROT: 0.08,
        handleKeyDown: function (event) {
            currentlyPressedKeys[event.keyCode] = true;

            // Part 4: interactively change view
            // Part 5: Interactively select a model
            switch (event.key) {
                case "a":    // a — translate view left along view X
                    SOUND.walking.play();
                    CAMERA.translateCamera(vec3.fromValues(-EVENTS.DELTA_TRANS, 0, 0));
                    return;
                case "d":    // d — translate view right along view X
                    SOUND.walking.play();
                    CAMERA.translateCamera(vec3.fromValues(EVENTS.DELTA_TRANS, 0, 0));
                    return;
                case "w":    // w — translate view forward along view Z
                    SOUND.walking.play();
                    CAMERA.translateCamera(vec3.fromValues(0, 0, -EVENTS.DELTA_TRANS));
                    return;
                case "s":    // s — translate view backward along view Z
                    SOUND.walking.play();
                    CAMERA.translateCamera(vec3.fromValues(0, 0, EVENTS.DELTA_TRANS));
                    return;
                case "q":    // q — translate view up along view Y
                    CAMERA.translateCamera(vec3.fromValues(0, EVENTS.DELTA_TRANS, 0));
                    return;
                case "e":    // e — translate view down along view Y
                    CAMERA.translateCamera(vec3.fromValues(0, -EVENTS.DELTA_TRANS, 0));
                    return;
                case "A":    // A — rotate view left around view Y (yaw)
                    CAMERA.rotateCamera(EVENTS.DELTA_ROT, vec3.fromValues(0, 1, 0));
                    return;
                case "D":    // D — rotate view right around view Y (yaw)
                    CAMERA.rotateCamera(-EVENTS.DELTA_ROT, vec3.fromValues(0, 1, 0));
                    return;
                // case "W":    // W — rotate view forward around view X (pitch)
                //     CAMERA.rotateCamera(EVENTS.DELTA_ROT, vec3.fromValues(1, 0, 0));
                //     return;
                // case "S":    // S — rotate view backward around view X (pitch)
                //     CAMERA.rotateCamera(-EVENTS.DELTA_ROT, vec3.fromValues(1, 0, 0));
                //     return;
                // case "Q":    // Q — rotate view forward around view Z (roll)
                //     CAMERA.rotateCamera(-EVENTS.DELTA_ROT, vec3.fromValues(0, 0, 1));
                //     return;
                // case "E":    // E — rotate view backward around view Z (roll)
                //     CAMERA.rotateCamera(EVENTS.DELTA_ROT, vec3.fromValues(0, 0, 1));
                //     return;
                case "1":    // 1 — Render without culling
                    ANIMATION.update = RASTERIZE.noCulling;
                    $('#culling').text('No culling');
                    return;
                case "2":    // 2 — Render with frustum culling
                    ANIMATION.update = RASTERIZE.frustumCulling;
                    $('#culling').text('Frustum culling');
                    return;
                case "3":    // 3 — Render with portal culling
                    ANIMATION.update = RASTERIZE.portalCulling;
                    $('#culling').text('Portal culling');
                    return;
                case "9": // 9 — Render model camera
                    renderModelCamera();
                    return;
                case "h":    // h — toggle hierarchical culling
                    CULLING.hierarchy = !CULLING.hierarchy;
                    $('#hierarchy').text(CULLING.hierarchy);
                    return;
                case "j":    // j — Zoom in
                    TOP_SHADER.camera.zoomCamera(-EVENTS.DELTA_TRANS);
                    return;
                case "k":    // k — Zoom out 
                    TOP_SHADER.camera.zoomCamera(EVENTS.DELTA_TRANS);
                    return;
                // case "m":    // m — toggle standard models
                //     ROOMS.renderStandard = !ROOMS.renderStandard;
                //     return;
                case "c":    // c — toggle ceiling
                    ROOMS.renderCeiling = !ROOMS.renderCeiling;
                    return;
                case "m": // m — Render top down map
                    if (TOP_SHADER.camera === TOP_CAMERA) {
                        TOP_SHADER.hide = !TOP_SHADER.hide;
                    } else {
                        TOP_SHADER.camera = TOP_CAMERA;
                        TOP_SHADER.hide = false;
                    }
                    if (TOP_SHADER.hide) {
                        $('#topCanvas').hide('fade');
                    } else {
                        DOM.lodInfo.hide('fade');
                        $('#topCanvas').show('fade');
                    }
                    return;
                case "v":    // v — toggle second view
                    if (TOP_SHADER.camera === MODEL_CAMERA) {
                        TOP_SHADER.hide = !TOP_SHADER.hide;
                    } else {
                        TOP_SHADER.camera = MODEL_CAMERA;
                        TOP_SHADER.hide = false;
                    }
                    if (TOP_SHADER.hide) {
                        $('#topCanvas').hide('fade');
                        DOM.lodInfo.hide('fade');
                    } else {
                        $('#topCanvas').show('fade');
                        DOM.lodInfo.show('fade');
                    }
                    return;
                case "ArrowLeft": // left - select previous furniture
                    event.preventDefault();
                    changeModel(ROOMS.furniture, -1);
                    return;
                case "ArrowRight": // right - select next furniture
                    event.preventDefault();
                    changeModel(ROOMS.furniture, 1);
                    return;
            }
        },
        handleKeyUp: function (event) {
            currentlyPressedKeys[event.keyCode] = false;
            SOUND.walking.pause();
        },
        handleClick: function (event) {
            GAME.launchDefenseMissile(event.offsetX / DOM.canvas.width, event.offsetY / DOM.canvas.height);
        },
        handleMouseMove: function (event) {
            GAME.rotateBatteries(event.offsetX / DOM.canvas.width, event.offsetY / DOM.canvas.height);
        },
        handleSelectMethodChange: function (select) {
            return function () {
                var models = ROOMS.furniture;
                models.array[models.selectId].lod.select = select;
                LOD.select(models.array);
            };
        },
        handleRangeBoundChange: function (i, j) {
            return function (event) {
                var model = ROOMS.getCurrentFurniture();
                if (!model.lod) return;
                model.lod.rangeBounds[i][j] = parseInt($(event.currentTarget).val());
                LOD.select(ROOMS.furniture.array);
            };
        },
        handleAreaBoundChange: function (i, j) {
            return function (event) {
                var model = ROOMS.getCurrentFurniture();
                if (!model.lod) return;
                model.lod.areaBounds[i][j] = parseInt($(event.currentTarget).val());
                LOD.select(ROOMS.furniture.array);
            };
        },
        handleManulLevelChange: function (event) {
            var model = ROOMS.getCurrentFurniture();
            if (!model.lod) return;
            model.lod.level = parseInt($(event.currentTarget).val() - 1);
            LOD.select(ROOMS.furniture.array);
        },
        setupEvent: function () {
            document.onkeydown = EVENTS.handleKeyDown;
            document.onkeyup = EVENTS.handleKeyUp;
            // $(DOM.canvas).on('click', EVENTS.handleClick).mousemove(EVENTS.handleMouseMove);

            DOM.lodConfigSelectRange.on('click', EVENTS.handleSelectMethodChange(LOD.selectByRange));
            DOM.lodConfigSelectArea.on('click', EVENTS.handleSelectMethodChange(LOD.selectByArea));
            DOM.lodConfigSelectManual.on('click', EVENTS.handleSelectMethodChange(LOD.selectManually));
            DOM.lodConfigRange00.on('change', EVENTS.handleRangeBoundChange(0, 0));
            DOM.lodConfigRange01.on('change', EVENTS.handleRangeBoundChange(0, 1));
            DOM.lodConfigRange10.on('change', EVENTS.handleRangeBoundChange(1, 0));
            DOM.lodConfigRange11.on('change', EVENTS.handleRangeBoundChange(1, 1));
            DOM.lodConfigRange20.on('change', EVENTS.handleRangeBoundChange(2, 0));
            DOM.lodConfigRange21.on('change', EVENTS.handleRangeBoundChange(2, 1));
            DOM.lodConfigArea00.on('change', EVENTS.handleAreaBoundChange(0, 0));
            DOM.lodConfigArea01.on('change', EVENTS.handleAreaBoundChange(0, 1));
            DOM.lodConfigArea10.on('change', EVENTS.handleAreaBoundChange(1, 0));
            DOM.lodConfigArea11.on('change', EVENTS.handleAreaBoundChange(1, 1));
            DOM.lodConfigArea20.on('change', EVENTS.handleAreaBoundChange(2, 0));
            DOM.lodConfigArea21.on('change', EVENTS.handleAreaBoundChange(2, 1));
            DOM.lodConfigManualLevel.on('change', EVENTS.handleManulLevelChange);
        }
    };
}();