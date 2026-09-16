// Learned per-vertex SH convention follows the official MeshSplatting renderer.
// Upstream notices are preserved in LICENSE-MeshSplatting.md and LICENSE-GS.md.
import * as T from 'three';
export async function loadModel(scene,renderer,camera,progress){
 const response=await fetch('./model.json');if(!response.ok)throw new Error(`모델 정보 HTTP ${response.status}`);
 const meta=await response.json();let received=0;const total=Object.values(meta.files).flatMap(f=>f.chunks).reduce((s,c)=>s+c.bytes,0);
 async function read(name){const entry=meta.files[name],data=new Uint8Array(entry.bytes);let offset=0;
  for(const chunk of entry.chunks){const r=await fetch('./'+chunk.file);if(!r.ok)throw new Error(`${chunk.file}: HTTP ${r.status}`);const reader=r.body.getReader(),parts=[];for(;;){const {value,done}=await reader.read();if(done)break;parts.push(value);received+=value.length;progress.textContent=`MeshSplatting ${Math.min(100,Math.round(received/total*100))}%`;}
   const raw=new Uint8Array(await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());data.set(raw,offset);offset+=raw.length;}
  if(offset!==entry.bytes)throw new Error('모델 파일 길이가 일치하지 않습니다.');return data.buffer;}
 const positions=new Float32Array(await read('positions')),indices=new Uint32Array(await read('triangles')),sh=new Float32Array(await read('sh'));
 progress.textContent='MeshSplatting 화면을 준비하고 있어요…';
 const width=Math.min(8192,renderer.capabilities.maxTextureSize),height=Math.ceil(meta.vertices*16/width);
 if(height>renderer.capabilities.maxTextureSize)throw new Error('이 장치의 텍스처 크기로 메시 색상을 표시할 수 없습니다.');
 const rgba=new Float32Array(width*height*4);for(let i=0;i<sh.length/3;i++){rgba[i*4]=sh[i*3];rgba[i*4+1]=sh[i*3+1];rgba[i*4+2]=sh[i*3+2];}
 const tex=new T.DataTexture(rgba,width,height,T.RGBAFormat,T.FloatType);tex.needsUpdate=true;
 renderer.initTexture(tex);
 const gl=renderer.getContext();
 if(gl.getError()===gl.OUT_OF_MEMORY)throw new Error('이 장치의 GPU 메모리가 부족해 메시 색상을 올리지 못했습니다. 다른 3D 탭을 닫고 다시 시도해 주세요.');
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setIndex(new T.BufferAttribute(indices,1));geometry.computeBoundingSphere();
 const vertexShader=`uniform sampler2D shTexture;uniform int texWidth;out vec3 colorW;out float clipW;
 vec3 coeff(int n){int k=gl_VertexID*16+n;return texelFetch(shTexture,ivec2(k%texWidth,k/texWidth),0).rgb;}
 void main(){vec3 dir=normalize(position-cameraPosition);float x=dir.x,y=dir.y,z=dir.z,xx=x*x,yy=y*y,zz=z*z;
 vec3 c=0.28209479177387814*coeff(0)-0.4886025119029199*y*coeff(1)+0.4886025119029199*z*coeff(2)-0.4886025119029199*x*coeff(3);
 c+=1.0925484305920792*x*y*coeff(4)-1.0925484305920792*y*z*coeff(5)+0.31539156525252005*(2.0*zz-xx-yy)*coeff(6)-1.0925484305920792*x*z*coeff(7)+0.5462742152960396*(xx-yy)*coeff(8);
 c+=-0.5900435899266435*y*(3.0*xx-yy)*coeff(9)+2.890611442640554*x*y*z*coeff(10)-0.4570457994644658*y*(4.0*zz-xx-yy)*coeff(11)+0.3731763325901154*z*(2.0*zz-3.0*xx-3.0*yy)*coeff(12)-0.4570457994644658*x*(4.0*zz-xx-yy)*coeff(13)+1.445305721320277*z*(xx-yy)*coeff(14)-0.5900435899266435*x*(xx-3.0*yy)*coeff(15);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);clipW=gl_Position.w;colorW=max(c+0.5,vec3(0.0))*clipW;}`;
 const material=new T.ShaderMaterial({glslVersion:T.GLSL3,uniforms:{shTexture:{value:tex},texWidth:{value:width}},vertexShader,fragmentShader:`precision highp float;in vec3 colorW;in float clipW;out vec4 fragColor;void main(){fragColor=vec4(clamp(colorW/clipW,0.0,1.0),1.0);}`,side:T.DoubleSide,depthWrite:true,depthTest:true,toneMapped:false});
 const mesh=new T.Mesh(geometry,material);
 // Evaluate identical SH3 once per vertex, instead of once per repeated indexed
 // vertex invocation. Both the cache and coefficients retain float32 precision.
 if(renderer.extensions.has('EXT_color_buffer_float') && !(location.hostname==='127.0.0.1'&&new URLSearchParams(location.search).has('uncachedSh'))){
  const colorWidth=2048,colorHeight=Math.ceil(meta.vertices/colorWidth),posRGBA=new Float32Array(colorWidth*colorHeight*4);
  for(let i=0;i<meta.vertices;i++){posRGBA[i*4]=positions[i*3];posRGBA[i*4+1]=positions[i*3+1];posRGBA[i*4+2]=positions[i*3+2];}
  const posTex=new T.DataTexture(posRGBA,colorWidth,colorHeight,T.RGBAFormat,T.FloatType);posTex.needsUpdate=true;
  const colors=new T.WebGLRenderTarget(colorWidth,colorHeight,{type:T.FloatType,format:T.RGBAFormat,minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:false,stencilBuffer:false});
  const calculation=vertexShader.slice(vertexShader.indexOf('vec3 dir='),vertexShader.indexOf('gl_Position=')).replace('position-cameraPosition','position-viewPosition');
  const colorMaterial=new T.ShaderMaterial({glslVersion:T.GLSL3,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{shTexture:{value:tex},positionTexture:{value:posTex},texWidth:{value:width},colorWidth:{value:colorWidth},vertexCount:{value:meta.vertices},viewPosition:{value:new T.Vector3()}},vertexShader:'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`precision highp float;uniform sampler2D shTexture;uniform sampler2D positionTexture;uniform int texWidth;uniform int colorWidth;uniform int vertexCount;uniform vec3 viewPosition;out vec4 cachedColor;int vertexId;
   vec3 coeff(int n){int k=vertexId*16+n;return texelFetch(shTexture,ivec2(k%texWidth,k/texWidth),0).rgb;}
   void main(){ivec2 pixel=ivec2(gl_FragCoord.xy);vertexId=pixel.y*colorWidth+pixel.x;if(vertexId>=vertexCount){cachedColor=vec4(0);return;}vec3 position=texelFetch(positionTexture,pixel,0).xyz;${calculation}cachedColor=vec4(max(c+0.5,vec3(0)),1);}`});
  const colorScene=new T.Scene(),colorCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),quad=new T.Mesh(new T.PlaneGeometry(2,2),colorMaterial);quad.frustumCulled=false;colorScene.add(quad);
  material.uniforms={colorTexture:{value:colors.texture},colorWidth:{value:colorWidth}};
  material.vertexShader=`uniform sampler2D colorTexture;uniform int colorWidth;out vec3 colorW;out float clipW;void main(){vec3 c=texelFetch(colorTexture,ivec2(gl_VertexID%colorWidth,gl_VertexID/colorWidth),0).rgb;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);clipW=gl_Position.w;colorW=c*clipW;}`;
  material.needsUpdate=true;
  const previousView=new T.Vector3(Infinity,Infinity,Infinity),view=new T.Vector3();
  mesh.onBeforeRender=(r,s,c)=>{c.getWorldPosition(view);if(previousView.equals(view))return;previousView.copy(view);colorMaterial.uniforms.viewPosition.value.copy(view);const target=r.getRenderTarget();r.setRenderTarget(colors);r.render(colorScene,colorCamera);r.setRenderTarget(target);};
  mesh.userData.shCache='Float32 GPU view-dependent per-vertex SH3 cache';
 }
 mesh.userData.officeMeta={...meta,downloadBytes:total};scene.add(mesh);return mesh;
}
