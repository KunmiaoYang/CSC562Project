var LOD = function () {
    var RANGE_NEAR = 5;
    var RANGE_FAR = 10;
    return {
        selectByRange: function (model) {
            if (model.lod) {
                var dist = vec3.dist(CAMERA.xyz, vec3.fromValues(
                    model.tMatrix[12], model.tMatrix[13], model.tMatrix[14]));
                if (dist > RANGE_FAR && model.lod.array.length > 1)
                    return 1;
                if (dist > RANGE_NEAR && model.lod.array.length > 0)
                    return 0;
            }
            return -1;
        },
        select: function (models) {
            for (var i = 0, n = models.length; i < n; i++) {
                if (!models[i].lod) continue;
                models[i].lod.level = models[i].lod.select(models[i]);
            }
        },
        filter: function (model) {
            if (model.lod) {
                if (model.lod.level >= model.lod.array.length)
                    return null;
                if (model.lod.level >= 0)
                    return model.lod.array[model.lod.level];
            }
            return model;
        },
        updateLodInfoLevel: function (model) {
            var level = model.lod.level;
            if (level === undefined || level >= model.lod.array.lenth)
                DOM.lodInfoLevel.text('None');
            else if (level < 0)
                DOM.lodInfoLevel.text('Original');
            else
                DOM.lodInfoLevel.text(level);
        },
        updateLodInfo: function (furniture) {
            DOM.furnitureId.text(furniture.selectId);
            var model = furniture.array[furniture.selectId];
            DOM.furniturePosX.text('x: ' + model.tMatrix[12].toFixed(3));
            DOM.furniturePosY.text('y: ' + model.tMatrix[13].toFixed(3));
            DOM.furniturePosZ.text('z: ' + model.tMatrix[14].toFixed(3));
            if (model.lod) {
                LOD.updateLodInfoLevel(model);

                if (model.lod.select === LOD.selectByRange)
                    DOM.lodInfoSelect.text('Range based');
                else DOM.lodInfoSelect.text('None');
            }
        },
    };
}();