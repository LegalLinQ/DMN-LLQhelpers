/**
 * Merge FormData and DMN extracted data
 */

function addMissingElements(el, webs){
    //loop through DMN input elements
    Object.keys(el.inDataByName).forEach(nameID => {
        if(typeof webs == 'undefined') webs = {};
        if(typeof webs.Formfields == 'undefined') webs.Formfields = {};
        if(typeof webs.Formfields[nameID] == 'undefined' ) webs.Formfields[nameID] = {};
        if(typeof webs.Formfields[nameID].nameID == 'undefined' ) webs.Formfields[nameID].nameID = nameID;
        if(typeof webs.Formfields[nameID].label == 'undefined' ) webs.Formfields[nameID].label = '';
        if(typeof webs.Formfields[nameID].type == 'undefined' ) webs.Formfields[nameID].type = '';
        if(typeof webs.Formfields[nameID].description == 'undefined' ) webs.Formfields[nameID].description = '';
        if(typeof webs.Formfields[nameID].hint == 'undefined' ) webs.Formfields[nameID].hint = '';
        if(typeof webs.Formfields[nameID].options == 'undefined' ) webs.Formfields[nameID].options = '';
        if(typeof webs.Formfields[nameID].default == 'undefined' ) webs.Formfields[nameID].default = '';
        if(typeof webs.Formfields[nameID].placeholder == 'undefined' ) webs.Formfields[nameID].placeholder = '';
        if(typeof webs.Formfields[nameID].display == 'undefined' ) webs.Formfields[nameID].display = '';
        if(typeof webs.Formfields[nameID].required == 'undefined' ) webs.Formfields[nameID].required = '';
    })
}

function updateElements(el,webs){

    //loop through DMN input elements
    Object.keys(el.inDataByName).forEach(nameID => {

        if( String(webs.Formfields[nameID].label).length == 0) webs.Formfields[nameID].label = el.controls[nameID].label;
        if( String(webs.Formfields[nameID].type).length == 0 ) webs.Formfields[nameID].type = el.controls[nameID].typeRef;
        if(  webs.Formfields[nameID].type == 'select' || 
                webs.Formfields[nameID].type == 'radio' || 
                webs.Formfields[nameID].type == 'checkbox' 
        ) optionsTOobject();

        //when an options field, object with key = value 
        function optionsTOobject(){
            let DMNopts = {} //DMN model options as object
            let SOpts = webs.Formfields[nameID].options; //Settings (Excel) options
            
            //Fill DMNopts
            if(el.controls[nameID].options && Array.isArray(el.controls[nameID].options)){
                el.controls[nameID].options.forEach(o => {
                    DMNopts[o] = o; //Object with key is same as value
                });
            }
            
            //No settings or Settings are an Array and then better take the options from DMN
            if (String(SOpts).length == 0 || Array.isArray(SOpts)){  
                webs.Formfields[nameID].options = DMNopts;
            }
            //No DMNOpts, take Excel instead
            else if (Object.keys(DMNopts).length == 0 && Object.keys(SOpts).length > 0){ 
                webs.Formfields[nameID].options = SOpts;
            }
            //Settings and DMN opts present, merge with DMN as leading and ignoring Settings of no DMN option
            else if (Object.keys(DMNopts).length > 0 && Object.keys(SOpts).length >0){ 
                Object.keys(DMNopts).forEach(oKey => {
                    if(SOpts[oKey] in DMNopts) DMNopts[oKey] = SOpts[oKey];
                })
                webs.Formfields[nameID].options = DMNopts;
            }
            //Final, do dummy
            else{
                webs.Formfields[nameID].options = {NoOptions:'No Options'}
            }
        }
    })
}

function removeEmptySettings(webs){
    var Ff = {};
    //loop through DMN input elements
    Object.keys(webs.Formfields).forEach(nameID => {
        if( String(webs.Formfields[nameID].description).length == 0 ) delete webs.Formfields[nameID].description;
        if( String(webs.Formfields[nameID].hint).length == 0 ) delete webs.Formfields[nameID].hint;
        if( String(webs.Formfields[nameID].options).length == 0) delete webs.Formfields[nameID].options;
        if( String(webs.Formfields[nameID].default).length == 0 ) delete webs.Formfields[nameID].default;
        if( String(webs.Formfields[nameID].placeholder).length == 0 ) delete webs.Formfields[nameID].placeholder;
        if( String(webs.Formfields[nameID].display).length == 0 ) delete webs.Formfields[nameID].display;
        if( String(webs.Formfields[nameID].required).length == 0 ) delete webs.Formfields[nameID].required;

        //New Object
        Ff[nameID] = webs.Formfields[nameID];
    });
    return Ff;
}

function removeUnusedFields(el,Ff){
    //Only select elements that are used
    //This also enables us to have a large master file with many common webfields, as only the ones used are kept
    let Ffchecked = {}
    Object.keys(Ff).forEach(key => {
        if(Object.keys(el.inDataByName).indexOf(key) !== -1) Ffchecked[key] = Ff[key];
    });
    return Ffchecked;
}

/**
 * Merge DMN and FormTable
 * @param ElementsFromDMN as el
 * @param WebformSettings as webs
 */
 export function mergeFormForDisplay(el, webs){
    let Ff={};
    addMissingElements(el, webs);
    updateElements(el,webs);
    Ff = removeEmptySettings(webs);
    Ff = removeUnusedFields(el,Ff);
    return Ff;
}

/**
 * Merge for download of Websettings
 * @param ElementsFromDMN as el
 * @param WebformSettings as webs
*/
export function mergeFormForExportSettings(el,webs){
    addMissingElements(el, webs);
    updateElements(el,webs);
    
    //const data = [ {timestamp: 1525879470,name: "testing",lastname: "testingdone"}, {timestamp: 1525879470,name: "testing2",lastname: "testingdone2"}]
    const data = webs.Formfields;
    let firstElKey = Object.keys(data)[0];
    let headerArray = Object.keys(data[firstElKey]);
    let csv = headerArray.join(',')+'\n';

    Object.keys(data).forEach(field => {
        headerArray.forEach(attr =>{
            //Skip "options", they are always read from the model AND skip undefined entries
            if(attr == 'options' || typeof data[field][attr] == 'undefined' ) { csv += ',';  } 
            else{ csv += '"' +data[field][attr] + '",'; }
        })
        csv += '\n';
    })

    return csv;
}
