var LOD = function () {
    var RANGE_NEAR = 5;
    var RANGE_FAR = 10;
    var selectByRange = function (model) {
        if (model.lod) {
            var dist = vec3.dist(CAMERA.xyz, vec3.fromValues(
                model.tMatrix[12], model.tMatrix[13], model.tMatrix[14]));
            if (dist > RANGE_FAR && model.lod.array.length > 1)
                return model.lod.array[1];
            if (dist > RANGE_NEAR && model.lod.array.length > 0)
                return model.lod.array[0];
        }
        return model;
    };
    return {
        selectByRange: selectByRange,
        select: selectByRange,
    };
}();