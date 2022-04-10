import traverse from 'traverse';

/**
 * Make entries compliant
 * To handle XML uploads
 * TODO: Filter not allowed DMN/FEEL functions out
 * @param moddleObject 
 */

export default function ModdleCleanForParser(moddleObject, DecisionIDs:Object){
    var uniqueNames : Array<any> = [];

    const informationRequirementElement = (el) =>{
        //DecisionID's empty, then no informationRequirement replacement (name for id) is necessary
        if(Object.keys(DecisionIDs).length == 0) return el;

        //replace the name of the decision with the id, with help fo DecisionIDs object
        if(typeof el.requiredDecision !== 'undefined'){
            if(typeof el.requiredDecision.href !=='undefined'){
                let decisionName = el.requiredDecision.href.replace('#','');
                if(typeof decisionName == 'undefined') throw Error('InformationRequirement lacks a valid DecisionID.');
                el.requiredDecision.href = '#'+DecisionIDs[decisionName];
            }
            else{ throw Error('InformationRequirement lacks a href reference.')}
        }
        return el;
    }

    const decisionElement = (el) =>{
        uniqueNames.push( el.name.toLowerCase() ); //names must be unique
        return el;
    }
    const decisionLogicElement = (el) =>{ //decisionTable in XML
        //only allow FIRST and COLLECT
        if(['UNIQUE','FIRST','COLLECT'].indexOf(el.hitPolicy) == -1) {
            console.error(`Decision policy unsupported, moddle object was`, moddleObject);
            throw new Error(`Decision policy "${el.hitPolicy}" is unsupported, moddle object was: .`);
        }

        return el;
    }
    const inputClauseElement = (el) =>{
        //SAFETY TEST, CHECK WHETHER TITEL OF INFORMATION IS NOT SAME AS TITLE OF THE FORM/DECISION ID (title maybe late set by a Field, hence late testing)
        if(uniqueNames.indexOf( el.id.toLowerCase() ) >= 0 ) throw new Error(`Double label in decision table input: "${el.id}". They must be different.`);
        uniqueNames.push(el.id.toLowerCase());

        return el;
    }
    const outputClauseElement = (el) =>{
        //SAFETY TEST, CHECK WHETHER TITEL OF INFORMATION IS NOT SAME AS TITLE OF THE FORM/DECISION ID (title maybe late set by a Field, hence late testing)
        if(uniqueNames.indexOf( el.id.toLowerCase() ) >= 0) throw new Error(`Double label in decision table output: "${el.id}". They must be different.`);
        uniqueNames.push(el.id.toLowerCase());

        el.name = el.name?el.name:'Output is:';
        return el;
    }


    var notCheckedYet : Array<any> = [];
    //MAKE FOR EACH ELEMENT A FUNCTION - see below
    traverse(moddleObject).forEach(el => {

        if(!Array.isArray(el) && typeof el == 'object' && el.$type.startsWith('dmn')){ 

            switch(el.$type.slice(4)) {
                case 'Definitions':  break;
                //case 'InformationItem': informationItemElement(el); break;
                case 'InformationRequirement': informationRequirementElement(el); break;
                case 'Decision': decisionElement(el);  break;
                case 'DecisionTable': decisionLogicElement(el); break;
                case 'InputClause': inputClauseElement(el); break;
                case 'OutputClause': outputClauseElement(el); break;
                //case 'DecisionRule': ruleElement(el); break;
                //case 'UnaryTests': unaryTestElement(el); break;
                //case 'LiteralExpression': LiteralExpressionElement(el); break;
                default: if(notCheckedYet.indexOf( el.$type.slice(4) ) == -1) notCheckedYet.push(el.$type.slice(4));
            }
        };
    });

    uniqueNames = []; //renew

    return moddleObject;
}