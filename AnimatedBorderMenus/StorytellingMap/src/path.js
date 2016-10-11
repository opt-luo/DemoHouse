import {sub} from "./vector"
import {clamp} from "./math2"

export function getPointAtLength(path,length){
  let p=path.getPointAtLength(length)
  return {x:p.x, y:p.y}
}
export function getLength(path){
  return path.getTotalLength()
}
export function getPointAtPercent(path,percent){
  if(Array.isArray(path))
    return path[Math.round(clamp(percent)*(path.length-1))]

  return getPointAtLength(path,percent*getLength(path))
}
function distance(pointA,pointB){
  let d=sub(pointA,pointB)
  return Math.sqrt((d.x*d.x)+(d.y*d.y))
}
export function getLengthAtPoint(path,point,subdivisionsPerIteration=10,iterations=5){
  let pathLength=getLength(path)

  return (function iterate(lower,upper){
    let delta=upper-lower
    let step=delta/(subdivisionsPerIteration-1)

    let subdivisions=Array.from(Array(subdivisionsPerIteration))
      .map((v,i)=>{
        let subLength=lower+(step*i)
        let subPoint=getPointAtLength(path,subLength)
        let subDistance=distance(point,subPoint)
        return {
          length:subLength,
          point:subPoint,
          distance:subDistance,
        }
      })
      .sort((a,b)=>a.distance-b.distance)
      .map(v=>v.length)
      .slice(0,2)

    if(!--iterations) return subdivisions[0]

    return iterate(...subdivisions.sort((a,b)=>a-b))
  }(0,pathLength))
}
export function subdividePath(path,subdivisions,subdivideByDistance=false){
  let length=getLength(path)

  if(subdivideByDistance) subdivisions=length/subdivisions

  let subdivisionLength=length/subdivisions
  return Array.from(Array(Math.floor(subdivisions)))
    .map((cur,i)=>getPointAtLength(path,i*subdivisionLength))
}
