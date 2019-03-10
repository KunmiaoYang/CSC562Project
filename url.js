var URL = function () {
    let textureAddress = 'https://kunmiaoyang.github.io/textures/';
    let modelAddress = 'https://kunmiaoyang.github.io/CSC562Models/';
    return {
        rooms: modelAddress + 'rooms.json',
        triangles: modelAddress + 'triangles.json',
        ellipsoids: modelAddress + 'ellipsoids.json',
        sphere: modelAddress + 'spheres.json',
        cityModel: modelAddress + 'city.dae',
        batteryModel: modelAddress + 'battery.dae',
        attackMissileModel: modelAddress + 'AttackMissile.dae',
        defenseMissileModel: modelAddress + 'DefenseMissile.dae',
        UFOModel: modelAddress + 'UFO.dae',
        img: {
            arrow: textureAddress + 'arrow.png',
        },
        texture: {
            'floor': textureAddress + 'floor.jpg',
            'background': textureAddress + 'background.jpg',
            'ceiling': textureAddress + 'ceiling.jpg',

            'abe.png': textureAddress + 'abe.png',
            // 'billie.jpg': textureAddress + 'billie.jpg',
            // 'earth.png': textureAddress + 'earth.png',
            'glass.gif': textureAddress + 'glass.gif',
            // 'leaf.small.png': textureAddress + 'leaf.small.png',
            // 'retro.jpg': textureAddress + 'retro.jpg',
            // 'rocktile.jpg': textureAddress + 'rocktile.jpg',
            // 'sky.jpg': textureAddress + 'sky.jpg',
            // 'stars.jpg': textureAddress + 'stars.jpg',
            // 'tree.png': textureAddress + 'tree.png',
        }
    };
}();