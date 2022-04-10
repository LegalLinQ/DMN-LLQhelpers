import { read, utils} from 'xlsx';

export default function processExcelWorkbook(UploadedWorkbook){
    try{
      //initiate simple SimpleTables, the return object
      const WebSettingsExcel = {};
      //read workbook as string
      let workbook = read(UploadedWorkbook, { type: 'array'});
  
      var formfieldNo = 0;
      //get array of available sheets
      workbook.SheetNames.forEach((sheetName, index) => { 
        sheetName = String(sheetName);
        //warn against empty sheets
        if(typeof workbook.Sheets[sheetName]['!ref'] == 'undefined'){ console.warn( `Excelsheet "${sheetName}" seems to be empty.`); }
        //generate form fields
        else if(sheetName.substring(0, 9).toLowerCase() == 'formfield'){

          formfieldNo ++; //count formfields to have accurate number of sheets
          if(formfieldNo > 1) console.warn(`More then one Formfield sheet found, there should be only one sheet with name starting 'formfield' this sheet was named: ${sheetName} (last one used)`)
          if(sheetName.indexOf("DMN") !== -1) formfieldNo ++; //als DMN eentje erbij zodat hij voorbij de error hieronder schiet
          
          WebSettingsExcel["Formfields"] = Array2Object( utils.sheet_to_json(workbook.Sheets[sheetName],  {blankrows: false, defval: ""})  ); //defval geeft inhoud aan lege cellen
        }
      });
      //protect against empty excel
      if(formfieldNo == 0) { throw new Error(`NO LOGIC LINQ FORMSETTING TABLE FOUND, make sure the tablename starts with "formfield".`); }
      return WebSettingsExcel;
    }
    finally{
    } //runs always, needed for TypeScript, but no function
}

function Array2Object(SettingsArray){
  let SettingsObject = {};
    SettingsArray.forEach(element => {
      if (typeof element.nameID !== undefined && String(element.nameID).length !== 0){
        SettingsObject[element.nameID] = element;
      }
    });
  return SettingsObject;
}