var IMAGE = function () {
    function createImage(url) {
        console.log('Loading', url);
        var image = new Image();
        image.crossOrigin = "anonymous";
        image.src = url;
        return image;
    }
    var texture = {};
    for (var name in URL.texture) {
        texture[name] = createImage(URL.texture[name]);
    }
    return {
        texture: texture,
        create: createImage
    }
}();