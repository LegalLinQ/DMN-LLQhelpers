import * as field from './formControls';
import AttributeGenerator from './formAttributes';
import { mergeFormForDisplay } from './formSettingsMerge';


export default async function formBuilder(FormdataObject, webFormSettings){

    //form fields initializer (type, nameID, label, att, cls);
    let formfields = ''; 

    //relevant signature, to build event listeners from which hide/unhide form fields
    let relevantFunctions: {}[] = [];

    let Ff = mergeFormForDisplay(FormdataObject, webFormSettings);
    //aggregate elements of formfields
    Object.keys(Ff).forEach(nameID => {

        let FieldData = Ff[nameID];
        
        //generate the field as a string
        let Attr = AttributeGenerator(FieldData, nameID);//return type / attributes / validation, etc, including as html string, part of <input name = .... ${att} />
        if( Object.keys(Attr.relevantFunction).length > 0 ) relevantFunctions.push(Attr.relevantFunction);
        formfields += formFields(FieldData.type, nameID, FieldData.label, Attr, FormdataObject)
        formfields += "\n"; //line end for better readebility in consol
    });

    let legend = `<legend></legend>`;
    let fieldset = `<fieldset>${legend}${formfields}</fieldset>`;
    let buttons = field.Buttons(FormdataObject.decisionID, 'Submit', '');
    let webForm =   `${fieldset}
                     ${buttons}`;

    //Webform: the <Form> tags are ommitted, is different per implementation, with the onSubmit.
    return {
        pure:webForm, 
        Title:FormdataObject.name, 
        Description:FormdataObject.description, 
        OutputLabels:FormdataObject.OutputLabels, 
        decisionID:FormdataObject.decisionID, 
        RelevantFunctions:relevantFunctions
        } 
}

function formFields(type, nameID, label, Attr, decisionID){

    switch(type){
        case "file" : break; //do not implement
        case "image" : break; //do not implement
        case "search" : break; //do not implement
        case "datetime-local" : break; //do not implement, insufficient browser support
        case "range" : break; //TODO: implement, 
        case "color" : break; //TODO: implement 
        case 'textarea' : return field.Textarea(nameID, label, Attr, decisionID); break; //own element, not an <input ... <textarea ...
        case 'select' : return field.Select(nameID, label, Attr); break; //own element, not an <input ... but <select ....
        case "radio" : return field.Radio(nameID, label, Attr); break;
        case "checkbox" : return field.Checkbox(nameID, label, Attr); break;
        case "hidden" : 
        case "email" : 
        case "password" : 
        case "tel" : 
        case "url" : 
        case "money" : //LLQ implementation, 2 digits behind comma
        case "integer" : //LLQ implementation, up to 8 digits behind comma
        case "number" : Attr.control += ' step="1"'; return field.Input(nameID, label, Attr, 'number');
        case "text" : return field.Input(nameID, label, Attr, 'text');
        case "month" : 
        case "week" : break; //possibly no implement, when polyfill is difficult, and possibly no use within DMN
        case "time" : 
        case "date" : return field.DateTime(nameID, label, Attr); break; //TODO: implement the date/time, polyfill Safari
        case "submit" : 
        case "reset" : 
        case "button" : break; //do not implement, use button element instead: <button></button>, which is implemented later

        default : return field.Input(nameID, label, Attr, 'text');  
    }
}