var random = function(min, max) {
    return Math.random() * (max - min) + min
}

var distance = function (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

var w;//= c.width = window.innerWidth;
var h;//= c.height = window.innerHeight;
var ctx;// = c.getContext("2d");
var zoomBase = 1.0, zoomStep = Math.sqrt(2.0);// = document.getElementById('zoom').value;
var particles = [], eternal, ETERNAL_ID;
var bombs = [];
var anim, refreshPad, initOrbs, updateOrbs;
var timesCalced = 0, cps = 0, startTimestamp = 0, nowTimestamp = 1, calcStep = 0;//1.414213562373;
//var , 

var hue = Math.random()*100+20;
// 万有引力系数 G 决定引力大小
var G = 0.0000021;
//G = 0.1;

var clearColor = "rgba(15, 15, 15, .2)";
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


window.onload = function () {
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	document.getElementById('constOfG').innerHTML = G;

    let c = document.getElementById("canvas-club");
    w= c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.fillStyle = clearColor;
    ctx.shadowColor = clearColor;
    zoomBase = document.getElementById('zoom').value;
    startTimestamp = new Date().getTime();//当前毫秒时间戳
    //console.log(urlParam.get('enableCenter', 'ori'));
    //console.log(enableCenter);

    window.addEventListener("resize", function() {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
    });

    initOrbs = function(num) {
        particles = [];
        for (let i = 1; i <= num; i++) {
            //setTimeout(function() {
                let p = new Orb();
                p.id = particles.length;
                p.init();
                p.mass = random(orbMinMass, orbMaxMass);
                tangle = i*Math.PI/num*2.0;
                switch (arrangeType) {
                    case 2:
                        p.vx =  Math.sin(tangle) * orbMaxVelo;
                        p.vy = -Math.cos(tangle) * orbMaxVelo;
                        p.x = Math.cos(tangle) * 300.0 + w/2.0;
                        p.y = Math.sin(tangle) * 300.0 + h/2.0;
                        break;
                    default:
                        let tdir = Math.random()*2.0*Math.PI, trandom = Math.random();
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
    }

    updateOrbs = function(nTimes) {
        nTimes = nTimes || calcTimes;
        
        for (let k=0; k<nTimes; ++k) {
            for (let i=0; i<particles.length-1; ++i) {
                let p = particles[i];
                //console.log(i);
                //if (p.id != ETERNAL_ID) {
                    //最后一颗恒星不计算位移,不移动
                    p.update(particles);
                //}
            }
            timesCalced += particles.length * particles.length;
        }
    }

    anim = function() {
        ++calcStep;
        updateOrbs(calcTimes);

        ctx.fillRect(0, 0, w, h);
        //ctx.lineWidth = 1;
        //ctx.beginPath();
        
        //mouse.move();

        for (let i in particles) {
            let p = particles[i];
            p.draw(ctx);
            if (p.lifeStep==2) {
                let bomb = new Bomb(p.x, p.y, p.hue);
                bomb.pid = p.id;
                bomb.init();
                bombs.push(bomb);
                //console.log('BOMBED,p.id='+p.id);
                p.lifeStep = 3;
                //i--;
                refreshPad();
            }
        }
        //ctx.closePath();
        //ctx.stroke();
        
        for (let i in bombs) {
            let b = bombs[i];
            b.draw(ctx);
        }
        //ctx.closePath();
        //ctx.stroke();

        //console.log(nTimes+' times done.');
        //refreshPad();
        hue+=29;
        hue %= 16000000;
        //mouse.draw();
        //eternal.draw();
        //requestAnimationFrame(anim);
        if (calcStep %20 == 19) {
            // 计算cps
            nowTimestamp = new Date().getTime();
            let timeUsed = nowTimestamp - startTimestamp;
            cps =  timesCalced/ (timeUsed/1000.0);
            document.getElementById('cps').innerHTML = cps.toFixed(2);

            timesCalced = 0;
            startTimestamp = nowTimestamp-1;
			
        }
    }

    refreshPad = function() {
        // 清理多余的particles
        for (let i=0; i<particles.length; ++i) {
            if (particles[i].lifeStep==3) {
                particles.splice(i, 1);
                --i;
            }
        }
        // 清理多余的爆炸碎屑
        for (let i=0; i<bombs.length; ++i) {
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
            
        // 计算完之后清楚
        //console.log('now='+particles.length+' b='+bombs.length);
        requestAnimationFrame(refreshPad);
    }

    //anim();


    $(function(){
        $('#zoom_up').on('click', function() {
            zoomBase = zoomBase*zoomStep;
            $('#zoom').val(zoomBase);
        });
        $('#zoom_down').on('click', function() {
            zoomBase = zoomBase/zoomStep;
            $('#zoom').val(zoomBase);
        });
    })


    initOrbs(maxParticles);
    refreshPad();
    //setTimeout('updateOrbs(calcTimes*100000000)', 100);
    setInterval('anim()', 50);

}
