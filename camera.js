var TOP_CAMERA = function() {
    var HEIGHT = 9;
    var coord = vec3.fromValues(0.5, HEIGHT, -0.5); // default camera position in world space
    var lookAt = vec3.fromValues(0, -1, 0); // default camera look at direction in world space
    var viewUp = vec3.fromValues(0, 0, -1); // default camera view up direction in world space
    return {
        left: -0.5, right: 0.5,
        top: 0.5, bottom: -0.5,
        near: 0.5, far: 100,
        initCamera: function () {
            this.xyz = coord;
            this.pMatrix = this.calcPerspective(this.left, this.right, this.top, this.bottom, this.near, this.far);

            let center = vec3.fromValues(this.xyz[0] + lookAt[0], this.xyz[1] + lookAt[1], this.xyz[2] + lookAt[2]);
            this.vMatrix = mat4.lookAt(mat4.create(), this.xyz, center, viewUp);
            this.updateCameraAxis();
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
            for (let i = 0; i < 2; i++) {
                this.xyz[i] += this.X[i] * vec[0] + this.Y[i] * vec[1] + this.Z[i] * vec[2];
                this.vMatrix[i + 12] -= vec[i];
            }
        },
        zoomCamera: function (dist) {
            for (let i = 0; i < 2; i++) {
                this.xyz[i] += this.Z[i] * dist;
            }
            this.vMatrix[14] -= dist;
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
    };
}();

var CAMERA = function () {
    var coord = vec3.fromValues(0.5, 0.5, -0.5); // default camera position in world space
    var lookAt = vec3.fromValues(0, 0, 1); // default camera look at direction in world space
    var viewUp = vec3.fromValues(0, 1, 0); // default camera view up direction in world space
    return {
        left: -0.5, right: 0.5,
        top: 0.5, bottom: -0.5,
        near: 0.5, far: 100,
        initCamera: function () {
            this.xyz = coord;
            this.pMatrix = this.calcPerspective(this.left, this.right, this.top, this.bottom, this.near, this.far);

            let center = vec3.fromValues(this.xyz[0] + lookAt[0], this.xyz[1] + lookAt[1], this.xyz[2] + lookAt[2]);
            this.vMatrix = mat4.lookAt(mat4.create(), this.xyz, center, viewUp);
            this.updateCameraAxis();
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

            // Update heads up display
            $('#posX').text('x: ' + pos[0].toFixed(3));
            $('#posY').text('y: ' + pos[1].toFixed(3));
            $('#posZ').text('z: ' + pos[2].toFixed(3));
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
}();
