var LOD = function () {
    var SWITCH = {
        DISCRETE: 0,
        ALPHA_BLEND: 1,
    };
    return {
        SWITCH: SWITCH,
        AREA_NEAR: 4000,
        AREA_FAR: 80,
        AREA_DISPEAR: 20,
        initModel: function (model, r, simpleModels) {
            model.lod = {
                array: simpleModels,
                level: -1,
                r: r,
                switch: SWITCH.DISCRETE,
                select: LOD.selectByRange,
                rangeBounds: [[4, 6], [9, 11], [14, 16]],
                areaBounds: [[4000, 2000], [100, 80], [30, 20]],
            };
        },
        copyLOD: function (prototype, newModel) {
            if (prototype.lod) {
                newModel.lod = {
                    array: [],
                    level: prototype.lod.level,
                    r: prototype.lod.r,
                    switch: prototype.lod.switch,
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
            var l = model.lod.level, n = model.lod.array.length,
                defaultBlend = { level: 4, alpha: 1.0 };
            if (l >= 0) {
                var b00 = model.lod.rangeBounds[l][0],
                    b01 = model.lod.rangeBounds[l][1];
                if (model.dist < b00) return { level: l - 1, blend: defaultBlend };
                if (model.dist < b01) return {
                    level: l,
                    blend: {
                        level: l - 1,
                        alpha0: Math.min(1.0, 2 * (model.dist - b00) / (b01 - b00)),
                        alpha1: Math.min(1.0, 2 * (b01 - model.dist) / (b01 - b00)),
                    },
                };
            }
            if (l < n) {
                var b10 = model.lod.rangeBounds[l + 1][0],
                    b11 = model.lod.rangeBounds[l + 1][1];
                if (model.dist > b11) return { level: l + 1, blend: defaultBlend };
                if (model.dist > b10) return {
                    level: l,
                    blend: {
                        level: l + 1,
                        alpha0: Math.min(1.0, 2 * (b11 - model.dist) / (b11 - b10)),
                        alpha1: Math.min(1.0, 2 * (model.dist - b10) / (b11 - b10)),
                    },
                };
            }
            return { level: l, blend: defaultBlend };
        },
        selectByArea: function (model) {
            if (!model.lod) return -1;
            var l = model.lod.level, n = model.lod.array.length;
            var p = -model.lod.r * CAMERA.near / (CAMERA.top - CAMERA.bottom) / vec3.dot(CAMERA.Z, model.fromCamera);
            var a = Math.PI * SHADER.wh * p * p;
            model.lod.p = p;
            model.lod.area = a;
            var defaultBlend = { level: 4, alpha: 1.0 };
            if (l >= 0) {
                var b00 = model.lod.areaBounds[l][0],
                    b01 = model.lod.areaBounds[l][1];
                if (a > b00) return { level: l - 1, blend: defaultBlend };
                if (a > b01) return {
                    level: l,
                    blend: {
                        level: l - 1,
                        alpha0: Math.min(1.0, 2 * (b00 - a) / (b00 - b01)),
                        alpha1: Math.min(1.0, 2 * (a - b01) / (b00 - b01)),
                    },
                };
            }
            if (l < n) {
                var b10 = model.lod.areaBounds[l + 1][0],
                    b11 = model.lod.areaBounds[l + 1][1];
                if (a < b11) return { level: l + 1, blend: defaultBlend };
                if (a < b10) return {
                    level: l,
                    blend: {
                        level: l + 1,
                        alpha0: Math.min(1.0, 2 * (a - b11) / (b10 - b11)),
                        alpha1: Math.min(1.0, 2 * (b10 - a) / (b10 - b11)),
                    },
                };
            }
            return { level: l, blend: defaultBlend };
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
                DOM.nonLodElement.hide();
                DOM.lodElement.show('fade');
                if (level === undefined || level > model.lod.array.length) {
                    DOM.lodInfoLevel.text('Level: None');
                } else {
                    DOM.lodInfoLevel.text('Level: ' + (level + 1));
                    DOM.lodConfigManualLevel.val(level + 1);
                }

                if (model.lod.switch === SWITCH.ALPHA_BLEND) {
                    DOM.lodConfigSwitchBlend.prop('checked', 'true');
                } else if (model.lod.switch === SWITCH.DISCRETE) {
                    DOM.lodConfigSwitchDiscrete.prop('checked', 'true');
                }

                if (model.lod.select === LOD.selectByRange) {
                    DOM.lodInfoSelect.text('Range based');
                    DOM.furnitureArea.text('');

                    DOM.lodConfigSelectRange.prop('checked', 'true');
                    DOM.lodConfigAreaBound.hide();
                    DOM.lodConfigManualBound.hide();
                    DOM.lodConfigRangeBound.show();
                    DOM.lodConfigRange00.val(model.lod.rangeBounds[0][0]);
                    DOM.lodConfigRange01.val(model.lod.rangeBounds[0][1]);
                    DOM.lodConfigRange10.val(model.lod.rangeBounds[1][0]);
                    DOM.lodConfigRange11.val(model.lod.rangeBounds[1][1]);
                    DOM.lodConfigRange20.val(model.lod.rangeBounds[2][0]);
                    DOM.lodConfigRange21.val(model.lod.rangeBounds[2][1]);
                } else if (model.lod.select === LOD.selectByArea) {
                    DOM.lodInfoSelect.text('Area based');
                    DOM.furnitureArea.text('Area: ' + model.lod.area.toFixed(3));

                    DOM.lodConfigSelectArea.prop('checked', 'true');
                    DOM.lodConfigRangeBound.hide();
                    DOM.lodConfigManualBound.hide();
                    DOM.lodConfigAreaBound.show();
                    DOM.lodConfigArea00.val(model.lod.areaBounds[0][0]);
                    DOM.lodConfigArea01.val(model.lod.areaBounds[0][1]);
                    DOM.lodConfigArea10.val(model.lod.areaBounds[1][0]);
                    DOM.lodConfigArea11.val(model.lod.areaBounds[1][1]);
                    DOM.lodConfigArea20.val(model.lod.areaBounds[2][0]);
                    DOM.lodConfigArea21.val(model.lod.areaBounds[2][1]);
                } else if (model.lod.select === LOD.selectManually) {
                    DOM.lodInfoSelect.text('Manual select');
                    DOM.furnitureArea.text('');

                    DOM.lodConfigSelectManual.prop('checked', 'true');
                    DOM.lodConfigRangeBound.hide();
                    DOM.lodConfigAreaBound.hide();
                    DOM.lodConfigManualBound.show();
                } else {
                    DOM.lodInfoSelect.text('None');
                    DOM.lodConfigSelectRange.prop('checked', 'false');
                    DOM.lodConfigSelectArea.prop('checked', 'false');
                    DOM.lodConfigSelectManual.prop('checked', 'false');
                }
            } else {
                DOM.lodInfoLevel.text('Level: 0');
                DOM.lodInfoSelect.text('None');
                DOM.lodElement.hide();
                DOM.nonLodElement.show('fade');
            }
        },
        select: function (models) {
            for (var i = 0, n = models.length, selection; i < n; i++) {
                models[i].fromCamera = vec3.sub(vec3.create(), models[i].xyz, CAMERA.xyz);
                models[i].dist = vec3.len(models[i].fromCamera);
                if (!models[i].lod) continue;
                selection = models[i].lod.select(models[i]);
                models[i].lod.level = selection.level;
                if (models[i].lod.switch === SWITCH.ALPHA_BLEND && selection.blend)
                    models[i].lod.blend = selection.blend;
                else models[i].lod.blend = undefined;
            }
            LOD.updateLodInfo(ROOMS.furniture);
        },
        getLOD: function (model, level) {
            if (model.lod) {
                if (level >= model.lod.array.length)
                    return undefined;
                if (level >= 0)
                    return model.lod.array[level];
            }
            return model;
        },
        getCurLOD: function (model) {
            return model.lod ? LOD.getLOD(model, model.lod.level) : model;
        },
        filter: function (model) {
            if (model.lod) {
                var models = [], LODModel = LOD.getCurLOD(model);
                if (LODModel) models.push(LODModel);
                if (model.lod.switch === SWITCH.ALPHA_BLEND) {
                    if (model.lod.blend === undefined) LOD.select([model]);
                    if (LODModel) LODModel.alpha = model.lod.blend.alpha0;
                    LODModel = LOD.getLOD(model, model.lod.blend.level);
                    if (LODModel === undefined) return models;
                    if (model.lod.blend.level > model.lod.level) models.unshift(LODModel);
                    else models.push(LODModel);
                    LODModel.alpha = model.lod.blend.alpha1;
                } else if (LODModel) LODModel.alpha = 1.0;
                return models;
            }
            return [model];
        },
        addLOD: function (model) {
            var r = 0, v = model.coordArray.length / 3;
            var triCenter = vec3.create();
            for (let i = 0; i < model.coordArray.length; i++) {
                triCenter[i % 3] += model.coordArray[i];
            }
            vec3.scale(triCenter, triCenter, 1.0 / v);
            for (var i = 0; i < v; i++) {
                var p = vec3.fromValues(
                    model.coordArray[3 * i] - triCenter[0],
                    model.coordArray[3 * i + 1] - triCenter[1],
                    model.coordArray[3 * i + 2] - triCenter[2]
                );
                var vec = vec3.transformMat4(vec3.create(), p, model.rMatrix);
                r = Math.max(r, vec3.length(vec));
            }
            LOD.initModel(model, r, [model, model]);
        },
        addCurLOD: function () {
            LOD.addLOD(ROOMS.getCurrentFurniture());
            LOD.updateLodInfo(ROOMS.furniture);
        },
        exportCurLOD: function () {
            var model = LOD.getCurLOD(ROOMS.getCurrentFurniture());
            if (model) {
                JSON_MODEL.exportModel(model);
            } else {
                alert('No model can be exported on current LOD level! Please try again when the model is visible!');
            }
        },
        importCurLOD: function (LODModel) {
            var model = ROOMS.getCurrentFurniture();
            if (model.lod) {
                if (model.lod.level < 0) {
                    alert("Replacing the original model is forbidden!")
                } else if (model.lod.level >= model.lod.array.length) {
                    alert("Replacing the invisible level model is forbidden!")
                } else {
                    LODModel.doubleSide = model.doubleSide;
                    LODModel.tMatrix = model.tMatrix;
                    LODModel.rMatrix = model.rMatrix;
                    LODModel.xyz = vec3.fromValues(LODModel.tMatrix[12], LODModel.tMatrix[13], LODModel.tMatrix[14]);
                    model.lod.array[model.lod.level] = LODModel;
                }
            } else {
                alert("This model doesn't contain LOD!");
            }
        },
    };
}();