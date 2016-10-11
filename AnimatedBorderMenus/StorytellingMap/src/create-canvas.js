export default function createCanvas(width,height,dpiAware=false){
  let canvas=document.createElement("canvas");
  let multiplier=1
  if(dpiAware){
    multiplier=window.devicePixelRatio
    canvas.style.width=`${width}px`
    canvas.style.height=`${height}px`
  }
  canvas.width=width*multiplier;
  canvas.height=height*multiplier;
  return canvas;
}
