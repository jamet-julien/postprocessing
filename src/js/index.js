import { createRender} from './postProcessing.js';

const canvas     = document.getElementById("space_deux"),
       context2d = canvas.getContext('2d');

canvas.width  = 800;
canvas.height = 600;


let pos = {
  x : 0,
  y : 0
}

function draw(){
  context2d.clearRect( 0, 0, canvas.width, canvas.height);

  pos.x = ( pos.x +1)% canvas.width;
  pos.y = ( pos.y +1)% canvas.height;

  context2d.fillStyle = "#000";
  context2d.fillRect( pos.x,  pos.y, 100, 100);

  context2d.drawImage(
      render.draw(),
      0, 0,
      canvas.width, canvas.height
  );

  requestAnimationFrame( draw);
}




let render;

async function init(){

  render = await createRender( canvas, {
    vertexShader   : './src/glsl/vertexShader.glsl',
    fragmentShader : './src/glsl/fragmentShader.glsl'
  });

  draw(0);
}


init();
