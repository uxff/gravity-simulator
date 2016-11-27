function BombDot(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.dir = 0;
}
BombDot.prototype.init = function() {
    this.dir = Math.random()*Math.PI*2.0;
    this.a = 0.5 + Math.random()*2.5;
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
    this.maxLifetime = 12;
}

Bomb.prototype.init = function() {
    var len = 5 + Math.random()*8;
    for (var i=0; i<len; ++i) {
        var dot = new BombDot(this.x, this.y);
        dot.init();
        this.dots.push(dot);
    }
}
Bomb.prototype.draw = function(ctx) {
    if (this.lifetime++<this.maxLifetime) {
        
        //ctx.beginPath();
        ctx.strokeStyle = "hsla(" + this.color + ", 90%, 50%, 1)";
        ctx.shadowColor = "hsla(" + this.color + ", 100%, 55%, 1)";
        //ctx.shadowBlur = 1;
        //ctx.lineWidth = 1;

        for (var i=0; i<this.dots.length; ++i) {
            this.dots[i].update();
            var dot = this.dots[i];
            ctx.beginPath();
            //var x = (dot.x*1.0 + (dot.x-w/2)*zoomBase), y = (dot.y*1.0 + (dot.y-h/2)*zoomBase);
            var x = (w/2.0 + (dot.x-w/2)*zoomBase), y = (h/2.0 + (dot.y-h/2)*zoomBase);
            ctx.moveTo(x, y);
            ctx.lineTo(x*1.0+1, y*1.0+1);
            //console.log(dot);
            //ctx.closePath();
            ctx.stroke();
        }
        //ctx.moveTo(this.x, this.y);
        
        //ctx.arc(this.x, this.y, this.size, 0, Math.PI*2 , false); 

        //ctx.closePath();
    }

}
Bomb.prototype.update = function() {
    
}