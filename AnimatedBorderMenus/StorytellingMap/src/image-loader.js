export function loadImage(src){
  return new Promise((resolve,reject)=>{
    let img=new Image();
    img.addEventListener("load",(event)=>{
      resolve(img);
    });
    img.src=src;
  })
}
