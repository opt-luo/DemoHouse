import Component from './component'
import {loadImage} from './image-loader'
import createCanvas from './create-canvas'
import get from './ajax'
import * as Path from './path'
import {mult,sub,add,applyToAll} from './vector'
import {clamp,interpolate,easing} from './math2'
import TweenLite from 'gsap'
import hasClass from './has-class'

let arrayNum=v=>Array.from(Array(v))
let getScroll=()=>window.pageYOffset
let setCompositeOperation=(ctx, mode='source-over', fallback=null) => {
  ctx.globalCompositeOperation = mode
  let worked=(ctx.globalCompositeOperation == mode)
  if(!worked && fallback!=null)
    ctx.globalCompositeOperation=fallback
  return worked
}
let drawCanvasSlice=(ctx, img, slice, target)=>{
  let sliceScale={
    x:img.width/slice.width,
    y:img.height/slice.height,
  }
  let targetSize={
    width:target.width*sliceScale.x,
    height:target.height*sliceScale.y
  }
  let targetScale={
    x:targetSize.width/img.width,
    y:targetSize.height/img.height
  }

  ctx.drawImage(
    img,
    Math.round(-slice.x*targetScale.x),
    Math.round(-slice.y*targetScale.y),
    Math.round(targetSize.width),
    Math.round(targetSize.height)
  )
}

