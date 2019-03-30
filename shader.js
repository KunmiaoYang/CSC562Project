var CREATE_SHADER = function (canvas, option) {
    // define fragment shader in essl using es6 template strings
    function getFShaderCode(nLight) {
        return "#define N_LIGHT " + nLight + "\n" +
            `
            
        precision mediump float;
        struct light_struct {
          vec3 xyz;
          vec3 ambient;
          vec3 diffuse;
          vec3 specular;
        };
        struct material_struct {
          vec3 ambient;
          vec3 diffuse;
          vec3 specular;
          float n;
          int textureMode;
        };
        
        uniform light_struct uLights[N_LIGHT];
        uniform material_struct uMaterial;
        uniform int uLightModel;
        uniform sampler2D uTexture;
        uniform float uAlpha;
        
        varying vec3 vTransformedNormal;
        varying vec4 vPosition;
        varying vec3 vCameraDirection;
        varying vec2 vTextureUV;

        void main(void) {
            vec3 rgb = vec3(0, 0, 0);
            vec4 textureColor = texture2D(uTexture, vTextureUV);
            vec3 ambientColor = uMaterial.ambient;
            vec3 diffuseColor = uMaterial.diffuse;

            if(uLightModel < 0) {
                rgb = uMaterial.diffuse;
            } else {
                for(int i = 0; i < N_LIGHT; i++) {
                    vec3 L = normalize(uLights[i].xyz - vPosition.xyz);
                    vec3 V = normalize(vCameraDirection);
                    vec3 N = normalize(vTransformedNormal);
                    float dVN = dot(V, N);
                    float dLN = dot(L, N);
                    rgb += ambientColor * uLights[i].ambient; // Ambient shading
                    if(dLN > 0.0 && dVN > 0.0) {
                        rgb += dLN * (diffuseColor * uLights[i].diffuse);      // Diffuse shading
                        if(0 == uLightModel) {          // Phong specular shading
                            vec3 R = normalize(2.0 * dot(N, L) * N - L);
                            float weight = pow(dot(V, R), uMaterial.n);
                            if(weight > 0.0) rgb += weight * (uMaterial.specular * uLights[i].specular);
                        } else if(1 == uLightModel) {          // Blinn-Phong specular shading
                            vec3 H = normalize(V + L);
                            float weight = pow(dot(N, H), uMaterial.n);
                            if(weight > 0.0) rgb += weight * (uMaterial.specular * uLights[i].specular);
                        }
                    }
                }
            }
            
            if(1 == uMaterial.textureMode) {
                // ambientColor = textureColor.rgb;
                // diffuseColor = textureColor.rgb;
                // gl_FragColor = textureColor;
                gl_FragColor = vec4(rgb*textureColor.rgb, uAlpha); // all fragments are white
            } else {
                gl_FragColor = vec4(rgb, 1); // all fragments are white
            }
        }
        `;
    }
    // define vertex shader in essl using es6 template strings
    function getVShaderCode() {
        return `
        attribute vec3 vertexPosition;
        attribute vec3 vertexNormal;
        attribute vec2 textureUV;

        uniform mat4 uMMatrix;      // Model transformation
        uniform mat4 uVMatrix;      // Viewing transformation
        uniform mat4 uPMatrix;      // Projection transformation
        uniform mat3 uNMatrix;      // Normal vector transformation
        uniform vec3 uCameraPos;    // Camera position
        uniform bool uDoubleSide;
        
        varying vec3 vTransformedNormal;
        varying vec4 vPosition;
        varying vec3 vCameraDirection;
        varying vec2 vTextureUV;

        void main(void) {
            vPosition = uMMatrix * vec4(vertexPosition, 1.0);
            vTextureUV = textureUV;
            vCameraDirection = uCameraPos - vPosition.xyz;
            gl_Position = uPMatrix * uVMatrix * vPosition;
            vTransformedNormal = uNMatrix * vertexNormal;
            if(uDoubleSide && dot(vCameraDirection, vTransformedNormal) < 0.0)
                vTransformedNormal = -vTransformedNormal;
        }
        `;
    }

    var gl = canvas.getContext('webgl'); // get a webgl object from it
    var shaderProgram = null;
    var vertexPositionAttrib = null;
    var vertexNormalAttrib = null;
    var textureUVAttrib = null;
    var uniforms = {};
    var texture = {};
    var dummyTexture = null;

    // load image
    function loadImage(image) {
        console.log('Loading', image.src, 'complete!');
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        texture.image = image;
        texture.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);       // Flip image v direction, so v oriented from bottom to top
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        if (texture.image.complete) texture.image.onload();
        return texture;
    }

    return {
        id: option.id,
        gl: gl, // get a webgl object from it
        shaderProgram: shaderProgram,
        vertexPositionAttrib: vertexPositionAttrib,
        vertexNormalAttrib: vertexNormalAttrib,
        textureUVAttrib: textureUVAttrib,
        uniforms: uniforms,
        texture: texture,
        dummyTexture: dummyTexture,

        loadTexture: function (image) {
            return loadImage(image);
        },
        setupWebGL: function () {
            gl.viewportWidth = canvas.width; // store width
            gl.viewportHeight = canvas.height; // store height
            gl.viewport(0, 0, canvas.width, canvas.height);
            this.dummyTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.dummyTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

            try {
                if (gl === null) {
                    throw "unable to create gl context -- is your browser gl ready?";
                } else {
                    if (option.clear) 
                        gl.clearColor(option.clear[0], option.clear[1], option.clear[2], option.clear[3]);
                    gl.clearDepth(1.0); // use max when we clear the depth buffer
                    gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
                    
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
            // gl.disable(gl.DEPTH_TEST);
                }
            } // end try

            catch (e) {
                console.log(e);
            } // end catch

            for (var name in IMAGE.texture) {
                texture[name] = loadImage(IMAGE.texture[name]);
            }
        },
        setupShaders: function () {
            let fShaderCode = getFShaderCode(LIGHTS.array.length);
            let vShaderCode = getVShaderCode();
            try {
                // console.log("fragment shader: "+fShaderCode);
                var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
                gl.shaderSource(fShader, fShaderCode); // attach code to shader
                gl.compileShader(fShader); // compile the code for gpu execution

                // console.log("vertex shader: "+vShaderCode);
                var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
                gl.shaderSource(vShader, vShaderCode); // attach code to shader
                gl.compileShader(vShader); // compile the code for gpu execution

                if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
                    throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
                    gl.deleteShader(fShader);
                } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
                    throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
                    gl.deleteShader(vShader);
                } else { // no compile errors
                    this.shaderProgram = gl.createProgram(); // create the single shader program
                    gl.attachShader(this.shaderProgram, fShader); // put frag shader in program
                    gl.attachShader(this.shaderProgram, vShader); // put vertex shader in program
                    gl.linkProgram(this.shaderProgram); // link program into gl context

                    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) { // bad program link
                        throw "error during shader program linking: " + gl.getProgramInfoLog(this.shaderProgram);
                    } else { // no shader program link errors
                        gl.useProgram(this.shaderProgram); // activate shader program (frag and vert)
                        this.vertexPositionAttrib = // get pointer to vertex shader input
                            gl.getAttribLocation(this.shaderProgram, "vertexPosition");
                        gl.enableVertexAttribArray(this.vertexPositionAttrib); // input to shader from array

                        this.vertexNormalAttrib = gl.getAttribLocation(this.shaderProgram, "vertexNormal");
                        gl.enableVertexAttribArray(this.vertexNormalAttrib); // input to shader from array

                        this.textureUVAttrib = gl.getAttribLocation(this.shaderProgram, "textureUV");
                        gl.enableVertexAttribArray(this.textureUVAttrib); // input to shader from array

                        // Get uniform matrices
                        uniforms.lightModelUniform = gl.getUniformLocation(this.shaderProgram, "uLightModel");
                        uniforms.cameraPosUniform = gl.getUniformLocation(this.shaderProgram, "uCameraPos");
                        uniforms.mMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMMatrix");
                        uniforms.vMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uVMatrix");
                        uniforms.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
                        uniforms.nMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uNMatrix");
                        uniforms.doubleSideUniform = gl.getUniformLocation(this.shaderProgram, "uDoubleSide");
                        uniforms.textureUniform = gl.getUniformLocation(this.shaderProgram, "uTexture");
                        uniforms.materialUniform = MODELS.getMaterialUniformLocation(gl, this.shaderProgram, "uMaterial");
                        uniforms.alpha = gl.getUniformLocation(this.shaderProgram, "uAlpha");
                        uniforms.lightUniformArray = [];
                        for (let i = 0; i < LIGHTS.array.length; i++) {
                            uniforms.lightUniformArray[i] = LIGHTS.getLightUniformLocation(gl, this.shaderProgram, "uLights[" + i + "]");
                        }
                    } // end if no shader program link errors
                } // end if no compile errors
            } // end try

            catch (e) {
                console.log(e);
            } // end catch
        },
    }
};

var SHADER = CREATE_SHADER(DOM.canvas, {id: 0, clear: [0.0, 0.0, 0.0, 1.0]});
SHADER.wh = SHADER.gl.canvas.width*SHADER.gl.canvas.height;

var TOP_SHADER = CREATE_SHADER(DOM.topCanvas, {id: 1, clear: [0.0, 0.0, 0.0, 1.0]});
TOP_SHADER.hide = false;