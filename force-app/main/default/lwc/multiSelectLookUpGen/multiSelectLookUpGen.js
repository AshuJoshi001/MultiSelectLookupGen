import { LightningElement, api, track } from 'lwc';
import retrieveRecords from '@salesforce/apex/MultiSelectLookUpController.retrieveRecords';

export default class MultiSelectLookUpGen extends LightningElement {

    @track globalSelectedItems = []; 
    @api labelName;
    @api objectApiName; 
    @api fieldApiNames; 
    @api filterFieldApiName;  
    @api iconName;  
    @track items = []; 
    @track selectedItems = []; 
    
    @track previousSelectedItems = []; 
    @track value = []; 
    searchInput ='';    
    isDialogDisplay = false; 
    isDisplayMessage = false; 
    
    onchangeSearchInput(event){
        this.searchInput = event.target.value;
        if(this.searchInput.trim().length>0){

            retrieveRecords({objectName: this.objectApiName,
                            fieldAPINames: this.fieldApiNames,
                            filterFieldAPIName: this.filterFieldApiName,
                            strInput: this.searchInput
                            })
            .then(result=>{ 
                this.items = []; 
                this.value = [];
                this.previousSelectedItems = [];
                if(result.length>0){
                    result.map(resElement=>{
                        this.items = [...this.items,{value:resElement.recordId, 
                                                    label:resElement.recordName}];
                        
                        this.globalSelectedItems.map(element =>{
                            if(element.value == resElement.recordId){
                                this.value.push(element.value);
                                this.previousSelectedItems.push(element);                      
                            }
                        });
                    });
                    this.isDialogDisplay = true; 
                    this.isDisplayMessage = false;
                }
                else{
                    this.isDialogDisplay = false;
                    this.isDisplayMessage = true;                    
                }
            })
            .catch(error=>{
                this.error = error;
                this.items = undefined;
                this.isDialogDisplay = false;
            })
        }else{
            this.isDialogDisplay = false;
        }                
    }

    handleCheckboxChange(event){
        let selectItemTemp = event.detail.value;
        
        console.log(' handleCheckboxChange  value=', event.detail.value); 
        console.log('Items@@@@@@' , this.items);       
        this.selectedItems = []; 
        

        selectItemTemp.map(p=>{            
            let arr = this.items.find(element => element.value == p);
            if(arr != undefined){
                this.selectedItems.push(arr);
            }  
        });     
    }
    handleRemoveRecord(event){        
        const removeItem = event.target.dataset.item; 

        console.log('removeItem:', removeItem);
        console.log('globalSelectedItems before filter:', this.globalSelectedItems);
    
        
        this.globalSelectedItems = this.globalSelectedItems.filter(item => item.value  != removeItem);

        console.log('globalSelectedItems after filter:', this.globalSelectedItems);

        const arrItems = this.globalSelectedItems;
        this.initializeValues();
        this.value =[]; 
        const itemType = removeItem.type === 'brand' ? 'brand' : 'category';

        const evtCustomEvent = new CustomEvent('remove', {
          detail: {
            removeItem,
            arrItems,
            itemType,
            objNam: this.objectApiName
          }
        });
        
        this.dispatchEvent(evtCustomEvent);
    }

    handleDoneClick(event){
        this.previousSelectedItems.map(p=>{
            this.globalSelectedItems = this.globalSelectedItems.filter(item => item.value != p.value);
        });
    
        this.globalSelectedItems.push(...this.selectedItems);
        let arrItems = this.globalSelectedItems;
     let temparrItems = arrItems.map(item=>{ return {...item,objNam:this.objectApiName}});
     console.log('-------- checking : '+JSON.stringify(temparrItems));
        this.previousSelectedItems = this.selectedItems;
        this.initializeValues();
        console.log('globalSelectedItems' , JSON.stringify(this.globalSelectedItems) );
        console.log('Before Event Dispatch');
        
        const evtCustomEvent = new CustomEvent('applyfilter', {
            detail: { temparrItems , arrItems , objNam: this.objectApiName }
        });
        this.dispatchEvent(evtCustomEvent);

        console.log('After Event Dispatch');
    }

    handleCancelClick(event){
        this.initializeValues();
    }
    initializeValues(){
        this.searchInput = '';        
        this.isDialogDisplay = false;
    }

}