/**
 * Basic text field for:
 * email, password, tel, url, text
 * @param nameID 
 * @param label 
 * @param att 
 * @param type = number / integer / email / password / tel / url, default: text
 */
export function Input(nameID, label, Attr, type){
    let inputHtml;

    inputHtml =  `<div id="${nameID}_wrap">`;
    if(typeof label !== 'undefined') inputHtml += `<label for="${nameID}" ${Attr.label}>${label}</label>`;
    if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
    inputHtml += `<input type="${type}" id="${nameID}" name="${nameID}" ${Attr.control}/>`;
    if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
    inputHtml += `</div>`;

    return inputHtml;
}
export function Textarea(nameID, label, Attr, formID){
    let inputHtml;
    inputHtml =  `<div id="${nameID}_wrap">`;
    if(typeof label !== 'undefined') inputHtml += `<label for="${nameID}" ${Attr.label}>${label}</label>`;
    if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
    inputHtml += `<textarea form="${formID}" name="${nameID}" ${Attr.control} rows="6" cols="70"></textarea>`;
    if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
    inputHtml += `</div>`;

    return inputHtml;
}
/**
 * SELECT
 * including multiple select like this: <select name="${f.id}" size="6" multiple>
 *  
 * selected: in the option tag, as the default answer
 * size: number of visible options (scroll down menu, vooral handig bij 'multiple')
 * multiple: 
 * @param f 
 */
export function Select(nameID, label, Attr){
    let inputHtml;
    let optionsAsHtml = ``;
    //first empty option, when no default value is given
    if(Attr.placeholder){ optionsAsHtml += `<option value="" disabled selected hidden>${Attr.placeholder}</option>\n`; }
    else if(!Attr.default){ optionsAsHtml += `<option value=""></option>\n`; }
    //add all options
    Object.keys(Attr.options).forEach(key => {
        optionsAsHtml += `<option value="${key}"`;
        if(Attr.default && Attr.default == key) optionsAsHtml += ` selected`; //add default
        optionsAsHtml += `>
                        ${Attr.options[key]}
                        </option>\n`
    })
        
    let attributesAsHtml = ``; //`size="6"`; multiple...
    inputHtml =  `<div id="${nameID}_wrap">`;
    if(typeof label !== 'undefined') inputHtml +=`<label for="${nameID}" ${Attr.label}>${label}</label>`;
    if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
    inputHtml += `<select id="${nameID}" name="${nameID}" ${Attr.control}>\n ${optionsAsHtml}</select>`;
    if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
    inputHtml += `</div>`;

    return inputHtml;
}
/**
 * Radio
 * @param nameID 
 * @param label 
 * @param att 
 * @param options 
 */
export function Radio(nameID, label, Attr){
    let inputHtml = `<fieldset>`;
    if(typeof label !== 'undefined') inputHtml +=`<legend ${Attr.label}>${label}</legend>`; 
    if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;

    Object.keys(Attr.options).forEach(key => {
        inputHtml += `  <label for="${key}" ${Attr.label}>
                    <input type="radio" id="${key}" name="${nameID}"`;
        if(Attr.default && Attr.default == key) inputHtml += ` checked`; //add default
        inputHtml +=     `/>
                    ${Attr.options[key]}
                    </label>`
    })
    if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
    inputHtml += `</fieldset>`

    return `<div id="${nameID}_wrap">
                ${inputHtml}
            </div>`;

}

/**
 * Checkboxes
 * @param f 
 */
export function Checkbox(nameID, label, Attr){
    let inputHtml;

    //simple boolean checkbox for one question
    if(Object.keys(n.options).length == 0){

        if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
        inputHtml = `<label for="${nameID}" ${Attr.label}>
                    <input type="checkbox" id="${nameID}" name="${nameID}" ${Attr.control} /> 
                    ${label}
                </label>`
        if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;

    }
    //options and hence multiple choices with one checkbox for each
    else{

        inputHtml = `<fieldset id="${nameID}">`;
        if(typeof label !== 'undefined') inputHtml += `<legend ${Attr.label}>${label}</legend>`;
        if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
        
        Object.keys(Attr.options).forEach(key => {
            let checked = ''
            if(Attr.default && Attr.default == key) checked += ` checked`; //add default
            inputHtml += `<label for="${key}">
                            <input type="checkbox" id="${key}" name="${nameID}" ${Attr.control}${checked} />`
            inputHtml += ` ${Attr.options[key]}</label>`;

        });
        
        if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
        inputHtml += `</fieldset>`
    }

    return `<div id="${nameID}_wrap">
        ${inputHtml}
    </div>`;
}

export function DateTime(nameID, label, Attr){
    let inputHtml;

    inputHtml =  `<div id="${nameID}_wrap">`;
    if(typeof label !== 'undefined') inputHtml += `<label for="${nameID}" ${Attr.label}>${label}</label>`;
    if(Attr.description) inputHtml += `<p class = "descr">${Attr.description}</p>`;
    inputHtml += `<input type="date" id="${nameID}" name="${nameID}" ${Attr.control}/>`;
    if(Attr.hint) inputHtml += `<p class = "hint">${Attr.hint}</p>`;
    inputHtml += `</div>`;

    return inputHtml;
}


export function Buttons(nameID, label, Attr){
    
    return `<button type="submit" class="pure-button pure-button-primary">Submit</button>\n
    <button type="reset" class="pure-button pure-button-secondary">Reset</button>`;

}

