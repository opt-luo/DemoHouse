export function clamp(v,min=null,max=null){
  if(min==null){
    min=0
    max=1
  }else if(max==null){
    max=min
    min=0
  }
  return Math.min(max,Math.max(min,v))
}
export function interpolate(v,min,max,f=null){
  if(f==null){
    f=(x)=>x
  }
  v=f(v)
  let delta=max-min
  return min+(v*delta)
}
export const easing={
  quad:{
    in:v => v*v,
    out:v => -1 * v * (v-2),
    inOut:v => {
      v /= 0.5
    	if (v < 1) return 0.5*v*v
    	v--
    	return -0.5 * (v*(v-2) - 1)
    }
  },
  cubic:{
    inOut:v => {
    	v /= 0.5
    	if (v < 1) return 0.5*v*v*v
    	v -= 2
    	return 0.5*(v*v*v + 2)
    }
  },
  sine:{
    inOut:v => -0.5 * (Math.cos(Math.PI*v) - 1),
  }
}
