var MODELS = function () {
    function shallowClone(model) {
        var newModel = {
            material: model.material,
            triBufferSize: model.triBufferSize,
            doubleSide: model.doubleSide,
            texture: model.texture,
            specularModel: model.specularModel,
            coordArray: model.coordArray,
            normalArray: model.normalArray,
            indexArray: model.indexArray,
            uvArray: model.uvArray,
            vertexBuffer: model.vertexBuffer,
            normalBuffer: model.normalBuffer,
            triangleBuffer: model.triangleBuffer,
            textureUVBuffer: model.textureUVBuffer
        };
        if (model.animation) {
            newModel.animation = model.animation;
        }
        if (model.mark) {
            newModel.mark = model.mark;
        }
        return newModel;
    }
    return {
        array: [],
        createMaterial: function () {
            return {
                ambient: [0.1, 0.1, 0.1], diffuse: [1.0, 1.0, 1.0], specular: [0.3, 0.3, 0.3], n: 1, textureMode: 0
            }
        },
        createModel: function () {
            var model = {
                material: this.createMaterial(),
                triBufferSize: 0,
                doubleSide: false,
                specularModel: 1,
                tMatrix: mat4.create(),
                rMatrix: mat4.create(),
                coordArray: [],
                normalArray: [],
                indexArray: []
            };
            return model;
        },
        calcModelMatrix: function (model) {
            let mMatrix = mat4.multiply(mat4.create(), model.tMatrix, model.rMatrix);
            if (model.rootModel) {
                mMatrix = mat4.multiply(mat4.create(), MODELS.calcModelMatrix(model.rootModel), mMatrix);
            }
            model.mMatrix = mMatrix;
            return mMatrix;
        },
        getMaterialUniformLocation: function (gl, program, varName) {
            return {
                ambient: gl.getUniformLocation(program, varName + ".ambient"),
                diffuse: gl.getUniformLocation(program, varName + ".diffuse"),
                specular: gl.getUniformLocation(program, varName + ".specular"),
                n: gl.getUniformLocation(program, varName + ".n"),
                textureMode: gl.getUniformLocation(program, varName + ".textureMode")
            };
        },
        setMaterialUniform: function (gl, materialUniform, material) {
            gl.uniform3fv(materialUniform.ambient, material.ambient);
            gl.uniform3fv(materialUniform.diffuse, material.diffuse);
            gl.uniform3fv(materialUniform.specular, material.specular);
            gl.uniform1f(materialUniform.n, material.n);
            gl.uniform1i(materialUniform.textureMode, material.textureMode);
        },
        bufferTriangleSetCulling: function (shader, triangleSet) {
            var gl = shader.gl, id = shader.id;
            // send the triangle indices to webGL
            if (triangleSet.triangleBufferCulling === undefined)
                triangleSet.triangleBufferCulling = [];
            if (!triangleSet.triangleBufferCulling[id])
                triangleSet.triangleBufferCulling[id] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleSet.triangleBufferCulling[id]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleSet.indexArrayCulling), gl.STATIC_DRAW); // indices to that buffer
        },
        bufferTriangleSet: function (shader, triangleSet) {
            var gl = shader.gl, id = shader.id;
            // send the vertex coords to webGL
            if (triangleSet.vertexBuffer === undefined) triangleSet.vertexBuffer = [];
            triangleSet.vertexBuffer[id] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleSet.vertexBuffer[id]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleSet.coordArray), gl.STATIC_DRAW); // coords to that buffer

            // send the vertex normals to webGL
            if (triangleSet.normalBuffer === undefined) triangleSet.normalBuffer = [];
            triangleSet.normalBuffer[id] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleSet.normalBuffer[id]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleSet.normalArray), gl.STATIC_DRAW); // normals to that buffer

            // send the triangle indices to webGL
            if (triangleSet.triangleBuffer === undefined) triangleSet.triangleBuffer = [];
            triangleSet.triangleBuffer[id] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleSet.triangleBuffer[id]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleSet.indexArray), gl.STATIC_DRAW); // indices to that buffer

            // send the texture to webGL
            if (triangleSet.textureUVBuffer === undefined) triangleSet.textureUVBuffer = [];
            triangleSet.textureUVBuffer[id] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triangleSet.textureUVBuffer[id]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleSet.uvArray), gl.STATIC_DRAW); // normals to that buffer
        },
        copyModel: function (prototype, rMatrix, tMatrix) {
            let newModel = shallowClone(prototype);
            newModel.rMatrix = rMatrix;
            newModel.tMatrix = tMatrix;
            LOD.copyLOD(prototype, newModel);
            newModel.xyz = vec3.fromValues(tMatrix[12], tMatrix[13], tMatrix[14]);
            return newModel;
        },
        addDummyTexture: function (shader, model) {
            if (model.texture === undefined) model.texture = [];
            model.texture[shader.id] = shader.dummyTexture;
            if (Array.isArray(model.uvArray)) return;
            let len = model.coordArray.length / 3 * 2;
            model.uvArray = new Array(len);
            for (let i = 0; i < len; i++)
                model.uvArray[i] = 0;
        }
    }
}();