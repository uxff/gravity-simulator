window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

var c = document.getElementById("canvas-club");
var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;
var ctx = c.getContext("2d");

var maxParticles = 14;
var particles = [];
var bombs = [];

var hue = 183;
// 万有引力系数 G 决定引力大小
var G = 0.000021;
//G = 0.1;

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
    this.lifeStep = 1;// 生命阶段: 1=正常运转 2=爆炸中 3=碎片 4=死亡
}
mouse = {};
//mouse.prototype = new P();
mouse.size = 200;
mouse.x = mouse.tx = w / 2;
mouse.y = mouse.ty = h / 2;
mouse.draw = function () {
    //ctx.strokeStyle = "hsla(" + this.hue + ", 90%, 50%, 1)";
    ctx.shadowColor = 'rgba(255,255,0,1)';//"hsla(" + 100 + ", 100%, 55%, 1)";
    //ctx.shadowBlur = this.size * 2;
    ctx.beginPath();

    //ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, 10, 0, Math.PI*2 , false); 

    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.stroke();

}
function EternalStar() {
}
P.prototype = {
    init: function() {
        this.size = 0.5;//this.origSize = random(10, 100);
        this.x = w/2-10.0;//random(10, w-10);
        this.y = random(10, h-10);//0;//Math.random() > .5 ? -this.size : h + this.size;
        this.vx = (h/2+200)/(h/2-this.y)*0.00514;//random(-0.02, 0.02);//
        this.vy = 0;//random(-0.02, 0.02);//
        this.mass = random(1, 8);
        this.hue = random(1, 16000000);//hue;
        this.oldx = 0;
        this.oldy = 0;
    },

    draw: function(ctx) {

        if (this.lifeStep==1) {

            ctx.strokeStyle = "hsla(" + this.hue + ", 90%, 50%, 1)";
            ctx.shadowColor = "hsla(" + this.hue + ", 100%, 55%, 1)";
            ctx.shadowBlur = this.size * 1;
            ctx.beginPath();

            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2 , false); 

            ctx.closePath();
            ctx.lineWidth = 1;
            ctx.stroke();

        }
    },

    update: function() {
        // 小于1就碰撞了 爆炸
        //if (dist>1)//(!this.checkBorder(w, h))
        this.oldx = this.x;
        this.oldy = this.y;
        
        var aAll = this.calcGravityAll();
        //aAll.parseXY();

        //var a = this.calcGravity(eternal);
        //a.parseXY();
        //this.ax = aAll.ax*1.0+a.ax;
        //this.ay = aAll.ay*1.0+a.ay;
        this.ax = aAll.ax;
        this.ay = aAll.ay;

        this.vx += this.ax;
        this.vy += this.ay;

        this.x += this.vx;
        this.y += this.vy;
        
        this.stepx = this.x - this.oldx;
        this.stepy = this.y - this.oldy;
        
        //this.calcRelativePos(eternal);

        //console.log('stepx='+this.stepx+' x='+this.x);
        //console.log('stepy='+this.stepy+' y='+this.y);
        //console.log('ax='+this.ax+' ay='+this.ay+' dir='+this.dir);
        //console.log('vx='+this.vx+' vy='+this.vy);
    },
    /*
        target = {x:10,y:20}
    */
    calcDistance: function(target) {
        return this.distanceFromMouse = distance(this.x, this.y, target.x, target.y);
    },
    /*
        return Acc obj
    */
    calcGravity: function(target, dist) {
        //var dist = distance(this.x, this.y, target.x, target.y);
        if (dist<1) {
            return new Acc(0);
        }
        // 万有引力公式
        // F = M1*M2 / (r*r) * G
        // 这里计算加速度 所以约分去掉了本对象的质量
        var force = target.mass / (dist*dist) * G;
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
            if (target.id == this.id || this.lifeStep!=1 || target.lifeStep!=1) {
                // 已经撞击或者已经爆炸的不能参与计算
                continue;
            }
            // 距离太小将爆炸，并合并
            var dist = distance(this.x, this.y, target.x, target.y);
            if (dist<2.5) {
                //console.log(dist);
                if (this.mass > target.mass) {
                    //console.log('BIG:'+this.mass+' id:'+this.id);
                    //console.log('TARGET is less mass , will bomb! id='+target.id+' crash on id='+this.id);
                    this.mass += target.mass;
                    target.mass = 0;
                    target.lifeStep = 2;
                } else {
                    //console.log('ME is less mass , will bomb! id='+this.id+' crash on id='+target.id);
                    target.mass += this.mass;
                    this.mass = 0;
                    this.lifeStep = 2;
                }
            } else {
                var gtmp = this.calcGravity(target, dist);
                gtmp.parseXY();
                //console.log(gtmp);
                g.ax += gtmp.ax;
                g.ay += gtmp.ay;
            }
            //console.log(g);
        }
        return g;
    },
    // 检查屏幕边界
    checkBorder: function(width, height) {
        var f = parseFloat(this.size)+1.0;
        return (this.x<-f || this.y<-f || this.x>width+f || this.y>height+f);
    },
    // 计算相对位置和方向
    calcRelativePos: function(target) {
        var x = target.x - this.x;
        var y = target.y - this.y;
        this.dir = Math.atan2(y, x);
        return this.dir;
    },
    drawDir: function() {
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        dirLen = 8;
        var dirX = dirLen * Math.cos(this.dir);
        var dirY = dirLen * Math.sin(this.dir);
        ctx.lineTo(this.x*1.0+dirX, this.y*1.0+dirY);

        ctx.closePath();
        ctx.lineWidth = 0.5;
        ctx.stroke();
    },
    calcGravityCenter: function() {
        //return mouse;
    }
    
}

//function EternalStar() {
//    this.mass = 1600;
//    this.x = w / 2;
//    this.y = h / 2;
//}
//EternalStar.prototype = new P();

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
//window.addEventListener("touchstart", mouse.touches);
//window.addEventListener("touchmove", mouse.touches)

//c.addEventListener("mouseleave", mouse.mouseleave)

window.addEventListener("resize", function() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
});

for (var i = 1; i <= maxParticles; i++) {
    //setTimeout(function() {
        var p = new P();
        p.id = particles.length;
        p.init();
        particles.push(p);
        //console.log(i);
    //}, i * 50);
}

eternal = new P();//new EternalStar();
//eternal.init();
eternal.id = particles.length;
eternal.mass = 4800;
eternal.x = w/2;
eternal.y = h/2;
eternal.size = 2.5;
particles.push(eternal);


function anim() {
    ctx.fillStyle = clearColor;
    ctx.shadowColor = clearColor;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, w, h);
    //mouse.move();

    for (var i=0; i<particles.length; ++i) {
        var p = particles[i];
        //console.log(i);
        p.draw(ctx);
        for (var k=0; k<100; ++k) {
            p.update();
        }
        if (p.lifeStep==2) {
            var bomb = new Bomb(p.x, p.y, p.color);
            bomb.pid = p.id;
            bomb.init();
            bombs.push(bomb);
            //console.log('BOMBED,p.id='+p.id);
            p.lifeStep = 3;
            //i--;
        }
    }
    for (var i=0; i<particles.length; ++i) {
        if (particles[i].lifeStep==3) {
            particles.splice(i, 1);
            --i;
        }
    }
    for (var i in bombs) {
        var b = bombs[i];
        b.draw(ctx);
    }
    hue++;
    hue %= 16000000;
    //mouse.draw();
    //eternal.draw();
    requestAnimationFrame(anim);
}

anim();
