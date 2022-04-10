/**
 * 
 * From DMN via Moddle make a 
 * Object with all information in DMN for making a form
 *  
 */
import traverse from 'traverse';

/**
 * Get form elements from decision data
 * This will fetch all it can from the decision/inputData/ItemDefinition as possibly usefull for the form
 * @param moddleObject 
 * 
 */
 export default async function getElementsFromDMN(moddleObject){

    var DMNname;
    var DMNdescription;
    var dID; //id of the ultimate/final decision. Needs to be 1, so if more one is choosen
    var dQs = {} //key - decisionID, value is array of related InputData ID's, taken from the Decision - informationRequirements - requiredInput - href's (href without starting "#" = InputData ID)
    var form = {} //key - decisionID, value is object with "label" and "description"
    var controls = {} //key - nameID of formfield, value is object with field "label" and "options"
    var iDef = {} //key - TypeRef used in InputData, value is itemDefinition Moddle object (for KIE only)
    var inData = {} //key is InputData id's, value is the moddle input data element
    var inDataByName = {} //key is inputData name, value is inputData ID
    var reqD = {} //key is decisionID, value is array of required decision ID's
    let outLabels = {}; //name as key and label as value

    //Make 2 array's, one with all decision ID's, and one with reference from InfoRequirements to Decisions
    //The Decision ID without a corresponding reference in InfoRequirements must be the ultmate/final decision (calculated below)
    //Provides the Decision that is not an input (informationRequirement) for another decision, ie the top decision.
    let AllIds : Array<any> = [];
    let AllInfoReqIds : Array<any> = [];
    function setFinalDecisionID(){//@ts-ignore
        let notRequiredDecision = AllIds.filter(x => !AllInfoReqIds.includes(x));
        dID = notRequiredDecision[0]; //pick the first if there are more
    }

    const decisionHandler = (el) =>{
        //Find Top/Final decision
        if (el.$type.toLowerCase() == "dmn:decision"){ 
            AllIds.push(el.id); //helper to determine top/final decision (unclear whether 'variable' is always present)
                    //check for required decisions to find the top of the graph, find decision that is not required by another decision
            if(typeof el.informationRequirement !== 'undefined'){
                el.informationRequirement.forEach((req) => {
                    if (typeof req.requiredDecision !== 'undefined' && req.requiredDecision.href){ 
                        AllInfoReqIds.push(req.requiredDecision.href.replace('#','')); 
                    }
                    if (typeof req.requiredInput !== 'undefined' && req.requiredInput.href){ 
                        if(typeof dQs[el.id] == 'undefined') dQs[el.id] = [];
                        dQs[el.id].push(req.requiredInput.href.replace('#','')); //per Decision, make array of InputData ID's that are required for this decision
                    }
                });
            }
        }
        //correct Decision label and description if none is present
        if(el.label == undefined ) el.label = el.name.replace(/\_/g,' '); 
        if(el.description == undefined ) el.description = "  "; //lege input om geen undefined te krijgen
        //Form Object, with label and description
        form[el.id] = {};
        form[el.id]["label"]=el.label;
        form[el.id]["description"]=el.description;
    }

    const inputDataHandler = (el) =>{
        if(typeof el.label == 'undefined' && typeof el.name !== 'undefined') el['label'] = el['name']; //fix when there is no label
        inData[el.id] = el;
        inDataByName[el.name] = el.id;
    }
    //Retrieve input data enumerations, for the option elements in een vorm
    //Form ItemDefinitions (KIE method)
    const itemDefinitionHandler = (el) =>{
        //UNTESTED : if item collection, loop through it
        if(el.isCollection && el.length>0){el.forEach(itemElement => {  itemDefinitionHandler(itemElement)  });};
        el.forEach(itemElement => { iDef[itemElement.name] = itemElement });
    } 

    //Retrieve input data enumerations, for the option elements in een vorm
    //Form InputValues (Camunda method)
    const inputHandler = (el) =>{

        el.input.forEach(e => { 
            let nameID = e.inputExpression.text;
            controls[nameID] = {}; //key = field name of form
            controls[nameID].label = nameID //Key as label
            controls[nameID].typeRef = e.inputExpression.typeRef?e.inputExpression.typeRef:'string'
            
            //OPTIONS in Camunda
            if(e.inputValues){   controls[nameID].options = e.inputValues.text;  }
            //OPTIONS = Type Definition exists for this field, KIE
            else if(iDef[ e.inputExpression.typeRef ] ){ controls[nameID].options = iDef[e.inputExpression.typeRef].allowedValues.text;    }

            if(controls[nameID].options && controls[nameID].options.split(",").length >1 ) {
                controls[nameID].typeRef = 'select';
                //hiervan wordt met blokhaken ([]) een geldig JSON object gemaakt om met JSON.parse dit veilig om te zetten naar een array object
                controls[nameID].options = JSON.parse("[" +controls[nameID].options+ "]");
            }
        });
    }

    const outputClauseElement = (el) =>{
        //Secure good labels for output headings
        el.label = el.label?el.label:el.name.replace(/\_/g,' ');
        outLabels[el.name] = el.label;
    }
    
    if( moddleObject.itemDefinition )itemDefinitionHandler(moddleObject.itemDefinition); //prepare to be used by InputClause
    traverse(moddleObject).forEach((el) => {
        if(!Array.isArray(el) && typeof el == 'object' && el.$type.startsWith('dmn')){ 
            //if(el.$type.slice(4) == "DecisionTable") console.log(el)
            //if(el.$type.slice(4) == "InputClause") console.log(el)
            
            switch(el.$type.slice(4)) {
                case 'Decision': decisionHandler(el);  break;
                case 'DecisionTable': inputHandler(el); break
                case 'InputData': inputDataHandler(el); break;
                case 'OutputClause': outputClauseElement(el); break;
                default: break;
            }
        };
    });


    setFinalDecisionID(); //before DMNNname/description
    //set Name and Description for form. Take from DMN model or otherwise from Final Decision
    if( typeof moddleObject.name == 'undefined' || moddleObject.name.toLowerCase() == 'untitled' ) DMNname = form[dID].label;
    else { DMNname = moddleObject.name }
    DMNdescription = moddleObject.description?moddleObject.description : form[dID].description;

    return {
        name: DMNname, 
        controls:controls,
        description: DMNdescription, 
        decisionID: dID, decisions:dQs, 
        form:form, itemDefs:iDef, 
        inData:inData, 
        inDataByName:inDataByName, 
        requiredDecisions:reqD, 
        OutputLabels:outLabels
    }
}
