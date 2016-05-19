/*
    加速度
*/
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
