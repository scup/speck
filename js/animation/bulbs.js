(function(){


  var params = {
    mouseX : 0,
    mouseY : 0,
    width : 1,
    pulse : 7,
    frequency : 0
  }
  TweenMax.to(params, 1 , {width:4, repeat:-1, yoyo:true, ease:Power1.easeInOut});
  // TweenMax.to(params, 1, {pulse:6, repeat:-1, yoyo:true, ease:Power1.easeInOut});

  class Column{
    constructor(angle,length,index){
      this.angle = angle + 45;
      this.length = length = length + 20
      this.step = this.getSteps(this.angle)
      this.index = index;
      this.bulbs = [];
      this.draw()

      this.oscilation = oscilate(5,10)(this.index) || 6;

      this.distance = -Math.random()*2
      TweenMax.to(this, 3, {distance:this.oscilation+Math.random()*2, delay : Math.random(), repeat:-1, yoyo:true, ease:Power1.easeInOut});

    }

    draw(){
      var i = 20
      while(i<this.length){
        var x = - i * params.pulse * this.step.x;
        var y = - i * params.pulse * this.step.y;
        this.bulbs.push(new Bulb(0, 0,this.index,i, this.step))
        i++
      }
    }

    getFrame(ctx){
      this.bulbs.forEach(function(bulb,i){

        bulb.render(ctx, this.distance, this.step)

      }.bind(this))
    }
    getSteps(angle){
      var cos = Math.cos(Math.PI * angle / 180.0)
      var sin = Math.sin(Math.PI * angle / 180.0)

      return {
          x: cos - sin,
          y: sin + cos
      }
    }

  }



  class Bulb{
    constructor(x,y,columnI,I){
      this.x = x
      this.y = y
      this.I = I
      this.columnI = columnI
      this.params = {}
      this.params.width = 1
      this.factor = Math.random()
    }
    render(ctx, distance, step){

      var distance = ((8 + distance/10) * (this.I+40));

      var x = - distance * step.x;
      var y = - distance * step.y;

      this.x = window.innerHeight + 630 + x
      this.y = window.innerHeight + 795 + y

      ctx.fillStyle = '#ffffff';

      ctx.beginPath();

      ctx.arc(
        this.x,

        this.y,

        (params.width * this.factor * this.I/100) + 1,

        0,2*Math.PI);

      ctx.fill();
    }
  }




  class Grid{
    constructor(columns){
      this.columns = 70;
      this.angle = 1;
      this.draw();
      this.centerX = 500
    }

    draw(){
      var x = 0;
      var half = this.columns/2
      var angle;
      var centerX = this.columns * 5 / 2;
      while(x < this.columns){

        if (x <= parseInt(half) && Math.abs(half - x) !== 0){
          angle = -Math.abs(half - x)
        }else{
          angle = Math.abs((half - x))
        }

        stage.add(new Column((angle-20)*this.angle,40,x));

        x++
      }
    }
  }




function getOscilateValue(offset, value){
  var co =  parseInt(value / offset);

  if (co % 2 === 0){
      return value % offset;
  }
  return offset - (value % offset);
}

function oscilate(min,max){
  var matrix = new Array(max-min);
  matrix = matrix.fill(0).map(function(_,i){ return i + min } );
  // console.log(matrix)

    function resolve(value){
      var co =  parseInt(value / matrix.length);

      if (co % 2 === 0){
          return matrix[value % matrix.length];
      }
      return matrix[matrix.length - (value % matrix.length)];
    }

    return function(indexes){
      if (Array.isArray(indexes))
        return indexes.map(resolve);
      return resolve(indexes);

    }
}

(new Grid())

})()
