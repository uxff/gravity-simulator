/*
    天体
*/
function Orb() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    //this.ax = 0;
    //this.ay = 0;
    this.dir = Math.PI/2;
    this.mass = 5;
    this.lifeStep = 1;// 生命阶段: 1=正常运转 2=爆炸中 3=碎片 4=死亡
}
Orb.prototype = {
    init: function() {
        //this.x = random(w/4, w-w/4);//w/2-10.0;//
        //this.y = random(h/4, h-h/4);//0;//Math.random() > .5 ? -this.size : h + this.size;h/2;//
        this.vx = random(-0.02, 0.02);//(h/2+200)/(h/2-this.y)*0.00514;//0;//
        this.vy = random(-0.02, 0.02);//0;//0;//
        //this.mass = random(11, 88);
        this.size = 1;//Math.sqrt(this.mass)/5;//this.origSize = random(10, 100);
        this.hue = random(1, 16000000);//hue;
        //console.log('this.id='+this.id+' this.mass='+this.mass+' this.vx='+this.vx);
    },

    draw: function(ctx) {

        if (this.lifeStep==1) {

            ctx.strokeStyle = "hsla(" + this.hue + ", 90%, 50%, 1)";
            //ctx.shadowColor = "hsla(" + this.hue + ", 100%, 55%, 1)";
            //ctx.lineWidth = 2;
            ctx.beginPath();

            //var x = (this.x*1.0 + (this.x-w/2)*zoomBase), y = (this.y*1.0 + (this.y-h/2)*zoomBase);
            var x = (w/2.0 + (this.x-w/2)*zoomBase), y = (h/2.0 + (this.y-h/2)*zoomBase);
            //var x = this.x, y = this.y;
            ctx.arc(x, y, this.size, 0, Math.PI*2 , false); 
            //ctx.moveTo(x, y);
            //ctx.lineTo(x+this.vx, y+this.vy);
            //ctx.lineTo(w/2.0, h/2.0);

            ctx.closePath();
            ctx.stroke();
        }
    },

    update: function(particles) {
        // 小于1就碰撞了 爆炸
        
        var aAll = this.calcGravityAll(particles);
        //aAll.parseXY();

        //var a = this.calcGravity(eternal);
        //a.parseXY();
        //this.ax = aAll.ax*1.0+a.ax;
        //this.ay = aAll.ay*1.0+a.ay;
        //if (this.lifeStep==10) {
        //    this.lifeStep = 1;
        //}
        //else {
        //}
        if (this.lifeStep!=1) {
            //console.log(' id='+this.id+' after calc all g, this.lifeStep='+this.lifeStep);
        } else {
            //this.ax = aAll.ax;
            //this.ay = aAll.ay;

            this.vx += aAll.ax;
            this.vy += aAll.ay;

            this.x += this.vx;
            this.y += this.vy;
        }
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
        //g.dir = this.calcRelativePos(target);
        g.ax = force * (this.x - target.x) / dist;
        g.ay = force * (this.y - target.y) / dist;
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
            if (dist<1.0) {
                //console.log(dist);
                if (this.mass > target.mass) {
                    //console.log('BIG:'+this.mass+' id:'+this.id);
                    //console.log('TARGET is less mass , will bomb! id='+target.id+' crash on id='+this.id);
                    // 动量守恒定律:   m1v1+m2v2=m1v1ˊ+m2v2ˊ
                    // m1v1+m2v2 = m3v3; v3=(m1v1+m2v2)/m3
                    this.mass += target.mass;
                    //this.size += 0.5;
                    //console.log(' target '+target.id+' will be eaten by '+this.id+'! before bomb, this.vx='+this.vx+' target.vx='+target.vx +' monster.vx='+this.vx);
                    this.vx = (target.mass*target.vx+this.mass*this.vx)/this.mass;
                    this.vy = (target.mass*target.vy+this.mass*this.vy)/this.mass;
                    //target.vx = target.vy = 0;
                    //console.log(' after target '+target.id+' bomb, this.vx='+this.vx+' target.vx='+target.vx +' monster.vx='+this.vx);
                    // m1a1+m2a2 = m3a3 // 只有动量守恒定律似乎有疑问，碰撞后速度突然很快，研究中。。。
                    //this.ax -= target.ax;
                    //this.ay -= target.ay;
                    target.mass = 0;
                    target.lifeStep = 2;
                    //console.log('this('+this.id+') combined target('+target.id+')');
                } else {
                    //console.log('ME is less mass , will bomb! id='+this.id+' crash on id='+target.id);
                    target.mass += this.mass;
                    //target.size += 0.5;
                    //console.log(' this '+this.id+' will be eaten by '+target.id+'! before bomb, this.vx='+this.vx+' target.vx='+target.vx +' monster.vx='+target.vx);
                    target.vx = (target.mass*target.vx+this.mass*this.vx)/target.mass;
                    target.vy = (target.mass*target.vy+this.mass*this.vy)/target.mass;
                    //this.vx = this.vy = 0;
                    //console.log(' after this '+this.id+' bomb, this.vx='+this.vx+' target.vx='+target.vx +' monster.vx='+target.vx);
                    //target.ax -= this.ax;
                    //target.ay -= this.ay;
                    this.mass = 0;
                    this.lifeStep = 2;
                    //console.log('target('+target.id+') combined this('+this.id+')');
                }
            } else {
                var gtmp = this.calcGravity(target, dist);
                //gtmp.parseXY();
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
