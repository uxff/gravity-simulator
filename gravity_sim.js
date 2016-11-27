var random = function(min, max) {
    return Math.random() * (max - min) + min
}

var distance = function (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

var w;//= c.width = window.innerWidth;
var h;//= c.height = window.innerHeight;
var ctx;// = c.getContext("2d");
var zoomBase = 1.0, zoomReduct = 1.0;// = document.getElementById('zoom').value;
var particles = [];
var bombs = [];
var anim;
var zoomStep = 1.41421356;

var hue = Math.random()*100+20;
// 万有引力系数 G 决定引力大小
var G = 0.0000021;
//G = 0.1;

var clearColor = "rgba(15, 15, 15, .2)";

window.onload = function () {
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

    var c = document.getElementById("canvas-club");
    w= c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 1;
    zoomBase = document.getElementById('zoom').value;
    var urlParam = new UrlSearch(); //实例化

    // 可配置参数
    var maxParticles = urlParam.get('maxParticles') || 10;
    var calcTimes = urlParam.get('calcTimes') || 400;
    var enableCenter = urlParam.get('enableCenter') ? 1 : 0;
    var orbMinMass = urlParam.get('orbMinMass');
    var orbMaxMass = urlParam.get('orbMaxMass');
    var centerMass = urlParam.get('centerMass');
    var orbMaxVelo = urlParam.get('orbMaxVelo', 'float');
    var arrangeType  = urlParam.get('arrangeType');

    //console.log(urlParam.get('enableCenter', 'ori'));
    //console.log(enableCenter);



    // 鼠标操作 暂时没启用
    mouse = {};
    //mouse.prototype = new Orb();
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
            var p = new Orb();
            p.id = particles.length;
            p.init();
            p.mass = random(orbMinMass, orbMaxMass);
            tangle = i*Math.PI/maxParticles*2.0;
            switch (arrangeType) {
                case 2:
                    p.vx =  Math.sin(tangle) * orbMaxVelo;
                    p.vy = -Math.cos(tangle) * orbMaxVelo;
                    p.x = Math.cos(tangle) * 300.0 + w/2.0;
                    p.y = Math.sin(tangle) * 300.0 + h/2.0;
                    break;
                default:
                    var tdir = Math.random()*2.0*Math.PI, trandom = Math.random();
                    p.vx = random(-orbMaxVelo, orbMaxVelo);// Math.sin(vdir) * orbMaxVelo;// 
                    p.vy = random(-orbMaxVelo, orbMaxVelo);//-Math.cos(vdir) * orbMaxVelo;// 
                    // 圆形区域分布
                    p.x = trandom*h/2.0 * Math.cos(tdir) + w/2.0;//random(w/3.0, w/3.0*2);//Math.cos(tangle) * 300.0 + w/2.0;//
                    p.y = trandom*h/2.0 * Math.sin(tdir) + h/2.0;//random(h/3.0, h/3.0*2);//Math.sin(tangle) * 300.0 + h/2.0;//
                    //console.log('h='+h+' w='+w+' p.x='+p.x+' p.y='+p.y);
                    break;
            }
            particles.push(p);
            //console.log(i);
        //}, i * 50);
    }


    eternal = new Orb();//new EternalStar();
    //eternal.init();
    ETERNAL_ID = particles.length;
    eternal.id = particles.length;
    eternal.mass = centerMass;
    eternal.x = w/2;
    eternal.y = h/2;
    eternal.size = 2.5;

    enableCenter && particles.push(eternal);


    anim = function() {
        ctx.fillStyle = clearColor;
        ctx.shadowColor = clearColor;
        ctx.fillRect(0, 0, w, h);
        //mouse.move();

        for (var i=0; i<particles.length; ++i) {
            var p = particles[i];
            //console.log(i);
            p.draw(ctx);
            if (p.id != ETERNAL_ID)//最后一颗恒星不计算位移,不移动
            for (var k=0; k<calcTimes; ++k) {
                p.update(particles);
            }
            if (p.lifeStep==2) {
                var bomb = new Bomb(p.x, p.y, p.hue);
                bomb.pid = p.id;
                bomb.init();
                bombs.push(bomb);
                //console.log('BOMBED,p.id='+p.id);
                p.lifeStep = 3;
                refreshPad();
                //i--;
            }
        }
        for (var i in bombs) {
            var b = bombs[i];
            b.draw(ctx);
        }
        hue+=19;
        hue %= 16000000;
        //mouse.draw();
        //eternal.draw();
        //requestAnimationFrame(anim);
    }

    function refreshPad() {
        // 清理多余的particles
        for (var i=0; i<particles.length; ++i) {
            if (particles[i].lifeStep==3) {
                particles.splice(i, 1);
                --i;
            }
        }
        // 清理多余的爆炸碎屑
        for (var i=0; i<bombs.length; ++i) {
            if (bombs[i].lifetime>=bombs[i].maxLifetime) {
                bombs.splice(i, 1);
                --i;
            }
        }
        // 刷新面板
        document.getElementById('livedOrbCount').innerHTML = particles.length;
        if (enableCenter) {
            document.getElementById('centerMassShow').innerHTML = eternal.mass.toFixed(2);
        }
        //console.log('now='+particles.length+' b='+bombs.length);
    }

    //anim();


    $(function(){
        $('#zoom_up').on('click', function() {
            //var zoomVal = $('#zoom').val();
            zoomBase = zoomBase*zoomStep;
            zoomReduct = zoomReduct/zoomStep;
            $('#zoom').val(zoomBase);
        });
        $('#zoom_down').on('click', function() {
            //var zoomVal = $('#zoom').val();
            zoomBase = zoomBase/zoomStep;
            zoomReduct = zoomReduct*zoomStep;
            $('#zoom').val(zoomBase);
        });
    })

    setInterval(anim, 50);
    refreshPad();

}
