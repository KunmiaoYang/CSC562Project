var LOD = function () {
    return {
        RANGE_NEAR: 5,
        RANGE_FAR: 10,
        RANGE_DISPEAR: 15,
        AREA_NEAR: 4000,
        AREA_FAR: 80,
        AREA_DISPEAR: 20,
        selectByRange: function (model) {
            if (!model.lod) return -1;
            if (model.dist > LOD.RANGE_DISPEAR)
                return model.lod.array.length;
            if (model.dist > LOD.RANGE_FAR && model.lod.array.length > 1)
                return 1;
            if (model.dist > LOD.RANGE_NEAR && model.lod.array.length > 0)
                return 0;
            return -1;
        },
        selectByArea: function (model) {
            if (!model.lod) return -1;
            var p = -model.lod.r * CAMERA.near / (CAMERA.top - CAMERA.bottom) / vec3.dot(CAMERA.Z, model.fromCamera);
            model.lod.p = p;
            model.lod.area = Math.PI * SHADER.wh * p * p;
            if (model.lod.area < LOD.AREA_DISPEAR)
                return model.lod.array.length;
            if (model.lod.area < LOD.AREA_FAR && model.lod.array.length > 1)
                return 1;
            if (model.lod.area < LOD.AREA_NEAR && model.lod.array.length > 0)
                return 0;
            return -1;
        },
        updateLodInfo: function (furniture) {
            DOM.furnitureId.text('Model ID: ' + furniture.selectId);
            var model = furniture.array[furniture.selectId];
            DOM.furniturePosX.text('x: ' + model.tMatrix[12].toFixed(3));
            DOM.furniturePosY.text('y: ' + model.tMatrix[13].toFixed(3));
            DOM.furniturePosZ.text('z: ' + model.tMatrix[14].toFixed(3));
            DOM.furnitureDist.text('Dist: ' + model.dist.toFixed(3));
            if (model.lod) {
                var level = model.lod.level;
                if (level === undefined || level >= model.lod.array.length)
                    DOM.lodInfoLevel.text('Level: None');
                else
                    DOM.lodInfoLevel.text('Level: ' + (level + 1));

                if (model.lod.select === LOD.selectByRange) {
                    DOM.lodInfoSelect.text('Range based');
                    DOM.furnitureArea.text('');
                } else if (model.lod.select === LOD.selectByArea) {
                    DOM.lodInfoSelect.text('Area based');
                    DOM.furnitureArea.text('Area: ' + model.lod.area.toFixed(3));
                } else DOM.lodInfoSelect.text('None');
            } else {
                DOM.lodInfoLevel.text('Level: 0');
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