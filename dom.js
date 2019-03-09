var DOM = function() {
    return {
        canvas: document.getElementById("myWebGLCanvas"),
        topCanvas: document.getElementById("topCanvas"),
        playButton: $('#play_game'),
        pauseButton: $('#pause_game'),
        title: $('#title'),
        lodInfo: $('#lod_info'),
        furnitureId: $('#furniture_id'),
        lodInfoLevel: $('#lod_info_level'),
        furniturePosX: $('#furniture_posX'),
        furniturePosY: $('#furniture_posY'),
        furniturePosZ: $('#furniture_posZ'),
        furnitureDist: $('#furniture_dist'),
        furnitureArea: $('#furniture_area'),
        lodInfoSelect: $('#lod_info_select'),

        load: function(option, camera, url) {
            var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
            option.useLight = document.getElementById("UseLight").checked;
            // url.lights = document.getElementById("LightsURL").value;
            // canvas.width = parseInt(document.getElementById("Width").value);
            // canvas.height = parseInt(document.getElementById("Height").value);
            // camera.left = parseFloat(document.getElementById("WLeft").value);
            // camera.right = parseFloat(document.getElementById("WRight").value);
            // camera.top = parseFloat(document.getElementById("WTop").value);
            // camera.bottom = parseFloat(document.getElementById("WBottom").value);
            // camera.near = parseFloat(document.getElementById("WNear").value);
            // camera.far = parseFloat(document.getElementById("WFar").value);
        }
    };
}();