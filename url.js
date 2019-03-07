var URL = function () {
    let textureAddress = 'https://kunmiaoyang.github.io/textures/';
    let professorAddress = 'https://ncsucg4games.github.io/prog2/';
    let baseAddress = 'https://kunmiaoyang.github.io/MissileCommand/';
    return {
        rooms: professorAddress + 'rooms.json',
        triangles: professorAddress + 'triangles.json',
        ellipsoids: baseAddress + 'model/ellipsoids.json',
        sphere: professorAddress + 'spheres.json',
        // lights: baseAddress + 'model/lights.json',
        cityModel: baseAddress + 'model/city.dae',
        batteryModel: baseAddress + 'model/battery.dae',
        attackMissileModel: baseAddress + 'model/AttackMissile.dae',
        defenseMissileModel: baseAddress + 'model/DefenseMissile.dae',
        UFOModel: baseAddress + 'model/UFO.dae',
        texture: {
            'floor': textureAddress + 'floor.jpg',
            'background': textureAddress + 'background.jpg',
            'ceiling': textureAddress + 'ceiling.jpg',

            'abe.png': professorAddress + 'abe.png',
            // 'billie.jpg': professorAddress + 'billie.jpg',
            'earth.png': professorAddress + 'earth.png',
            // 'glass.gif': professorAddress + 'glass.gif',
            // 'leaf.small.png': professorAddress + 'leaf.small.png',
            // 'retro.jpg': professorAddress + 'retro.jpg',
            // 'rocktile.jpg': professorAddress + 'rocktile.jpg',
            // 'sky.jpg': professorAddress + 'sky.jpg',
            // 'stars.jpg': professorAddress + 'stars.jpg',
            // 'tree.png': professorAddress + 'tree.png',
        }
    };
}();