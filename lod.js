var LOD = function () {
    var RANGE_NEAR = 5;
    var RANGE_FAR = 10;
    return {
        selectByRange: function (model) {
            if (model.lod) {
                if (model.dist > CAMERA.far)
                    return model.lod.array.length;
                if (model.dist > RANGE_FAR && model.lod.array.length > 1)
                    return 1;
                if (model.dist > RANGE_NEAR && model.lod.array.length > 0)
                    return 0;
            }
            return -1;
        },
        updateLodInfo: function (furniture) {
            DOM.furnitureId.text('Model ID: ' + furniture.selectId);
            var model = furniture.array[furniture.selectId];
            DOM.furniturePosX.text('x: ' + model.tMatrix[12].toFixed(3));
            DOM.furniturePosY.text('y: ' + model.tMatrix[13].toFixed(3));
            DOM.furniturePosZ.text('z: ' + model.tMatrix[14].toFixed(3));
            DOM.furnitureDist.text('dist: ' + model.dist.toFixed(3));
            if (model.lod) {
                var level = model.lod.level;
                if (level === undefined || level >= model.lod.array.length)
                    DOM.lodInfoLevel.text('Level: None');
                else if (level < 0)
                    DOM.lodInfoLevel.text('Level: Original');
                else
                    DOM.lodInfoLevel.text('Level: ' + level);

                if (model.lod.select === LOD.selectByRange)
                    DOM.lodInfoSelect.text('Range based');
                else DOM.lodInfoSelect.text('None');
            } else {
                DOM.lodInfoLevel.text('Level: Original');
                DOM.lodInfoSelect.text('None');
            }
        },
        select: function (models) {
            for (var i = 0, n = models.length; i < n; i++) {
                models[i].fromCamera = vec3.sub(vec3.create(), models[i].xyz, CAMERA.xyz);
                models[i].dist = vec3.len(models[i].fromCamera);
                if (!models[i].lod) continue;
                models[i].lod.level = models[i].lod.select(models[i]);
            }
            LOD.updateLodInfo(ROOMS.furniture);
        },
        filter: function (model) {
            if (model.lod) {
                if (model.lod.level >= model.lod.array.length)
                    return undefined;
                if (model.lod.level >= 0)
                    return model.lod.array[model.lod.level];
            }
            return model;
        },
    };
}();