class BlobAnimation{

  constructor(velocityX,velocityY,width,color,bgcolor){
    this.color = color
    this.bgcolor = bgcolor
    this.x = Math.random()*1000;
    this.y = Math.random()*1000;
    this.velocityX = velocityX || (Math.random() - 0.5)*10;
    this.velocityY = velocityY || (Math.random() - 0.5)*10;
    this.timer = window.setInterval(this.position.bind(this),1000/60);
    this.width = width || 350;
    this.offSetX = this.width * 2;
    this.offSetY = this.width * 2;
  }

  position(){
    if (this.x > (1000 - this.offSetX)){
      this.velocityY = -(this.velocityY);
    }

    if (this.x < (0 + this.offSetX)){
      this.velocityY = -(this.velocityY);
    }

    this.x = this.x + this.velocityY


    if (this.y > (1000 - this.offSetY)){
      this.velocityX = -(this.velocityX);
    }

    if (this.y < (0 + this.offSetY)){
      this.velocityX = -(this.velocityX);
    }

    this.y = this.y + this.velocityX

  }

  getFrame(ctx){
    // this.drawCircle(ctx,this.x,this.y,400)
    this.drawCircle(ctx,this.x-100,this.y,this.width+1000)
    this.drawCircle(ctx,this.x-400,this.y-500,this.width+1000)
  }

  drawCircle(ctx, x, y, width, color, blur){
    var grd=ctx.createRadialGradient(x+(width/2), y+(width/2) , (width/5), x+(width/2), y+(width/2) ,width/2);
    grd.addColorStop(0, this.color);
    grd.addColorStop(1, BGRGB);
    ctx.fillStyle=grd;
    ctx.fillRect(x,y,width,width);
  }

}
