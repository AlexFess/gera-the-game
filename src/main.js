import {Game} from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'Гераическое приключение!',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [
        Game
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {x: 0, y: 900 },
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
        limit: 60,
        target: 60
    }
}

new Phaser.Game(config);
            