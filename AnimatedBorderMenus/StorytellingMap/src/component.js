const isFunction=v=>typeof v == 'function'
const callIfFunction=(thisObj,f,ifNot=undefined) =>{
  if(isFunction(f))
    return f.call(thisObj)
  else if(isFunction(ifNot))
    return ifNot.call(thisObj)
  else
    return ifNot
}

const Component=(props=null)=>{
  const object={
    _state:null,
    _props:null,
    _setProps:null,
    _hasToRender:false,
    _container:null,
    get hasToRender(){
      return this._hasToRender
    },
    set hasToRender(value){
      if(value==this._hasToRender) return
      this._hasToRender=value

      if(value) requestAnimationFrame(this.startRendering.bind(this))
    },

    get state(){
      if(this._state==null)
        this._state=callIfFunction(this,this.initialState,{})

      return this._state
    },
    set state(value){
      //TODO: diff to test if it should render
      let newState=Object.assign({},this.state,value)
      this._state=newState
      this.hasToRender=true
      Object.keys(value).forEach(key=>callIfFunction(this,'onState'+key.substr(0,1).toUpperCase()+key.substr(1)))
    },

    get props(){
      if(this._props==null)
        this._props=callIfFunction(this,this.defaultProps,{})

      if(this._setProps!=null)
        this._props=Object.assign({},this._props,this._setProps)

      return this._props
    },

    set props(value){
      //TODO: diff to test if it should render
      let newProps=Object.assign({},this.props,value)
      this._props=newProps
      this.hasToRender=true
    },

    get container(){
      return this._container
    },

    appendTo(element){
      if(typeof element=='string')
        element=document.querySelector(element)

      this._container=element

      callIfFunction(this,this.init)

      return this
    },

    startRendering(){
      if(!this.hasToRender) return
      callIfFunction(this,this.render)
      this.hasToRender=false
    },

  }

  object._setProps=props

  return object
}

export default Component
