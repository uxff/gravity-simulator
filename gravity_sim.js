window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

var c = document.getElementById("canvas-club");
var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;
var ctx = c.getContext("2d");

var maxParticles = 4;
var particles = [];
var eternals  = [];
var hue = 183;


var clearColor = "rgba(0, 0, 0, .2)";

function random(min, max) {
    return Math.random() * (max - min) + min
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

// 加速度
function Acc(a) {
    this.a = a || 0;
    this.ax = 0;
    this.ay = 0;
    this.dir = Math.PI/2;
}
Acc.prototype.parseXY = function() {
    this.ax = this.a * Math.cos(this.dir);
    this.ay = this.a * Math.sin(this.dir);
}
function P() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.dir = Math.PI/2;
    this.oldx = 0;
    this.oldy = 0;
    this.stepx = 0;
    this.stepy = 0;
    this.mass = 5;
}
mouse = {};
//mouse.prototype = new P();
mouse.size = 200;
mouse.x = mouse.tx = w / 2;
mouse.y = mouse.ty = h / 2;
mouse.mass = 10;
mouse.draw = function () {
    //ctx.strokeStyle = "hsla(" + this.hue + ", 90%, 50%, 1)";
    ctx.shadowColor = 'rgba(255,255,0,1)';//"hsla(" + 100 + ", 100%, 55%, 1)";
    //ctx.shadowBlur = this.size * 2;
    ctx.beginPath();

    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, 1, 0, Math.PI*2 , false); 

    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.stroke();

}
function EternalStar() {
    
}
P.prototype = {
    init: function() {
        this.size = 3;//this.origSize = random(10, 100);
        this.x = w/2;//random(10, w-10);
        this.y = random(10, h-10);//0;//Math.random() > .5 ? -this.size : h + this.size;
        this.vx = 0.04;//random(-0.1, 0.1);
        this.vy = 0;//random(-0.1, 0.1);
        this.mass = random(1, 10);
        this.speed = this.origSpeed = random(.01, .03);
        this.hue = hue;
        //this.vx = 0;
        //this.vy = 0;
        this.oldx = 0;
        this.oldy = 0;
    },

    draw: function() {
        

        ctx.strokeStyle = "hsla(" + this.hue + ", 90%, 50%, 1)";
        ctx.shadowColor = "hsla(" + this.hue + ", 100%, 55%, 1)";
        ctx.shadowBlur = this.size * 2;
        ctx.beginPath();

        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2 , false); 

        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.stroke();

        this.drawDir();

        for (var i=0; i<100; i++) {
            this.update();
        }
    },

    update: function() {
        this.calcDistance(eternal);
        //return ;
        //if (this.distanceFromMouse > 20)
        if (1)//(!this.checkBorder(w, h))
        {
            //this.x += (mouse.x - this.x) * this.speed;
            //this.y += (mouse.y - this.y) * this.speed;
            //if (this.distanceFromMouse < mouse.size) {
            //    //this.size += (0 - this.size) * this.speed;
            //    this.speed += .01;
            //} else {
            //    //this.size += (this.origSize - this.size) * this.speed;
            //}
            this.oldx = this.x;
            this.oldy = this.y;
            
            var aAll = this.calcGravityAll();
            //aAll.parseXY();

            var a = this.calcGravity(eternal);
            a.parseXY();
            this.ax = aAll.ax*1.0+a.ax;
            this.ay = aAll.ay*1.0+a.ay;
            //this.ax = a.ax;
            //this.ay = a.ay;

            this.vx += this.ax;
            this.vy += this.ay;

            this.x += this.vx;
            this.y += this.vy;
            
            this.stepx = this.x - this.oldx;
            this.stepy = this.y - this.oldy;
            
            this.calcRelativePos(eternal);

            //console.log('stepx='+this.stepx+' x='+this.x);
            //console.log('stepy='+this.stepy+' y='+this.y);
            //console.log('ax='+this.ax+' ay='+this.ay+' dir='+this.dir);
            //console.log('vx='+this.vx+' vy='+this.vy);
            
        } else {
            this.init();
        }
        
    },
    /*
        target = {x:10,y:20}
    */
    calcDistance: function(target) {
        return this.distanceFromMouse = distance(this.x, this.y, target.x, target.y);
    },
    calcGravity: function(target) {
        var dist = distance(this.x, this.y, target.x, target.y);
        // 万有引力公式
        var force = this.mass * target.mass / (dist*dist) * 0.000021;
        var g = new Acc(force);
        g.dir = this.calcRelativePos(target);
        //console.log(g);
        return g;
    },
    calcGravityAll: function() {
        var g = new Acc(0);
        //console.log(particles);
        for (var i in particles) {
            target = particles[i];
            if (target.index == this.index) {
                continue;
            }
            var gtmp = this.calcGravity(target);
            gtmp.parseXY();
            //console.log(gtmp);
            g.ax += gtmp.ax;
            g.ay += gtmp.ay;
        //console.log(g);
        }
        return g;
    },
    checkBorder: function(width, height) {
        var f = parseFloat(this.size)+1.0;
        return (this.x<-f || this.y<-f || this.x>width+f || this.y>height+f);
    },
    calcRelativePos: function(target) {
        var x = target.x - this.x;
        var y = target.y - this.y;
        this.dir = Math.atan2(y, x);
        return this.dir;
    },
    drawDir: function() {
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        dirLen = 12;
        var dirX = dirLen * Math.cos(this.dir);
        var dirY = dirLen * Math.sin(this.dir);
        ctx.lineTo(this.x*1.0+dirX, this.y*1.0+dirY);

        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.stroke();
    },
    calcGravityCenter: function() {
        return mouse;
    }
    
}

function EternalStar() {
    this.mass = 2000;
    this.x = w / 2;
    this.y = h / 2;
}
EternalStar.prototype = new P();

mouse.move = function() {
    if (!distance(mouse.x, mouse.y, mouse.tx, mouse.ty) <= .1) {
        mouse.x += (mouse.tx - mouse.x) * .2;
        mouse.y += (mouse.ty - mouse.y) * .2;
    }
};

mouse.touches = function(e) {
    var touches = e.touches;
    if (touches) {
        mouse.tx = touches[0].clientX;
        mouse.ty = touches[0].clientY;
    } else {
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
    }
    e.preventDefault();
};

mouse.mouseleave = function(e) {
    mouse.tx = w / 2;
    mouse.ty = h / 2;
};

//window.addEventListener("mousemove", mouse.touches);
//window.addEventListener("click", mouse.touches);
window.addEventListener("touchstart", mouse.touches);
window.addEventListener("touchmove", mouse.touches)

//c.addEventListener("mouseleave", mouse.mouseleave)

window.addEventListener("resize", function() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
});

for (var i = 1; i <= maxParticles; i++) {
    setTimeout(function() {
        var p = new P();
        p.index = particles.length;
        p.init();
        particles.push(p);
        //console.log(i);
    }, i * 50);
}

eternal = new EternalStar;

function anim() {
    ctx.fillStyle = clearColor;
    ctx.shadowColor = clearColor;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, w, h);
    mouse.move();

    for (var i in particles) {
        var p = particles[i];
        p.draw();
    }
    hue++;
    mouse.draw();
    requestAnimationFrame(anim);
}

anim();
