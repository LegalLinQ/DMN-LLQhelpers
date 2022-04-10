import DmnModdle from 'dmn-moddle';
import ModdleClean from './ModdleClean';

/**
 * DMN TO Moddle object
 * @param xmlString version 1.2 or 1.3
 * @output Moddle version 1.3
 */
export default async function transpile(xmlString){
  let moddle = new DmnModdle();
  //make DMN 1.2 into DMN 1.3 (or let engine believe such is true)
  xmlString = xmlString.replace('http://www.omg.org/spec/DMN/20180521/MODEL/','https://www.omg.org/spec/DMN/20191111/MODEL/');

  return new Promise((resolve, reject) => {
    moddle.fromXML(xmlString, 'dmn:Definitions', {}, (err, moddleOutput, parseContext) => { 
        moddleOutput = ModdleClean(moddleOutput, {});
        console.dirxml(`Uploaded Moddle & XML & parseContext\n`, moddleOutput, new DOMParser().parseFromString(xmlString,'text/xml'), parseContext);
        if(err) console.warn(`Uploaded XML en transpile to Moddle error in DMN2Moddle Transpile is: \n`, err);
        resolve(moddleOutput);
      });
  });
}