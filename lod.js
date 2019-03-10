var LOD = function () {
    return {
        AREA_NEAR: 4000,
        AREA_FAR: 80,
        AREA_DISPEAR: 20,
        initModel: function (model, r, simpleModels) {
            model.lod = {
                array: simpleModels,
                level: -1,
                r: r,
                select: LOD.selectByRange,
                rangeBounds: [[3, 7], [8, 12], [13, 17]],
                areaBounds: [[4000, 2000], [100, 80], [30, 20]],
            };
        },
        copyLOD: function (prototype, newModel) {
            if (prototype.lod) {
                newModel.lod = {
                    array: [],
                    level: prototype.lod.level,
                    r: prototype.lod.r,
                    select: prototype.lod.select,
                    rangeBounds: prototype.lod.rangeBounds,
                    areaBounds: prototype.lod.areaBounds,
                };
                for (var i = 0; i < prototype.lod.array.length; i++)
                    newModel.lod.array[i] = MODELS.copyModel(
                        prototype.lod.array[i], newModel.rMatrix, newModel.tMatrix);
            }
        },
        selectByRange: function (model) {
            if (!model.lod) return -1;
            var l = model.lod.level, n = model.lod.array.length;
            if (l >= 0 && model.dist < model.lod.rangeBounds[l][0]) return l - 1;
            if (l < n && model.dist > model.lod.rangeBounds[l + 1][1]) return l + 1;
            return l;
        },
        selectByArea: function (model) {
            if (!model.lod) return -1;
            var l = model.lod.level, n = model.lod.array.length;
            var p = -model.lod.r * CAMERA.near / (CAMERA.top - CAMERA.bottom) / vec3.dot(CAMERA.Z, model.fromCamera);
            var a = Math.PI * SHADER.wh * p * p;
            model.lod.p = p;
            model.lod.area = a;
            if (l >= 0 && a > model.lod.areaBounds[l][0]) return l - 1;
            if (l < n && a < model.lod.areaBounds[l + 1][1]) return l + 1;
            return l;
        },
        selectManually: function (model) {
            return model.lod.level;
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