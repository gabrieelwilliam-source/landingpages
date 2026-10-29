// The glTF emissive slot transports a precomputed RGB irradiance map. Marked
// static surfaces consume it as lightMap; signs/screens keep their real emission.
export function applyOfficeLightmap(material){
 if(!material.userData?.zaionIndirectLight)return false;
 if(material.userData.zaionLightmapReady)return true;
 if(!material.emissiveMap)return false;
 material.lightMap=material.emissiveMap;
 // Cycles' uncoloured diffuse bake contains outgoing diffuse radiance (E/pi).
 material.lightMapIntensity=Math.PI;
 material.emissiveMap=null;material.emissive.setRGB(0,0,0);
 material.envMapIntensity=.85;
 material.userData.zaionLightmapReady=true;
 return true;
}
