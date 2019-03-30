var DOM = function () {
    return {
        canvas: document.getElementById("myWebGLCanvas"),
        topCanvas: document.getElementById("topCanvas"),
        playButton: $('#play_game'),
        pauseButton: $('#pause_game'),
        title: $('#title'),
        mapArrow: $('#map_arrow'),

        // LOD info
        lodInfo: $('#lod_info'),
        furnitureId: $('#furniture_id'),
        lodInfoLevel: $('#lod_info_level'),
        furniturePosX: $('#furniture_posX'),
        furniturePosY: $('#furniture_posY'),
        furniturePosZ: $('#furniture_posZ'),
        furnitureDist: $('#furniture_dist'),
        furnitureArea: $('#furniture_area'),
        lodInfoSelect: $('#lod_info_select'),

        // LOD config
        lodConfig: $('div#lod_config'),
        lodConfigSwitchDiscrete: $('#lod_config_switch_discrete'),
        lodConfigSwitchBlend: $('#lod_config_switch_blend'),
        lodConfigSelectRange: $('#lod_config_select_range'),
        lodConfigSelectArea: $('#lod_config_select_area'),
        lodConfigSelectManual: $('#lod_config_select_manual'),
        lodConfigRangeBound: $('#lod_config_range_bound'),
        lodConfigRange00: $('#lod_config_range_00'),
        lodConfigRange01: $('#lod_config_range_01'),
        lodConfigRange10: $('#lod_config_range_10'),
        lodConfigRange11: $('#lod_config_range_11'),
        lodConfigRange20: $('#lod_config_range_20'),
        lodConfigRange21: $('#lod_config_range_21'),
        lodConfigAreaBound: $('#lod_config_area_bound'),
        lodConfigArea00: $('#lod_config_area_00'),
        lodConfigArea01: $('#lod_config_area_01'),
        lodConfigArea10: $('#lod_config_area_10'),
        lodConfigArea11: $('#lod_config_area_11'),
        lodConfigArea20: $('#lod_config_area_20'),
        lodConfigArea21: $('#lod_config_area_21'),
        lodConfigManualBound: $('#lod_config_manual_bound'),
        lodConfigManualLevel: $('#lod_config_manual_level'),
        lodConfigImport: $('#lod_config_import'),
        lodConfigImportMethodText: $('#lod_config_import_method_text'),
        lodConfigImportMethodFile: $('#lod_config_import_method_file'),
        lodConfigImportMethodVC: $('#lod_config_import_method_VC'),
        lodConfigImportText: $('#lod_config_import_text'),
        lodConfigImportTextCode: $('#lod_config_import_text_code'),
        lodConfigImportFile: $('#lod_config_import_file'),
        lodConfigImportFilePath: $('#lod_config_import_file_path'),
        lodConfigImportVC: $('#lod_config_import_VC'),
        lodConfigImportVCNx: $('#lod_config_import_VC_nx'),
        lodConfigImportVCNy: $('#lod_config_import_VC_ny'),
        lodConfigImportVCNz: $('#lod_config_import_VC_nz'),

        // LOD class
        lodElement: $('.lod_element'),
        nonLodElement: $('.non_lod_element'),

        load: function (option, camera, url) {
            var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
            option.useLight = document.getElementById("UseLight").checked;
            DOM.lodInfo.hide();
            DOM.lodConfigImportText.hide();
            DOM.lodConfigImportVC.hide();
            DOM.lodConfigImport.hide();
            DOM.lodConfigImportMethodFile.prop('checked', 'true');
            // DOM.mapArrow.hide();
            // url.lights = document.getElementById("LightsURL").value;
            // canvas.width = parseInt(document.getElementById("Width").value);
            // canvas.height = parseInt(document.getElementById("Height").value);
            // camera.left = parseFloat(document.getElementById("WLeft").value);
            // camera.right = parseFloat(document.getElementById("WRight").value);
            // camera.top = parseFloat(document.getElementById("WTop").value);
            // camera.bottom = parseFloat(document.getElementById("WBottom").value);
            // camera.near = parseFloat(document.getElementById("WNear").value);
            // camera.far = parseFloat(document.getElementById("WFar").value);
        },
        exportJSON: function (obj, filename = 'data.json') {
            var dataStr = JSON.stringify(obj);
            var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            var link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', filename);
            link.click();
            link.remove();
        },
    };
}();