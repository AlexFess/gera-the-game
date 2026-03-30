import {Cat} from '../scripts/cat.js'

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    init() {
        
    }

    preload() {
        this.load.tilemapTiledJSON('lvl0', 'assets/castle_level_1.tmj');
        this.load.image('tileset_dungeon_x4', 'assets/tileset_dungeon_x4.png');
        this.load.image('princess', 'assets/princess.png');
        this.load.spritesheet('cat_run', 'assets/cat_run.png', {frameWidth: 140, frameHeight: 140})
        this.load.spritesheet('coin', 'assets/coin_small.png', {frameWidth: 32, frameHeight: 36})
    }

    create() {
        // Tiles and worls boundaries
        const tmap = this.make.tilemap({'key': 'lvl0'})
        const tset = tmap.addTilesetImage('tileset_dungeon_x4', 'tileset_dungeon_x4');
        tmap.layer.y = 0 
        tmap.layer.x = 0
        this.physics.world.setBounds(0, 0, 60*64, 20*64)
        this.cameras.main.setZoom(1, 1)
        this.cameras.main.setBounds(0, 0, 60*64, 20*64)

        tmap.createLayer('back', tset)
        tmap.createLayer('front', tset)
        const layer = tmap.createLayer('surf', tset)
        layer.setCollisionByProperty({'collides': true}, true)


        this.anims.create({key: 'run', frames: this.anims.generateFrameNumbers('cat_run', {start: 1, end: 20}), frameRate: 12, repeat: -1})
        this.anims.create({key: 'jump', frames: this.anims.generateFrameNumbers('cat_run', {start: 21, end: 30}), frameRate: 12, repeat: 0})
        this.anims.create({key: 'idle', frames: this.anims.generateFrameNumbers('cat_run', {start: 1, end: 1}), frameRate: 1, repeat: -1})
        this.anims.create({key: 'coin_0', frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 1}), frameRate: 2, repeat: -1})

        ;
        
        this.cursors = this.input.keyboard.createCursorKeys();

        const coins = this.physics.add.group({immovable: true, allowGravity: false})
        const traps = []
        this.max_coins = 0
        let objectLayer = tmap.getObjectLayer('spawns')
        objectLayer.objects.forEach((obj) => {
            switch (obj.name) {
                case 'cat':
                    let cat_sprite = this.physics.add.sprite(obj.x, obj.y + 70, 'cat_run');
                    cat_sprite.setDepth(100)
                    this.physics.add.collider(cat_sprite, layer)
                    this.cat = new Cat(cat_sprite)
                break
                case 'coin':
                    const coin = this.physics.add.sprite(obj.x, obj.y + 18, 'coin')
                    coins.add(coin)
                    this.max_coins++
                break
                case 'trap':
                    const trap = this.physics.add.staticBody(obj.x, obj.y, obj.width, obj.height)
                    traps.push(trap)
                break
                case 'princess':
                    this.add.image(obj.x+50, obj.y + obj.height / 2, 'princess').setScale(0.25)
                    this.princess = this.physics.add.staticBody(obj.x, obj.y, 100, obj.height)
                break
                case 'portal':
                    this.portal = this.physics.add.staticBody(obj.x, obj.y, obj.width, obj.height)
                    this.portal.out_x = obj.out_x
                    this.portal.out_y = obj.out_y
                break
                case 'key':
                    this.key = this.physics.add.staticBody(obj.x, obj.y, obj.width, obj.height)
                break
            }
        })

        this.physics.add.overlap(this.cat.sprite, coins, 
          (cat, coin) => { 
            coin.destroy();
            this.cat.pick_coin()
            
        });
        coins.playAnimation('coin_0', 0)

        this.physics.add.overlap(this.cat.sprite, traps, this.gameOver.bind(this));

        this.physics.add.collider(this.cat.sprite, this.princess, () => {
            if (this.cat.dead) {
                return
            }
            this.cat.dead = true
            this.cat.sprite.setMaxVelocity(0, 0)
            this.princess.destroy()
            this.add.text(400, 300, 'Ура!!! Гера нашел Принцессу!', { fontSize: '28px', fill: '#FFF', fontStyle: 'bold'}).setScrollFactor(0);
            this.add.text(430, 350, 'Монет собрано:  ' + this.cat.score + ' / ' + this.max_coins, { fontSize: '28px', fill: '#FFF', fontStyle: 'bold'}).setScrollFactor(0);
            this.time.delayedCall(3000, () => {this.scene.restart()}, null, this)
        });

        this.physics.add.overlap(this.cat.sprite, this.key, (cat, key) => {
            tmap.removeTileAtWorldXY(key.x, key.y, layer.layerIndex)
            key.destroy()
            this.cat.hasKey = true
        })

        this.physics.add.overlap(this.cat.sprite, this.portal, (cat, portal) => {
            if (this.cat.hasKey) {
                this.cat.sprite.setPosition(portal.out_x, portal.out_y)
            }
        })

        this.physics.world.on('worldbounds', (body, up, down, left, right) => {
            if (down) {this.gameOver()}
            })

        this.cameras.main.startFollow(this.cat.sprite, 0.8, 0.8)
        
    }

    gameOver() {
        if (this.cat.dead) {
            return
        }
        this.cat.sprite.tint = 0xff0000
        this.cat.sprite.setMaxVelocity(0, 900)
        this.cat.sprite.setVelocityY(-500)
        this.cat.dead = true
        this.time.delayedCall(500, () => {this.cat.sprite.destroy()}, null, this)
        this.time.delayedCall(1000, () => {this.scene.restart()}, null, this)
    }

    update(time, delta) {
        // console.log(time, delta)
        this.cat.update(this.cursors, delta)
    }
}