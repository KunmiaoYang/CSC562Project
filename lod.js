var LOD = function () {
    return {
        select: function (model) {
            if (model.lod) {
                return model.lod.array[0];
            }
            return model;
        },
    };
}();