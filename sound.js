var SOUND = function () {
    const COPY_COUNT = 2;
    function playNext() {
        this.array[(this.next++) % COPY_COUNT].play();
    }
    // var intro = document.getElementById('sound_intro'),
    //     gamePlay = document.getElementById('sound_play'),
    //     missionComplete = document.getElementById('sound_mission_complete'),
    //     gameOver = document.getElementById('sound_game_over'),
    //     UFO = document.getElementById('sound_UFO');
    var collisions = [document.getElementById('sound_collision')],
        gamePlay = document.getElementById('sound_play'),
        walking = document.getElementById('sound_walking');
    // intro.volume = 0.3;
    gamePlay.volume = 0.05;
    // UFO.volume = 0.3;
    walking.volume = 0.4;
    collisions[0].volume = 1;
    for (let i = 1; i < COPY_COUNT; i++) {
        collisions[i] = collisions[0].cloneNode(true);
        collisions[i].volume = collisions[0].volume;
    }
    return {
        // intro: intro,
        gamePlay: gamePlay,
        // missionComplete: missionComplete,
        // gameOver: gameOver,
        // UFO: UFO,
        collision: {
            array: collisions,
            next: 0,
            play: playNext
        },
        walking: walking,
    }
}();