var EVENTS = function () {
    var currentlyPressedKeys = [];
    var renderModelCamera = function () {
        TOP_SHADER.camera = MODEL_CAMERA;
        TOP_SHADER.hide = false;
        $('#topCanvas').show('fade');
    };
    var changeModel = function (models, offset) {
        var size = models.array.length;
        if (size) {
            models.selectId = (models.selectId + size + offset) % size;
            CAMERA.updateModelCamera();
            renderModelCamera();
        }
    };
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
                case "0": // 0 — Render top down map
                    TOP_SHADER.camera = TOP_CAMERA;
                    TOP_SHADER.hide = false;
                    $('#topCanvas').show('fade');
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
                case "v":    // v — toggle second view
                    TOP_SHADER.hide = !TOP_SHADER.hide;
                    if (TOP_SHADER.hide) $('#topCanvas').hide('fade');
                    else $('#topCanvas').show('fade');
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
        setupEvent: function () {
            document.onkeydown = EVENTS.handleKeyDown;
            document.onkeyup = EVENTS.handleKeyUp;
            // $(DOM.canvas).on('click', EVENTS.handleClick).mousemove(EVENTS.handleMouseMove);
        }
    };
}();