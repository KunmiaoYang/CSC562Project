var VIEW_UP = vec3.fromValues(0, 1, 0); // default camera view up direction in world space

var CREATE_CAMERA = function (coord, lookAt, viewUp = VIEW_UP, bound = {
    left: -0.01, right: 0.01,
    top: 0.01, bottom: -0.01,
    near: 0.01, far: 100,
}) {
    return {
        left: bound.left,
        right: bound.right,
        top: bound.top,
        bottom: bound.bottom,
        near: bound.near,
        far: bound.far,
        setCamera: function (newCoord, newLookAt, newViewUp) {
            this.xyz = newCoord;
            let center = vec3.fromValues(this.xyz[0] + newLookAt[0], this.xyz[1] + newLookAt[1], this.xyz[2] + newLookAt[2]);
            this.vMatrix = mat4.lookAt(mat4.create(), this.xyz, center, newViewUp);
            this.updateCameraAxis();
        },
        initCamera: function () {
            this.setCamera(coord, lookAt, viewUp)

            this.pMatrix = this.calcPerspective(this.left, this.right, this.top, this.bottom, this.near, this.far);
        },
        setCoord: function (newCoord) {
            this.xyz = newCoord;
            let center = vec3.fromValues(this.xyz[0] - this.Z[0], this.xyz[1] - this.Z[1], this.xyz[2] - this.Z[2]);
            this.vMatrix = mat4.lookAt(mat4.create(), this.xyz, center, viewUp);
        },
        updateCameraAxis: function () {
            this.X = vec3.fromValues(this.vMatrix[0], this.vMatrix[4], this.vMatrix[8]);
            this.Y = vec3.fromValues(this.vMatrix[1], this.vMatrix[5], this.vMatrix[9]);
            this.Z = vec3.fromValues(this.vMatrix[2], this.vMatrix[6], this.vMatrix[10]);
        },
        rotateCamera: function (rad, axis) {
            mat4.multiply(this.vMatrix, mat4.fromRotation(mat4.create(), -rad, axis), this.vMatrix);
            this.updateCameraAxis();
        },
        translateCamera: function (vec) {
            for (let i = 0; i < 3; i++) {
                this.vMatrix[i + 12] -= vec[i];
                this.xyz[i] += this.X[i] * vec[0] + this.Y[i] * vec[1] + this.Z[i] * vec[2];
            }
        },
        calcPerspective: function (left, right, top, bottom, near, far) {
            let n = Math.abs(near), f = Math.abs(far);
            let width = right - left, height = top - bottom, deep = f - n;
            let pMatrix = mat4.create();
            pMatrix[0] = 2 * n / width;
            pMatrix[1] = 0;
            pMatrix[2] = 0;
            pMatrix[3] = 0;
            pMatrix[4] = 0;
            pMatrix[5] = 2 * n / height;
            pMatrix[6] = 0;
            pMatrix[7] = 0;
            pMatrix[8] = (right + left) / width;
            pMatrix[9] = (top + bottom) / height;
            pMatrix[10] = -(f + n) / deep;
            pMatrix[11] = -1;
            pMatrix[12] = 0;
            pMatrix[13] = 0;
            pMatrix[14] = -2 * f * n / deep;
            pMatrix[15] = 0;
            return pMatrix;
        },
        getFrustum: function () {
            var Nl = vec3.fromValues(
                this.near * this.X[0] + this.left * this.Z[0],
                this.near * this.X[1] + this.left * this.Z[1],
                this.near * this.X[2] + this.left * this.Z[2]
            );
            var Nr = vec3.fromValues(
                -this.near * this.X[0] - this.right * this.Z[0],
                -this.near * this.X[1] - this.right * this.Z[1],
                -this.near * this.X[2] - this.right * this.Z[2]
            );
            var Nt = vec3.fromValues(
                -this.near * this.Y[0] - this.top * this.Z[0],
                -this.near * this.Y[1] - this.top * this.Z[1],
                -this.near * this.Y[2] - this.top * this.Z[2]
            );
            var Nb = vec3.fromValues(
                this.near * this.Y[0] + this.bottom * this.Z[0],
                this.near * this.Y[1] + this.bottom * this.Z[1],
                this.near * this.Y[2] + this.bottom * this.Z[2]
            );
            return FRUSTUM.basicFrustum(CAMERA.xyz, Nl, Nr, Nb, Nt, CAMERA.Z, 0, CAMERA.far);
        },
        portalFrustum: function (frame) {
            var xyz = CAMERA.xyz;
            var yc = xyz[1],                   // Camera y
                xl = frame.left.x - xyz[0],
                xr = frame.right.x - xyz[0],
                zl = frame.left.z - xyz[2],
                zr = frame.right.z - xyz[2];
            var near = xl * zr - xr * zl;
            var Nl = vec3.fromValues(-zl, 0, xl),
                Nr = vec3.fromValues(zr, 0, -xr),
                Nt = vec3.fromValues(
                    (1 - yc) * (zr - zl), -near, (1 - yc) * (xl - xr)),
                Nb = vec3.fromValues(
                    yc * (zr - zl), near, yc * (xl - xr)),
                Nz = vec3.fromValues(zl - zr, 0, xr - xl);
            var frustum = FRUSTUM.basicFrustum(CAMERA.xyz, Nl, Nr, Nb, Nt, Nz, near);
            frustum.frame = frame;
            return frustum;
        },
    }
};

