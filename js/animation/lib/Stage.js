class Stage{
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.height = this.canvas.height;
    this.ctx.width = this.canvas.width;
    this.renderingPipeline = [];

    window.requestAnimationFrame(this.render.bind(this));
  }

  add(animation){
    this.renderingPipeline.push(animation)
  }

  render(){
    this.renderingPipeline.forEach(function(animation){
      animation.getFrame(this.ctx)
    }.bind(this))
    window.requestAnimationFrame(this.render.bind(this))
  }
}
