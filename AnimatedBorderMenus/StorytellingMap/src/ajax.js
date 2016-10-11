
export default function get(url){
  return new Promise((resolve,reject)=>{
    var ajax=new XMLHttpRequest()
    ajax.open('GET',url)
    ajax.onload=(event)=>{
      if(ajax.status==200){
        resolve(ajax.response)
      }else{
        reject(ajax)
      }
    }
    ajax.send()
  })
}
