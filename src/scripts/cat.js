
export class Cat {

    direction = 0
    sprite = null
    speed = 350
    jump_speed = -500
    gravity = 900
    long_jump = 300

    score = 0
    jump_count = 0
    jump_time = 0

    dead = false
    hasKey = false


    constructor(cat_sprite) {
        this.sprite = cat_sprite
        this.sprite.setBodySize(80, 60)
        this.sprite.setOffset(40, 60)
        this.sprite.setCollideWorldBounds(true, 0, 0, true)
        this.sprite.setFlipX(true)
        this.sprite.setGravityY(this.gravity)
        this.sprite.setMaxVelocity(500, 900)
        this.sprite.play('idle', {frameRate: 1})
    }

    pick_coin() {
        this.score++
    }

    update(cursors, delta) {
        if (this.dead) {
            return
        }
        let on_ground = this.sprite.body.onFloor() //.blocked.down
        if (cursors.space.isDown) {
            if (on_ground) {
                on_ground = false
                this.sprite.setVelocityY(this.jump_speed)
                this.sprite.play('jump')
                this.jump_time = 0
            } else if (this.jump_time < this.long_jump) {
                this.sprite.setVelocityY(this.jump_speed) //this.gravity * delta / 2000 
            }
        }
        if (cursors.right.isDown) {
            let new_direction = 1
            if (new_direction != this.direction) {
                this.direction = new_direction
                this.sprite.setFlipX(true)
                this.sprite.setOffset(40, 60)
            }
            if (on_ground && this.sprite.anims.currentAnim?.key != 'run') {
                this.sprite.play('run')
            }
        } else if (cursors.left.isDown) {
            let new_direction = -1
            if (new_direction != this.direction) {
                this.direction = new_direction
                this.sprite.setFlipX(false)
                this.sprite.setOffset(20, 60)
            }
            if (on_ground && this.sprite.anims.currentAnim?.key != 'run') {
                this.sprite.play('run')
            }
        } else {
            if (on_ground) {
                this.sprite.play('idle')
                this.jump_time = 0
            }
            this.direction = 0
        }
        if (!on_ground) {
            this.jump_time += delta
        }
        this.sprite.setVelocityX(this.direction * this.speed)
    }
}