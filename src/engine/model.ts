import b from '../data/benchmarks.json'; import type {Result,Scenario,Provenance} from './types';
const clamp=(x:number,a:number,c:number)=>Math.max(a,Math.min(c,x));
const crf=(r:number,n:number)=>r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
export function calculate(s:Scenario):Result{
 const prov:Record<string,Provenance>={}; const org=b.organisms[s.organism];
 let t=s.titer, p=s.productivity, bt=s.batchTime;
 if(t!=null)prov.titer='user'; if(p!=null)prov.productivity='user'; if(bt!=null)prov.batchTime='user';
 if(t==null&&p!=null&&bt!=null){t=p*bt;prov.titer='derived'}
 if(p==null&&t!=null&&bt!=null){p=t/bt;prov.productivity='derived'}
 if(bt==null&&t!=null&&p!=null){bt=t/p;prov.batchTime='derived'}
 if(t==null){t=org.titer[1];prov.titer='benchmark'} if(p==null){p=org.productivity[1];prov.productivity='benchmark'} if(bt==null){bt=t/p;prov.batchTime='derived'}
 let recovery=s.recovery;
 if(recovery==null){recovery=org.recovery[1];prov.recovery='benchmark'}else prov.recovery='user';
 const op=b.operations, fin=b.finance, facility=b.facilityProfiles[s.facility]; const cap=b.capex;
 const workingL=s.fermenterVolume*1000*op.workingVolumeFraction; const cycle=bt+op.turnaroundHours;
 const batchesPerYear=(op.operatingDays*24/cycle)*op.availability; const kgPerBatch=t*workingL/1000*recovery;
 const kgPerReactor=kgPerBatch*batchesPerYear;
 const reactorBase=cap.reactorReferenceCostM*Math.pow(s.fermenterVolume/cap.reactorReferenceVolumeM3,cap.scaleExponent)*facility.capexMultiplier[1];
 const variablePerKg=(s.yieldMode==='metabolic'?(s.substratePrice/Math.max(s.metabolicYield||0.5,0.01)):0)+s.dsp+s.drying+s.purification+facility.utilityCostPerKg[1];
 let reactors=1, result:any;
 for(;reactors<=500;reactors++){
   const annualKg=kgPerReactor*reactors; const reactorM=reactorBase*reactors; const trainM=reactorM*cap.fermentationTrainMultiplier[1]; const facilityM=trainM*cap.completeFacilityMultiplier[1];
   const annualized=facilityM*1e6*crf(fin.discountRate,fin.projectLifeYears); const maintenance=facilityM*1e6*fin.maintenancePct; const fixed=facilityM*1e6*facility.fixedOpexShare[1]+maintenance; const variable=annualKg*variablePerKg; const revenue=annualKg*s.price;
   result={annualKg,reactorM,trainM,facilityM,annualized,fixed,variable,revenue}; if(revenue>=annualized+fixed+variable)break;
 }
 const entered=Object.values(prov).filter(x=>x==='user').length; const benchmarked=Object.values(prov).filter(x=>x==='benchmark').length; const consistency=Math.abs(t-p*bt)/Math.max(t,1); const score=clamp(40+entered*12-benchmarked*8-(consistency>.2?15:0),20,95); const confidence=score>=78?'Strong':score>=55?'Moderate':'Directional';
 const low=(x:number)=>x*.72, high=(x:number)=>x*1.38; const total=result.annualized+result.fixed+result.variable; const insights:string[]=[];
 if((s.dsp+s.drying+s.purification)>s.price*.35)insights.push('Downstream processing is the dominant economic constraint.');
 if(reactors>=10)insights.push('Commercial viability requires a large parallel reactor fleet.');
 if(result.facilityM/(result.annualKg/1e6)>10)insights.push('CAPEX intensity is high relative to annual output.');
 if(insights.length===0&&consistency>.2)insights.push('Reported titer, productivity and batch time are internally inconsistent.');
 return {annualKg:result.annualKg,annualTonnes:result.annualKg/1000,reactors,capex:{reactor:[low(result.reactorM),high(result.reactorM)],train:[low(result.trainM),high(result.trainM)],facility:[low(result.facilityM),high(result.facilityM)]},annualizedCapex:result.annualized,revenue:result.revenue,variableCost:result.variable,fixedOpex:result.fixed,breakEven:result.revenue>=total,confidence,confidenceScore:score,resolved:{titer:t,productivity:p,batchTime:bt,recovery},provenance:prov,insights:insights.slice(0,3),costPerKg:total/result.annualKg};
}
