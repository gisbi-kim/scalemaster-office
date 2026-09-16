import {DropInViewer,SplatRenderMode,SceneRevealMode} from './vendor/gaussian-splats-3d.module.js';
export async function loadModel(scene,renderer,camera,progress){
 const response=await fetch('./model.json');if(!response.ok)throw new Error(`모델 정보 HTTP ${response.status}`);
 const meta=await response.json();
 const mesh=new DropInViewer({splatRenderMode:SplatRenderMode.TwoD,sphericalHarmonicsDegree:2,sharedMemoryForWorkers:false,gpuAcceleratedSort:false,sceneRevealMode:SceneRevealMode.Instant,integerBasedSort:true});
 scene.add(mesh);
 await mesh.addSplatScene('./model.ksplat',{showLoadingUI:false,progressiveLoad:false,splatAlphaRemovalThreshold:0,onProgress:(percent)=>{progress.textContent=`2DGS 로딩 ${Math.round(percent)}%`;}});
 // Use the actual ray/surfel intersection depth against Dalgu's opaque depth
 // buffer. Upstream otherwise tests the whole screen quad at its centre depth.
 const material=mesh.splatMesh.material;
 material.uniforms.officeProjectionMatrix={value:camera.projectionMatrix};
 material.fragmentShader=material.fragmentShader.replace('uniform vec3 debugColor;','uniform vec3 debugColor;\nuniform mat4 officeProjectionMatrix;').replace('gl_FragColor = vec4(vColor.rgb, w);','vec4 officeClip=officeProjectionMatrix*vec4(0.0,0.0,-depth,1.0);\n gl_FragDepth=0.5*(officeClip.z/officeClip.w)+0.5;\n gl_FragColor = vec4(vColor.rgb, w);');
 material.needsUpdate=true;
 progress.textContent='2DGS 화면을 준비하고 있어요…';
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 mesh.viewer.update(renderer,camera);
 const start=performance.now();
 while(mesh.splatMesh.geometry.instanceCount===0){
  if(performance.now()-start>30000)throw new Error('2DGS 정렬이 완료되지 않았습니다. 새로고침해 주세요.');
  await new Promise(resolve=>setTimeout(resolve,40));
 }
 mesh.userData.officeMeta={...meta,downloadBytes:meta.bytes};return mesh;
}

