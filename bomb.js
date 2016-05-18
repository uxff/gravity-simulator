function BombDot(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.dir = 0;
}
BombDot.prototype.init = function() {
    this.dir = Math.random()*Math.PI*2;
    this.a = 1.5 + Math.random()*1.0;
    this.vx = this.a * Math.cos(this.dir);
    this.vy = this.a * Math.sin(this.dir);
}
BombDot.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
}
function Bomb(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.dots = [];
    this.lifetime = 0;
    this.maxLifetime = 50;
}

Bomb.prototype.init = function() {
    var len = 10 + Math.random()*15;
    for (var i=0; i<len; ++i) {
        var dot = new BombDot(this.x, this.y);
        dot.init();
        this.dots.push(dot);
    }
}
Bomb.prototype.draw = function(ctx) {
    if (this.lifetime++<this.maxLifetime) {
        
        //ctx.beginPath();
        ctx.strokeStyle = this.color;//"hsla(" + this.hue + ", 90%, 50%, 1)";
        ctx.shadowColor = this.color;//"hsla(" +  + ", 100%, 55%, 1)";
        ctx.shadowBlur = 1;

        for (var i=0; i<this.dots.length; ++i) {
            this.dots[i].update();
            var dot = this.dots[i];
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(dot.x*1.0+1, dot.y*1.0+1);
            //console.log(dot);
            //ctx.closePath();
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        //ctx.moveTo(this.x, this.y);
        
        //ctx.arc(this.x, this.y, this.size, 0, Math.PI*2 , false); 

        //ctx.closePath();
    }

}
Bomb.prototype.update = function() {
    
}