const CanvasMap=(props)=>{
  let object={
    ready:false,

    canvas:null,
    ctx:null,

    map:null,
    mapScale:1,
    mapScales:2,
    mapMaxScale:2.5,
    mapCache:null,
    mapBuffer:null,
    mapBufferCtx:null,
    mapBufferScale:0,
    mapBufferSize:{x:2048,y:2048},
    mapBufferMargin:400,
    mapBufferOffset:null,
    mapBufferLast:null,
    mapSVG:null,
    mapWidth:null,
    mapHeight:null,

    points:null,
    pointsPos:null,
    cameraPath:null,
    cameraBreakpoints:null,
    cameraSubdivisions:null,
    cameraSubdivisionSize:1,
    cameraLength:0,
    trailPath:null,
    trailPathData:null,
    trailBreakpoints:null,
    trailSubdivisions:null,
    trailSubdivisionSize:1,
    trailLength:0,

    labels:null,

    sections:null,
    sectionsBounds:null,
    sectionsIcons:null,
    imagesBounds:null,

    lastScroll:0,
    scrollAnim:null,

    textWidth:0,

    initialState(){
      return {
        sectionIndex:0,
        section:null,
        sectionBounds:{
          top:0,
          bottom:0,
          height:0,
        },
        cameraSegment:{
          start:0,
          end:0,
          length:0,
        },
        trailSegment:{
          start:0,
          end:0,
          length:0,
        },
        pos:0,
        width:0,
        height:0,
        zoom:1,
      }
    },
    defaultProps(){
      return {
        textContainer:null,
        mapSrc:null,

        trailColor:null,
        trailWidth:null,
        trailDash:[2,4],
        trailVisitedColor:'#8EC641',
        trailVisitedWidth:4,

        pointColor:null,
        pointRadius:null,

        pointFutureColor:'#ccc',
        pointPresentColor:null,
        pointPastColor:null,

        fontPastColor:'#666',
        fontPresentColor:'#000',
        fontFutureColor:'#aaa',
      }
    },
    get trailColor(){
      if(typeof this.props !='undefined')
        if(this.props.trailColor!=null) return this.props.trailColor
      if(this.trailPath==null) return '#ccc'
      return this.trailPath.getAttribute('stroke')
    },
    get trailWidth(){
      if(typeof this.props !='undefined')
        if(this.props.trailWidth!=null) return this.props.trailColor
      if(this.trailPath==null) return 2
      return parseFloat(this.trailPath.getAttribute('stroke-width') || 2)
    },
    init(){
      let width=window.innerWidth
      let height=window.innerHeight
      this.state={
        width,
        height,
      }

      this.canvas=createCanvas(width,height)
      this.canvas.style.position='absolute'
      this.canvas.style.top=0
      this.canvas.style.left=0
      this.ctx=this.canvas.getContext('2d',{alpha:false})
      this.ctx.fillStyle='#fff'
      this.ctx.fillRect(0,0,this.state.width,this.state.height)
      this.container.appendChild(this.canvas)

      this.calculateSections()
      Array.from(this.props.textContainer.querySelectorAll('img'))
        .forEach(img=>{
          img.addEventListener('load',(event)=>{
            this.calculateSections()
            this.renderMap()
          })
        })

      this.scrollAnim={value:0}

      get(this.props.mapSrc).then((response)=>{
        this.mapSVG=Array.from(
            new DOMParser()
              .parseFromString(response,'image/svg+xml')
              .childNodes
          ).filter(node=>{
            let tag=node.tagName
            if(typeof tag=='undefined') return false
            return tag.toLowerCase()=='svg'
          })[0]

        this.cameraPath=this.mapSVG.querySelector('#camera-path path')
        this.trailPath=this.mapSVG.querySelector('#trail-path path')

        this.points=Array.from(this.mapSVG.querySelectorAll('#points circle'))
          .map(point=>{
            let [x,y]=[
              parseFloat(point.getAttribute('cx')),
              parseFloat(point.getAttribute('cy'))
            ]
            return {
              x,y,
              length:Path.getLengthAtPoint(this.trailPath,{x,y}),
              label:(point.getAttribute('id') || '').replace(/_/g,' '),
              color:point.getAttribute('fill') || 'black',
              radius:parseFloat(point.getAttribute('r'))
            }
          })
          .sort((a,b)=>a.length-b.length)

        this.cameraSubdivisions=Path.subdividePath(this.cameraPath,this.cameraSubdivisionSize,true)
        this.cameraLength=Path.getLength(this.cameraPath)
        this.cameraBreakpoints=this.setupBreakpoints(this.cameraPath)

        this.trailSubdivisions=Path.subdividePath(this.trailPath,this.trailSubdivisionSize,true)
        this.trailBreakpoints=this.setupBreakpoints(this.trailPath)
        this.trailLength=Path.getLength(this.trailPath)

        loadImage(this.props.mapSrc).then((img)=>{
          this.mapWidth=img.width
          this.mapHeight=img.height
          // quick IE fix for #27
          if(this.mapHeight==0){
            this.mapWidth=2040
            this.mapHeight=1178
          }
          this.map=arrayNum(this.mapScales).map((v,i)=>{
            let scale=1+(((this.mapMaxScale-1)/(this.mapScales-1))*i)

            let map=createCanvas(this.mapWidth*scale,this.mapHeight*scale)
            let mapCtx=map.getContext('2d',{alpha:false})
            mapCtx.fillStyle='white'
            mapCtx.fillRect(0,0,this.mapWidth*scale,this.mapHeight*scale)
            mapCtx.drawImage(img,0,0,this.mapWidth*scale,this.mapHeight*scale)
            return {map,scale}
          })

          this.mapBuffer=createCanvas(1,1)
          this.mapBufferCtx=this.mapBuffer.getContext('2d',{alpha:false})
          this.updateMapBufferSize()
          this.mapBufferCtx.fillStyle='white'
          this.mapBufferCtx.fillRect(0,0,this.mapBufferSize.x,this.mapBufferSize.y)
          this.mapBufferOffset={x:0,y:0}
          this.mapBufferScale=this.mapScale

          this.ready=true
          document.addEventListener('scroll',this.onScroll.bind(this))
          this.onScroll()
        })
      })
      window.addEventListener('resize',this.onResize.bind(this))
    },
    setupBreakpoints(path){
      return this.points.map(point=>Path.getLengthAtPoint(path, point))
        .map((point,i)=>
          this.sections[i].getAttribute('data-stay')=='true'?[point,point]:[point]
        )
        .reduce((flattened,cur)=>flattened.concat(cur),[])
    },
    getMapBufferSize(){
      return {
        x:this.state.width+(this.mapBufferMargin*2),
        y:this.state.height+(this.mapBufferMargin*2)
      }
    },
    updateMapBufferSize(){
      this.mapBufferSize=this.getMapBufferSize()

      this.mapBuffer.setAttribute('width',this.mapBufferSize.x)
      this.mapBuffer.setAttribute('height',this.mapBufferSize.y)

      this.mapBufferLast={
        zoom:-1,
        pos:{x:-1,y:-1}
      }
    },
    calculateSections(){
      let scroll=getScroll()
      this.sections=Array.from(this.props.textContainer.querySelectorAll('.js-section'))
      this.sectionsBounds=this.sections.map(section=>{
        let bounds=section.getBoundingClientRect()
        return {
          top:bounds.top+scroll,
          bottom:bounds.bottom+scroll,
          left:bounds.left,
          right:bounds.right,
          height:bounds.height,
          width:bounds.width,
        }
      })
      this.sectionsIcons=this.sections.map(section=>{
        let icon=section.getAttribute('data-icon')
        if(icon!=null){
          let iconImg=document.createElement('img')
          iconImg.setAttribute('src',icon)
          return iconImg
        }
        return null
      })

      this.imagesBounds=this.sections.map(section=>
        Array.from(section.querySelectorAll('.js-image')).map(image=>{
          let bounds=image.getBoundingClientRect()
          return {
            top:bounds.top+scroll,
            bottom:bounds.bottom+scroll,
            left:bounds.left,
            right:bounds.right,
            height:bounds.height,
            mapPos:parseFloat(image.getAttribute('data-pos'))
          }
        })
      )
    },
    onScroll(){
      let scroll=getScroll()
      let t=0
      let d=Math.abs(scroll-this.lastScroll)
      d=Math.sqrt(clamp(d/10))
      this.lastScroll=scroll
      t=d*0.2
      TweenLite.to(this.scrollAnim,t,{
        value:scroll,
        onUpdate:()=>{
          this.updateScroll(this.scrollAnim.value)
        },
        onComplete:()=>{
          this.updateScroll(this.scrollAnim.value)
        }
      })
    },

    updateScroll(scroll){
      let sectionIndex=this.sectionsBounds.findIndex(
        (curSection,i,sections) => {
          let isLast=i==sections.length-1
          if(isLast) return true

          let nextSection=sections[i+1]
          let isBeforeNextTop=typeof nextSection!='undefined'?scroll<nextSection.top:false
          let isBeforeCurBottom=scroll<curSection.bottom
          return isBeforeCurBottom || isBeforeNextTop
        }
      )

      let sectionBounds=this.sectionsBounds[sectionIndex]
      let section=this.sections[sectionIndex]
      let pos=clamp((scroll-sectionBounds.top)/sectionBounds.height,0,1)

      let cameraSegment={
        start:this.cameraBreakpoints[sectionIndex],
        end:this.cameraBreakpoints[clamp(sectionIndex+1,this.cameraBreakpoints.length-1)]
      }
      cameraSegment.length=cameraSegment.end-cameraSegment.start

      let trailSegment={
        start:this.trailBreakpoints[sectionIndex],
        end:this.trailBreakpoints[clamp(sectionIndex+1,this.trailBreakpoints.length-1)]
      }
      trailSegment.length=trailSegment.end-trailSegment.start

      this.state={
        sectionIndex,
        section,
        sectionBounds,
        pos,
        cameraSegment,
        trailSegment,
      }
    },
    onResize(){
      this.state={
        width:window.innerWidth,
        height:window.innerHeight,
      }
      this.updateMapBufferSize()
      this.canvas.width=this.state.width
      this.canvas.height=this.state.height
      this.calculateSections()
      this.onScroll()
    },
    getZoom(){
      return this.getZoomAtPercent(this.state.pos)
    },
    drawMapBuffer(ctx,pos,zoom){
      ctx.fillStyle='white'
      ctx.fillRect(0,0,this.mapBufferSize.x,this.mapBufferSize.y)
      let mapIndex=0
      while(zoom>this.map[mapIndex].scale && mapIndex<this.map.length-1){
        mapIndex++
      }
      let map=this.map[mapIndex]

      let offset=sub(mult(pos,map.scale),this.mapBufferMargin)
      let scale=map.scale/zoom

      drawCanvasSlice(
        ctx, map.map,
        Object.assign({},offset,{width:this.mapBufferSize.x*scale, height:this.mapBufferSize.y*scale}),
        {x:0,y:0,width:this.mapBufferSize.x,height:this.mapBufferSize.y}
      )
      return {offset,scale,mapScale:map.scale}
    },
    getCameraPosAtPercent(percent){
      return Path.getPointAtPercent(
        this.cameraSubdivisions,
        percent
      )
    },
    getMapSliceAtPercent(percent){
      //quick fix bug #20
      if(isNaN(percent)) percent=1
      let cameraPos=this.getCameraPosAtPercent(percent)
      let zoom=this.getZoomAtPercent(percent)
      let [width,height]=[
        this.state.width/zoom,
        this.state.height/zoom
      ]
      let center={
        x:this.state.width>720?0.66:0.5,
        y:0.33
      }
      return {
        x:(cameraPos.x-(width*center.x)),
        y:(cameraPos.y-(height*center.y)),
        width,
        height,
        zoom,
        cameraPos
      }
    },
    getPosAtPercent(percent){
      return this.state.pos
    },
    getZoomAtPercent(percent){
      let sectionIndex = this.state.sectionIndex
      let pos = this.getPosAtPercent()

      let section = this.sections[sectionIndex]
      let nextSection = this.sections[clamp(sectionIndex+1,this.sections.length-1)]
      let lastSection = this.sections[clamp(sectionIndex-1,0,this.sections.length-1)]

      let getNumericAttr=(el,attr,def=1)=>{
        let v=el.getAttribute(attr)
        return (v==null)?def:parseFloat(v)
      }
      let getMiddleZoom=(section)=>getNumericAttr(section,'data-zoom-middle',getStartZoom(section))
      let getStartZoom=(section)=>getNumericAttr(section,'data-zoom-start',1)

      let zoom1 = pos<=0.5?getStartZoom(section):getMiddleZoom(section)
      let zoom2 = pos<=0.5?getMiddleZoom(section):getStartZoom(nextSection)

      return interpolate(
        pos==1?1:((pos/0.5)-Math.floor(pos/0.5)),
        zoom1,
        zoom2,
        easing.cubic.inOut
      )
    },
    renderMap(){
      if(!this.ready) return

      let drawImagePointer=(image)=>{
        let scroll=getScroll()

        let imageMapPos=Path.getPointAtPercent(
          this.trailSubdivisions,
          interpolate(
            image.mapPos,
            trailSegment.start,
            trailSegment.end
          )/this.trailLength
        )

        let halfWindowHeight=window.innerHeight/2
        let falloff=halfWindowHeight*1.2
        let imageMiddle=image.top+(image.height/2)-scroll
        let imageVisibility=(
          falloff-Math.abs(halfWindowHeight-imageMiddle)
        )/falloff

        imageVisibility=easing.quad.out(clamp(imageVisibility))

        if(imageVisibility<=0) return

        let origin=canvasPos(imageMapPos)
        origin={
          x:origin[0],
          y:origin[1]
        }

        let transformCoords=(x,y)=>[x,y]
        let drawTriangle=(corner1,corner2)=>{
          corner1=transformCoords(...corner1)
          corner2=transformCoords(...corner2)

          let getAngle=(x,y)=>
            Math.atan2(y-origin.y,x-origin.x)

          const PI=Math.PI
          const PI2=PI*2
          let angle1=getAngle(...corner1)+PI2
          let angle2=getAngle(...corner2)+PI2
          let angleDelta=Math.atan2(Math.sin(angle1-angle2), Math.cos(angle1-angle2))
          let angleMiddle=angle1-(angleDelta/2)

          let radius=2*imageVisibility

          let angleOrigin=angleMiddle+(PI/2)
          let originOffset={
            x:(radius+1)*Math.cos(angleOrigin),
            y:(radius+1)*Math.sin(angleOrigin)
          }
          let colorValue=imageVisibility*0.3
          this.ctx.fillStyle=`rgba(220,220,202,${colorValue})`
          setCompositeOperation(this.ctx,'darken','source-over')

          this.ctx.beginPath()
          this.ctx.moveTo(
            origin.x+originOffset.x,
            origin.y+originOffset.y
          )
          this.ctx.lineTo(...corner1)
          this.ctx.lineTo(...corner2)
          this.ctx.lineTo(
            origin.x-originOffset.x,
            origin.y-originOffset.y
          )

          this.ctx.lineWidth=5*imageVisibility
          this.ctx.arc(origin.x,origin.y,radius,angleOrigin+PI,angleOrigin)
          this.ctx.fill()

          this.ctx.beginPath()
          this.ctx.arc(origin.x,origin.y,radius,angleOrigin,angleOrigin+PI2)
          //this.ctx.strokeStyle=`#aaa`
          // this.ctx.stroke()
          this.ctx.fill()
          setCompositeOperation(this.ctx)

          this.ctx.fillStyle=`#405b54`
          let imagePointRadius=4*imageVisibility
          this.ctx.beginPath()
          this.ctx.arc(origin.x,origin.y,imagePointRadius,0,PI2)
          this.ctx.fill()
        }

        let corner1=[
          image.top-scroll<origin.y?image.right:image.left,
          image.top-scroll
        ]
        let corner2=[
          image.bottom-scroll<origin.y?image.left:image.right,
          image.right<origin.x?image.bottom-scroll:image.top-scroll
        ]

        drawTriangle(
          corner1,
          corner2
        )

      }

      let drawImagePointers=()=>{
        this.imagesBounds[this.state.sectionIndex].forEach(drawImagePointer)
      }

      let drawSubdividedPath=(path,interval=1,end=-1)=>{
        this.ctx.beginPath()
        this.ctx.moveTo(...canvasPos(path[0]))
        let brokenPath=false
        for (let i = 1; i < (end==-1?path.length:clamp(end,path.length)); i+=interval) {
          let f=brokenPath?this.ctx.moveTo:this.ctx.lineTo
          let p=canvasPos(path[i])
          if(p[0]>=0 && p[1]>=0 && p[0]<this.state.width && p[1]<this.state.height){
            brokenPath=false
            f.call(this.ctx,...p)
          }else{
            brokenPath=true
          }
        }
        this.ctx.stroke()
      }

      let drawTrail=()=>{
        this.ctx.lineWidth=this.trailWidth
        this.ctx.strokeStyle=this.trailColor
        this.ctx.lineCap='round'
        this.ctx.setLineDash(this.props.trailDash)
        drawSubdividedPath(this.trailSubdivisions,4)

        this.ctx.lineWidth=this.props.trailVisitedWidth
        this.ctx.setLineDash([])
        this.ctx.strokeStyle=this.props.trailVisitedColor
        this.ctx.lineCap='butt'
        drawSubdividedPath(this.trailSubdivisions,2,trailTipIndex)
      }

      let isVisited=(point)=>trailPos>=point.length

      // sets a value if the point has been visited, is being visited, or hasnt been visited yet
      let setByStatus=(i,past,present,future=null)=>{
        if(future==null) future=past
        let point=this.points[i]
        let nextPoint=this.points[i+1] || null
        if(!isVisited(point)) return future
        if(nextPoint==null) return present
        if(isVisited(nextPoint)) return past
        return present
      }

      let drawPoint=(point,i)=>{
        this.ctx.fillStyle=setByStatus(i,
          this.props.pointPastColor || point.color,
          this.props.pointPresentColor || point.color,
          this.props.pointFutureColor
        )
        this.ctx.beginPath()
        this.ctx.arc(
          ...canvasPos(point),
          (this.props.pointRadius || point.radius),
          0,2*Math.PI
        )
        this.ctx.fill()
      }

      let drawPoints=()=>
        this.points.forEach(drawPoint)

      let drawLabel=(point,i)=>{
        let fontSize=15
        this.ctx.font=`${setByStatus(i,'normal','bold')} ${(setByStatus(i,fontSize,fontSize*1.2))}px Arial`
        this.ctx.textAlign='left'
        this.ctx.textBaseline='middle'
        this.ctx.fillStyle=setByStatus(i,
          this.props.fontPastColor,
          this.props.fontPresentColor,
          this.props.fontFutureColor
        )
        this.ctx.strokeStyle='#FDFCEC'
        this.ctx.lineWidth=6
        let pos=add(point,{x:20*inverseZoom,y:0})
        this.ctx.strokeText(point.label,...canvasPos(pos))
        this.ctx.fillText(point.label,...canvasPos(pos))
      }

      let drawLabels=()=>
        this.points.forEach(drawLabel)

      let drawIcon=()=>{
        if(icon==null) return

        let iconCenter={
          x:icon.width/2,
          y:icon.height/2
        }
        let angle=Math.atan2(
          trailTip.y-trailTip2.y,
          trailTip.x-trailTip2.x
        )
        this.ctx.save()
        this.ctx.translate(
          ...canvasPos(trailTip.x,trailTip.y)
        )
        this.ctx.rotate(angle)
        let p=pos*1.2
        let scale=clamp(p<0.5?interpolate(p*2,0,1,easing.quad.out):interpolate((p*2)-1,1,0,easing.quad.in))
        scale*=0.7
        this.ctx.scale(scale,scale)
        this.ctx.drawImage(icon,
          -iconCenter.x,
          -iconCenter.y
        )
        this.ctx.restore()
      }
      let checkForBufferUpdate=()=>{
        let zoomDelta=Math.abs(zoom-this.mapBufferLast.zoom)
        let dx=Math.abs(mapSlice.x-this.mapBufferLast.pos.x)
        let dy=Math.abs(mapSlice.y-this.mapBufferLast.pos.y)
        let mapIndex=0
        while(zoom>this.map[mapIndex].scale && mapIndex<this.map.length-1){
          mapIndex++
        }
        let optimalScale=this.map[mapIndex].scale


        if(dx < this.mapBufferMargin/3 && dy < this.mapBufferMargin/3 && zoomDelta<1 && !(zoom==optimalScale && this.mapBufferLast.zoom!=optimalScale)) return

        this.mapBufferLast={
          zoom,
          pos: {x:mapSlice.x, y:mapSlice.y}
        }
        updateMapBuffer()
      }

      let updatedBufferThisFrame=false
      let updateMapBuffer=()=>{
        updatedBufferThisFrame=true
        let buffer=this.drawMapBuffer(this.mapBufferCtx,mapSlice,zoom)
        this.mapBufferScale=buffer.scale
        this.mapBufferOffset=buffer.offset
        this.mapScale=buffer.mapScale
      }
      let drawMap=()=>{
        checkForBufferUpdate()

        if(!updatedBufferThisFrame){
          let slice={
            x:((mapSlice.x*this.mapScale)-this.mapBufferOffset.x)/this.mapBufferScale,
            y:((mapSlice.y*this.mapScale)-this.mapBufferOffset.y)/this.mapBufferScale,
            width:(mapSlice.width*this.mapScale)/this.mapBufferScale,
            height:(mapSlice.height*this.mapScale)/this.mapBufferScale
          }
          let target={
            x:0,y:0,
            width:this.state.width,
            height:this.state.height,
          }
          drawCanvasSlice(
            this.ctx,
            this.mapBuffer,
            slice,
            target
          )
        }else{
          this.ctx.drawImage(this.mapBuffer,Math.round(-this.mapBufferMargin/this.mapBufferScale),Math.round(-this.mapBufferMargin/this.mapBufferScale))
        }
      }

      let localToGlobal=(v)=>
        mult(sub(v,cameraPos),zoom)

      let cameraPath = this.cameraPath
      let pos = this.state.pos
      let section = this.state.section
      let sectionIndex = this.state.sectionIndex
      let cameraSegment = this.state.cameraSegment
      let trailSegment = this.state.trailSegment

      let trailPos = interpolate(
        pos,
        trailSegment.start,
        trailSegment.end,
        (v)=>clamp(v*1.2)
      )
      let trailTipIndex=Math.round(trailPos/this.trailSubdivisionSize)
      let trailTip=this.trailSubdivisions[clamp(trailTipIndex,this.trailSubdivisions.length-1)]
      let trailTip2=this.trailSubdivisions[clamp(trailTipIndex-1,this.trailSubdivisions.length-1)]
      let icon=this.sectionsIcons[sectionIndex]



      let mapSlice=this.getMapSliceAtPercent(
        interpolate(pos,cameraSegment.start,cameraSegment.end)/this.cameraLength
      )
      let zoom=mapSlice.zoom
      let inverseZoom=1/zoom
      let cameraPos=mapSlice.cameraPos

      let dpi=1//window.devicePixelRatio

      let canvasPos=(x,y)=>typeof x=='object'?
        canvasPos(x.x,x.y):[
          (x-mapSlice.x)*zoom,
          (y-mapSlice.y)*zoom
        ]

      // Clear canvas
      // this.ctx.clearRect(0,0,this.canvas.width*dpi,this.canvas.height*dpi)
      this.ctx.fillStyle='#fff'
      this.ctx.fillRect(0,0,this.canvas.width*dpi,this.canvas.height*dpi)

      drawMap()
      drawTrail()
      drawIcon()
      drawPoints()
      drawLabels()
      drawImagePointers()

      //this.ctx.restore()

      let blendWorks=setCompositeOperation(this.ctx,'screen')

      let gradient=this.ctx.createLinearGradient(this.sectionsBounds[0].right,0,this.sectionsBounds[0].right+200,0)
      if(blendWorks){
        gradient.addColorStop(0,'rgba(185, 217, 151, 1)')
        gradient.addColorStop(1,"rgba(185, 217, 151, 0)")
      }else{
        gradient.addColorStop(0,'rgba(255, 255, 255, 0.85)')
        gradient.addColorStop(1,"rgba(255, 255, 255, 0)")
      }
      this.ctx.fillStyle=gradient

      // this.ctx.fillStyle='rgba(185, 217, 151, 1)'

      this.ctx.fillRect(0,0,this.sectionsBounds[0].right+200,this.state.height)

      if(blendWorks)
        setCompositeOperation(this.ctx)
    },
    render(){
      this.renderMap()
    }
  }

  return Object.assign(
    Component(props),
    object
  )
}

export default CanvasMap
