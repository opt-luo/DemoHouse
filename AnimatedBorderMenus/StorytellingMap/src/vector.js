function objNum(op,obj,num){
  return Object.assign({},
    ...Object.keys(obj).map((i)=>{
      let r={}
      r[i]=op(obj[i],num)
      return r
    })
  )
}
function objObj(op,objA,objB){
  let [keysA,keysB] = [Object.keys(objA), Object.keys(objB)]

  return Object.assign({},
    ...keysA.map((i)=>{
      let r={}
      r[i]=op(objA[i],objB[i])
      return r
    })
  )
}

const ops={
  add : (a,b) => a+b,
  sub : (a,b) => a-b,
  mult : (a,b) => a*b,
  div : (a,b) => a/b,
}

function doOpOn(op,a,b){
  if(typeof a == typeof b){
    if(typeof a == "number") return op(a,b)
    if(typeof a == "object") return objObj(op,a,b)
  }else{
    if(typeof a == "object") return objNum(op,a,b)
  }
}

export function applyToAll(f,obj){
  let newObj=Object.assign({},obj)
  for(let i in newObj){
    newObj[i]=f(newObj[i])
  }
  return newObj
}
export function mult(a,b){
  return doOpOn(ops.mult,a,b)
}
export function sub(a,b){
  return doOpOn(ops.sub,a,b)
}
export function add(a,b){
  return doOpOn(ops.add,a,b)
}
export function div(a,b){
  return doOpOn(ops.div,a,b)
}
