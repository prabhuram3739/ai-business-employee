import {BriefcaseBusiness,CarFront,Home,Utensils} from "lucide-react";
export function ModuleIcon({name,size=18}:{name:string;size?:number}){
 if(name==="home")return <Home size={size}/>;
 if(name==="utensils")return <Utensils size={size}/>;
 if(name==="car")return <CarFront size={size}/>;
 return <BriefcaseBusiness size={size}/>;
}