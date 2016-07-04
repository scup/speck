(function(){


var canvas = document.querySelector('#bg')
window.addEventListener('resize',function(){
  canvas.setAttribute('width',window.innerWidth)
  canvas.setAttribute('height',window.innerHeight)
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})
canvas.setAttribute('width',window.innerWidth)
canvas.setAttribute('height',window.innerHeight)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

stage = new Stage(canvas);




  class Background{
    getFrame(ctx){
      ctx.fillStyle = BGCOLOR;
      ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
    }
  }

  var bg = new Background();
  var blobAnimation = new BlobAnimation(false, false, 300, FGCOLOR, BGCOLOR);


  stage.add(bg);
  stage.add(blobAnimation);

})()
