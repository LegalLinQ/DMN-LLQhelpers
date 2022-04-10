export default function Attributes(FieldData, nameID){
    let LabelHtml =``;
    let ControlHtml =``;

    let ClassesLabel = formLabelcss();
    if(ClassesLabel) LabelHtml +=`class="${ClassesLabel}"`;

    let ClassesControl = formControlcss();
    if(ClassesControl) ControlHtml += `class="${ClassesControl}"`;

    //form field placeholder
    if(typeof FieldData.placeholder !== 'undefined') ControlHtml += ' placeholder='+FieldData.placeholder;

    //required
    if(typeof FieldData.required !== 'undefined') ControlHtml += ' required';

    //display: hidden / show, possibly with condition. Formfield hidden will be set at runtime via JS function, so either function generation works or field is shown 
    let RelevantFunction={}
    if(typeof FieldData.display !== 'undefined') RelevantFunction = createRelevantFunctionSignature(FieldData.display);

    //default value
    let DefaultValue;
    if(typeof FieldData.default !== 'undefined')  DefaultValue = defaultValue();
    if (DefaultValue && DefaultValue.startsWith(' value')) ControlHtml += DefaultValue;
    if (DefaultValue && DefaultValue.startsWith(' checked')) ControlHtml += DefaultValue;
    
    return {
                type:FieldData.type,
                label:LabelHtml,
                control:ControlHtml,
                options:FieldData.options,
                default:DefaultValue,
                description: FieldData.description,
                hint:FieldData.hint,
                placeholder:FieldData.placeholder,
                relevantFunction:RelevantFunction,
            }


    function formLabelcss(){
        switch(FieldData.type){
            case "checkbox" : return 'pure-checkbox';
            case "radio" : return 'pure-radio';
            case "select" : break;  //`size="6"`; multiple...
            default : return '';
        }  
    }

    function formControlcss(){
        switch(FieldData.type){
            case "checkbox" : break;//return 'pure-checkbox';
            case "radio" : return 'pure-radio';
            case "select" : break;  //`size="6"`; multiple...
            default : return '';
        }  
    }

    function defaultValue(){
        let DefaultValue = FieldData.default;
        //return what should become of the control attrib
        switch(FieldData.type){
            case "checkbox" : if(DefaultValue === 'TRUE') return ' checked';
            case "select" : 
            case "radio" : return DefaultValue;
            default : return ` value="${DefaultValue}"`;
        } 
    }

    function createRelevantFunctionSignature(Relevant){
        if(typeof Relevant == 'undefined' || String(Relevant).length == 0) return {}; //empty Opts

        let rel = Relevant.split(/(?<!<|>)==(?!=)|===|<(?!=)|>(?!=)|<=|>=/);
        //let rel = Relevant.split('==');
        let conditionField = rel[0].trim();
        let condition = rel[1].trim();
        let operator = Relevant.substring(rel[0].length, Relevant.length-rel[1].length);

        //console.log("LOG FOR LLQ Field display condition, full input\n ", Relevant, "\nConditionField: ",conditionField, "\nOperator: ",operator, "\nCondition: ",condition)

        return { TargetField : nameID, ConditionField : conditionField, Operator : operator, Condition : condition }
    }

}
/**
 * readonly : veld is wel te zien maar niet editable en wordt wel verzonden
 * disabled: veld is wel te zien maar niet editable and wordt niet verzonden (wel inhoud kopieerbaar)
 * multiple: for input types: email, and file. (select heeft er ook eentje, dat is alleen geen input element maar een select element)
 * required : for input types: text, search, url, tel, email, password, date pickers, number, checkbox, radio, and file.
 * autofocus: field gets focus on pageload (1ste veld)
 * autocomplete="off" | autocomplete="on" : autocomplete with what users have filled in before. Handig bij 'email', tel, naam, etc. For: types: text, search, url, tel, email, password, datepickers, range, and color.
 * size: The default value for size is 20 tekens, alleen bij: text, search, tel, url, email, and password.
 * maxlength: maximum number of characters allowed in an input field (but no feedback to user when exceeding).
 * min and max: only for: number, range, date, datetime-local, month, time and week.
 * pattern: A regular expression that the input field's value is checked against, when the form is submitted. For: text, date, search, url, tel, email, and password.
 * placeholder: for  text, search, url, tel, email, and password.
 * value: initial value ???
 * step: specifies the legal number intervals for an input field. Ook voor decimalen. For: number, range, date, datetime-local, month, time and week.
 * height and width : alleen images
 * list:  <datalist> element that contains pre-defined options for an <input> element.
 * 
 * //For textarea only:
 * rows: The rows attribute specifies the visible number of lines in a text area.
 * cols: The cols attribute specifies the visible width of a text area.
 * 
 */