var TOP_CAMERA = CREATE_CAMERA(
    vec3.fromValues(0.5, 9, -0.5),  // default camera position in world space
    vec3.fromValues(0, -1, 0),  // default camera look at direction in world space 
    vec3.fromValues(0, 0, -1), // default camera view up direction in world space
    {
        left: -0.5, right: 0.5,
        top: 0.5, bottom: -0.5,
        near: 0.5, far: 100,
    });
TOP_CAMERA.translateCamera = function (vec) {
    for (let i = 0; i < 2; i++) {
        this.xyz[i] += this.X[i] * vec[0] + this.Y[i] * vec[1] + this.Z[i] * vec[2];
        this.vMatrix[i + 12] -= vec[i];
    }
};
TOP_CAMERA.zoomCamera = function (dist) {
    for (let i = 0; i < 2; i++) {
        this.xyz[i] += this.Z[i] * dist;
    }
    this.vMatrix[14] -= dist;
};

var MODEL_CAMERA = CREATE_CAMERA(
    vec3.fromValues(1.5, 0.5, 1.5),  // default camera position in world space
    vec3.fromValues(0, 0, 1));  // default camera look at direction in world space
MODEL_CAMERA.dist = 0.5;

var CAMERA = CREATE_CAMERA(
    vec3.fromValues(0.5, 0.5, -0.5),  // default camera position in world space
    vec3.fromValues(0, 0, 1));  // default camera look at direction in world space
CAMERA.updateModelCamera = function() {
    var model = ROOMS.furniture.array[ROOMS.furniture.selectId];
    if (model !== undefined) {
        var center = vec3.fromValues(model.tMatrix[12], this.xyz[1], model.tMatrix[14]);
        var dir = vec3.normalize(vec3.create(), vec3.fromValues(
            center[0] - this.xyz[0], 0, center[2] - this.xyz[2]));
        var eye = vec3.scaleAndAdd(vec3.create(), center, dir, -MODEL_CAMERA.dist);
        MODEL_CAMERA.setCamera(eye, dir, VIEW_UP);
    }
};
CAMERA.translateCamera = function (vec) {
    var pos = this.xyz.slice(), delta = vec4.create();
    for (let i = 0; i < 3; i++) {
        delta[i] = this.X[i] * vec[0] + this.Y[i] * vec[1] + this.Z[i] * vec[2];
        pos[i] += delta[i];
    }
    if (!ROOMS.getRoom(pos)) {
        SOUND.walking.pause();
        SOUND.collision.play();
        return;
    }
    for (let i = 0; i < 3; i++) {
        this.vMatrix[i + 12] -= vec[i];
        this.xyz[i] = pos[i];
    }

    // Move top camera
    TOP_CAMERA.translateCamera(vec4.transformMat4(vec4.create(), delta, TOP_CAMERA.vMatrix));

    // Move model camera
    this.updateModelCamera();

    // Update heads up display
    $('#posX').text('x: ' + pos[0].toFixed(3));
    $('#posY').text('y: ' + pos[1].toFixed(3));
    $('#posZ').text('z: ' + pos[2].toFixed(3));
};