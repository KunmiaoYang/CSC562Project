var RASTERIZE = function () {
    var SAMPLE_FRAME = 10;
    return {
        frameId: 0,
        frameTime: [],
        renderTriangles: function (models = MODELS.array, shader = SHADER, camera = CAMERA, enableCulling = false) {    // render the loaded model
            if (shader.hide) return;
            var gl = shader.gl;
            gl.lineWidth(1.5);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

            gl.uniform3fv(shader.uniforms.cameraPosUniform, camera.xyz);
            gl.uniformMatrix4fv(shader.uniforms.vMatrixUniform, false, camera.vMatrix);
            gl.uniformMatrix4fv(shader.uniforms.pMatrixUniform, false, camera.pMatrix);
            for (let i = 0; i < LIGHTS.array.length; i++) {
                LIGHTS.setLightUniform(gl, shader.uniforms.lightUniformArray[i], LIGHTS.array[i]);
            }

            var triCount = 0;
            for (let i = 0; i < models.length; i++) {
                // init uniforms
                if (OPTION.useLight)
                    gl.uniform1i(shader.uniforms.lightModelUniform, models[i].specularModel);
                else
                    gl.uniform1i(shader.uniforms.lightModelUniform, -1);
                // triangleSetArray[i].material.ambient = [0.5,1.0,1.0];
                gl.uniform1f(shader.uniforms.doubleSideUniform, models[i].doubleSide);
                MODELS.setMaterialUniform(gl, shader.uniforms.materialUniform, models[i].material);
                gl.uniformMatrix4fv(shader.uniforms.mMatrixUniform, false, MODELS.calcModelMatrix(models[i]));
                gl.uniformMatrix3fv(shader.uniforms.nMatrixUniform, false, mat3.normalFromMat4(mat3.create(), models[i].mMatrix));

                // vertex buffer: activate and feed into vertex shader
                gl.bindBuffer(gl.ARRAY_BUFFER, models[i].vertexBuffer[shader.id]); // activate
                gl.vertexAttribPointer(shader.vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed

                // vertex normal buffer: activate and feed into vertex shader
                gl.bindBuffer(gl.ARRAY_BUFFER, models[i].normalBuffer[shader.id]); // activate
                gl.vertexAttribPointer(shader.vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0); // feed

                // texture uvs buffer: activate and feed into vertex shader
                gl.bindBuffer(gl.ARRAY_BUFFER, models[i].textureUVBuffer[shader.id]); // activate
                gl.vertexAttribPointer(shader.textureUVAttrib, 2, gl.FLOAT, false, 0, 0); // feed

                // update texture uniform
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, models[i].texture[shader.id]);
                gl.uniform1i(shader.uniforms.textureUniform, 0);

                // triangle buffer: activate and render
                if (enableCulling && models[i].culling) {
                    if (models[i].triBufferSizeCulling === 0)
                        continue;
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[i].triangleBufferCulling[shader.id]); // activate
                    gl.drawElements(gl.TRIANGLES, models[i].triBufferSizeCulling, gl.UNSIGNED_SHORT, 0); // render
                    triCount += (models[i].triBufferSizeCulling / 3);
                } else {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[i].triangleBuffer[shader.id]); // activate
                    gl.drawElements(gl.TRIANGLES, models[i].triBufferSize, gl.UNSIGNED_SHORT, 0); // render
                    triCount += (models[i].triBufferSize / 3);
                }
            }

            // update frame time
            if (0 == RASTERIZE.frameId) {
                $('#time').text(((ANIMATION.lastTime - RASTERIZE.frameTime[0]) / SAMPLE_FRAME).toFixed(3));
            }
            $('#triangles').text(triCount);
            RASTERIZE.frameTime[RASTERIZE.frameId++] = ANIMATION.lastTime;
            RASTERIZE.frameId %= SAMPLE_FRAME;
        },
        renderInfo: function () {    // render info
            $('#level').text(GAME.level.id);
            $('#score').text(GAME.score);
            $('#incoming').text(GAME.level.attackMissileCount - GAME.level.nextMissile);
        },
        noCulling: function () {
            var models = ROOMS.filter(MODELS.array);
            RASTERIZE.renderTriangles(models, SHADER);
            // RASTERIZE.renderTriangles(models, TOP_SHADER, TOP_CAMERA);
            RASTERIZE.renderTriangles(models, TOP_SHADER, TOP_SHADER.camera);
        },
        frustumCulling: function () {
            var shaders = [SHADER, TOP_SHADER];
            var models = [];
            if (CULLING.hierarchy) {
                for (var i = 0, n = ROOMS.rooms.length; i < n; i++) {
                    models = models.concat(CULLING.hierarchicalCullingRoom(shaders, CAMERA.getFrustum(), ROOMS.rooms[i]));
                }
                for (var i = 0, n = ROOMS.portals.length; i < n; i++) {
                    models = models.concat(CULLING.hierarchicalCullingRoom(shaders, CAMERA.getFrustum(), ROOMS.portals[i]));
                }
            } else {
                models = CULLING.frustumCulling(shaders, CAMERA.getFrustum(), MODELS.array);
            }
            RASTERIZE.renderTriangles(models, SHADER, CAMERA, true);
            RASTERIZE.renderTriangles(models, TOP_SHADER, TOP_CAMERA, true);
        },
        portalCulling: function () {
            ROOMS.rVisited = [];
            ROOMS.pVisited = [];
            var cullingRoom = CULLING.hierarchy ?
                CULLING.hierarchicalCullingRoom : CULLING.frustumCullingRoom;
            var models = CULLING.portalCulling(
                [SHADER, TOP_SHADER], CAMERA.getFrustum(), cullingRoom,
                ROOMS.getRoom(CAMERA.xyz), ROOMS.rVisited, ROOMS.pVisited);
            RASTERIZE.renderTriangles(models, SHADER, CAMERA, true);
            RASTERIZE.renderTriangles(models, TOP_SHADER, TOP_CAMERA, true);
        },
        setupOnLoad: function () {   // set up on load event for canvas
            $('canvas#myWebGLCanvas').on('loadData', function () {
                if (!LIGHTS.ready) {
                    console.log('Loading LIGHTS...');
                } else if (!ROOMS.ready) {
                    console.log('Loading ROOMS...');
                } else if (SKECHUP_MODEL.incomplete > 0) {
                    console.log(SKECHUP_MODEL.incomplete, 'SKECHUP MODEL to load...');
                } else {
                    // Initialize rooms models
                    ROOMS.initRoomsModel(ROOMS.data);

                    console.log('All model ready!');
                    SHADER.setupShaders(); // setup the webGL shaders
                    TOP_SHADER.setupShaders();
                    CAMERA.translateCamera(ROOMS.initialTrans);
                    CAMERA.rotateCamera(ROOMS.initialRot, vec3.fromValues(0, 1, 0));
                    // RASTERIZE.renderTriangles(SHADER.gl); // draw the triangles using webGL
                    // ANIMATION.start(RASTERIZE.frustumCulling);
                    ANIMATION.start(RASTERIZE.noCulling);
                }
            });
        },
        refresh: function () {   // refresh image when settings are changed
            DOM.load(OPTION, CAMERA, URL);   // load the data from html page
            LIGHTS.load(); // load in the lights
            SHADER.setupWebGL(); // set up the webGL environment
            CAMERA.pMatrix = CAMERA.calcPerspective(CAMERA.left, CAMERA.right, CAMERA.top, CAMERA.bottom, CAMERA.near, CAMERA.far);
        }
    }
}();