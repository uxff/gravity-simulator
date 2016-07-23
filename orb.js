/*
    天体
*/
function Orb() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.dir = Math.PI/2;
    //this.oldx = 0;
    //this.oldy = 0;
    //this.stepx = 0;
    //this.stepy = 0;
    this.mass = 5;
    this.lifeStep = 1;// 生命阶段: 1=正常运转 2=爆炸中 3=碎片 4=死亡
}
Orb.prototype = {
    init: function() {
        this.size = 0.5;//this.origSize = random(10, 100);
        this.x = random(500, w-500);//w/2-10.0;//
        this.y = random(200, h-200);//0;//Math.random() > .5 ? -this.size : h + this.size;
        this.vx = 0;//random(-0.02, 0.02);//(h/2+200)/(h/2-this.y)*0.00514;//
        this.vy = 0;//random(-0.02, 0.02);//0;//
        this.mass = random(11, 418);
        this.hue = random(1, 16000000);//hue;
        //this.oldx = 0;
        //this.oldy = 0;
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

    update: function(particles) {
        // 小于1就碰撞了 爆炸
        //if (dist>1)//(!this.checkBorder(w, h))
        //this.oldx = this.x;
        //this.oldy = this.y;
        
        var aAll = this.calcGravityAll(particles);
        //aAll.parseXY();

        //var a = this.calcGravity(eternal);
        //a.parseXY();
        //this.ax = aAll.ax*1.0+a.ax;
        //this.ay = aAll.ay*1.0+a.ay;
        //if (this.lifeStep==10) {
        //    this.lifeStep = 1;
        //}
        //else
        this.ax = aAll.ax;
        this.ay = aAll.ay;

        this.vx += this.ax;
        this.vy += this.ay;

        this.x += this.vx;
        this.y += this.vy;
        
        //this.stepx = this.x - this.oldx;
        //this.stepy = this.y - this.oldy;
        
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
    calcGravityAll: function(particles) {
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
                    // 动量守恒定律:   m1v1+m2v2=m1v1ˊ+m2v2ˊ
                    // m1v1+m2v2 = m3v3; v3=(m1v1+m2v2)/m3
                    this.mass += target.mass;
                    this.vx = (target.mass*target.vx+this.mass*this.vx)/this.mass;
                    this.vy = (target.mass*target.vy+this.mass*this.vy)/this.mass;
                    // m1a1+m2a2 = m3a3
                    //this.ax -= target.ax;
                    //this.ay -= target.ay;
                    //target.mass = 0;
                    target.lifeStep = 2;
                    //this.lifeStep = 10;
                } else {
                    //console.log('ME is less mass , will bomb! id='+this.id+' crash on id='+target.id);
                    target.mass += this.mass;
                    target.vx = (target.mass*target.vx+this.mass*this.vx)/target.mass;
                    target.vy = (target.mass*target.vy+this.mass*this.vy)/target.mass;
                    //target.ax -= this.ax;
                    //target.ay -= this.ay;
                    //this.mass = 0;
                    this.lifeStep = 2;
                    //target.lifeStep = 10;
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
