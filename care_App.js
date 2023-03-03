import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCustomerList from '@salesforce/apex/CARE_SearchController.getCustomerList';
import getFacilityHousingOrg from '@salesforce/apex/CARE_SearchController.getFacilityHousingOrg';
import { phoneMask, isNotBlank } from 'c/care_Utilities';

import SearchFieldMissingMsg from '@salesforce/label/c.CARE_SearchFieldMissingMsg';
import InvalidPersonIdMsg from '@salesforce/label/c.CARE_InvalidPersonIdMsg';
import InvalidFacilityIdMsg from '@salesforce/label/c.CARE_InvalidFacilityIdMsg';

import CARE_RecordsCustNotFound from '@salesforce/label/c.CARE_RecordsCustNotFound';
import CARE_NoCitySearchAllowMsg from '@salesforce/label/c.CARE_NoCitySearchAllowMsg';
import CARE_ValidValuesMsg from '@salesforce/label/c.CARE_ValidValuesMsg';

// datatable columns
const columns = [
    { label: 'Customer Name', fieldName: 'sCustName', type: 'text', sortable: true,initialWidth: 150, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Per ID', fieldName: 'sPerId', type: 'text', sortable: true,initialWidth: 100,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'Acct ID', fieldName: 'sAccId', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'Acct ID', fieldName: 'sAccId', type: 'multipleRow', sortable: true, initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Prem ID', fieldName: 'sPremId', type: 'text', sortable: true,initialWidth: 100,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA ID', fieldName: 'sSAId', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} },    
    { label: 'SA ID', fieldName: 'sSAId', type: 'multipleRow', sortable: true,initialWidth: 100,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA Type', fieldName: 'sSAType', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'SA Type', fieldName: 'sSAType', type: 'multipleRow', sortable: true,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA Status', fieldName: 'sSAStatus', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'SA Status', fieldName: 'sSAStatus', type: 'multipleRow', sortable: true,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Res/Non Res', fieldName: 'sResNonRes', type: 'text', sortable: true,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Discount', fieldName: 'sDiscount', type: 'text', sortable: true,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'Rate', fieldName: 'sRate', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'Rate', fieldName: 'sRate', type: 'multipleRow', sortable: true,  cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Service Address', fieldName: 'sSvcAddr', type: 'text',initialWidth: 200, wrapText: true, sortable: true, typeAttributes: { label: { fieldName: 'sSvcAddr' } }, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Probation', fieldName: 'sProbation', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} }
    //{ label: 'Probation', fieldName: 'sProbation', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' } } }
];

// datatable Non Res columns 
const columnsNonRes = [
    { label: 'Customer Name', fieldName: 'sCustName', type: 'text', sortable: true, initialWidth: 140, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Per ID', fieldName: 'sPerId', type: 'text', sortable: true, initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'Acct ID', fieldName: 'sAccId', type: 'text', sortable: true,initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'Acct ID', fieldName: 'sAccId', type: 'multipleRow', sortable: true, initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Prem ID', fieldName: 'sPremId', type: 'text', sortable: true, initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA ID', fieldName: 'sSAId', type: 'text', sortable: true,initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' }} },    
    { label: 'SA ID', fieldName: 'sSAId', type: 'multipleRow', sortable: true, initialWidth: 100, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA Type', fieldName: 'sSAType', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'SA Type', fieldName: 'sSAType', type: 'multipleRow', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'SA Status', fieldName: 'sSAStatus', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'SA Status', fieldName: 'sSAStatus', type: 'multipleRow', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Res/Non Res', fieldName: 'sResNonRes', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Discount', fieldName: 'sDiscount', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    //{ label: 'Rate', fieldName: 'sRate', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} },
    { label: 'Rate', fieldName: 'sRate', type: 'multipleRow', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Service Address', fieldName: 'sSvcAddr', type: 'text', initialWidth: 150, wrapText: true, sortable: true, typeAttributes: { label: { fieldName: 'sSvcAddr' } }, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Facility/Housing Org', fieldName: 'sFacilityName', type: 'text',wrapText: true, sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'FH Type', fieldName: 'sFHType', type: 'text', sortable: true, initialWidth: 10, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Space Unit', fieldName: 'sSpaceUnit', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' } } },
    { label: 'Probation', fieldName: 'sProbation', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' }} }
    //{ label: 'Probation', fieldName: 'sProbation', type: 'text', sortable: true, cellAttributes: { class: { fieldName: 'classCustomCss' } } }
];



export default class Care_App extends LightningElement {
    @track searchData = null;
    @track searchDataSliced = null;
    @track columns = columns;
    @track columnsNonRes = columnsNonRes;
    @track errorMsg = '';
    sHistoryRefresh = 'firstCall';
    fixedHeight = 'slds-table slds-table_bordered slds-table_resizable-cols fixedHeight';
    //@track strSearchAccName;// to be removed
    @track selectedRows1 = [];
    @track selectedRowsId = '';
    @track searchInput = {
        sAccountID: '',
        sPersonID: '',
        sPremiseID: '',
        bInactiveCustomer: false,
        sSAID: '',
        sName: '',
        sPhone: '',
        sStreet: '',
        sCity: '',
        sZip: '',
        sSpace: '',
        bNPFacilityType: false,
        bAGRFacilityType: false,
        bMFHCFacilityType: false,
        bSMFacilityType: false,
        sFacilityHousingOrgVal: '',
        bEnrolledTenant: false,
        bProbation: false
    };
    //@track showLoadingSpinner = false;
    @track personIdList = [];
    @track page = 1; //this is initialize for 1st page
    @track startingRecord = 1; //start record position per page
    @track endingRecord = 0; //end record position per page
    @track pageSize = 10; //default value we are assigning
    @track totalRecountCount = 0; //total record count received from all retrieved records
    @track totalPage = 0; //total number of page is needed to display all records
    @api bCustomerDetailFlag = false;
    @api sSelectedPersonId;
    @api listSelectedPremId;
    listActiveSections = ["SearchForm"];
    sSelectedEIAccountId = '';
    sSelectedBillingAccId = '';
    sSelectedCustName = '';
    sSelectedProbStatus = false;
    sSelectedEIAccountEmail = '';
    @api bCallFromModal = false;
    sortedBy = 'sPremId';
    sortedDirection = 'asc';
    @track maskedPhone;
    @track sPevAppId;  //use this to dynamically set whenever tab is clicked | SKMN
    @api bResCustomerTab;
    @api bCsrProfileFlag;
    bTenantAdd = false;
    bTenantEnrollButton = false;
    sOldTenantName = '';

    @track showLoadingSpinner = true;
    initialized = false;
    facilityHousingValues = [];
    allFacilityHousingValues = [];
    npFacilityHousingValues = [];
    agrFacilityHousingValues = [];
    mfhcFacilityHousingValues = [];
    smFacilityHousingValues = [];
    sSelectedFacilityId = '';
    sSelectedFacilityType = '';
    sSelectedTenantId = '';
    sSelectedTenantTabId = '';
    bNonResDetailSearchVisibility = true;
    @track searchListCustom = [];

    _wiredFacHousingOrg;

    label = {
        SearchFieldMissingMsg,
        InvalidPersonIdMsg,
        InvalidFacilityIdMsg,
        CARE_NoCitySearchAllowMsg,
        CARE_ValidValuesMsg,
        CARE_RecordsCustNotFound
    };

    showToast(msg) {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: msg,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    handleSectionToggle(event) {
        this.listActiveSections = event.detail.openSections;
    }

    keyCheckSearch(event){ // STY-04324 New method to call on enter button submission
        if (event.which == 13){
            this.handleSearch();
        }
    }

    //////////////////
    //On selecting the record from the child lwc (same used in different place), 
    //the values are captured in the specific track fields.
    //The 'name' attribute is used to identify the controlling fields in the parent lwc
    handleRecordSelection(event) {
        let elemName = event.target.name;
        console.log("event", event);
        switch (elemName) {
            case 'accountField':
                this.searchInput.sAccountID = event.detail.trim();
                break;
            case 'SAIDField':
                this.searchInput.sSAID = event.detail.trim();
                break;
            case 'personField':
                this.searchInput.sPersonID = event.detail.trim();
                break;
            case 'premiseField':
                this.searchInput.sPremiseID = event.detail.trim();
                break;
            default:
        }
    }

    //On typing in the field from the child lwc (same used in different place), 
    //the values are captured in the specific track fields.
    //The 'name' attribute is used to identify the controlling fields in the parent lwc
    handletyping(event) {
        let elemName = event.target.name;
        
        switch (elemName) {
            case 'accountField':
                this.searchInput.sAccountID = event.detail.trim();
                break;
            case 'SAIDField':
                this.searchInput.sSAID = event.detail.trim();
                break;
            case 'personField':
                this.searchInput.sPersonID = event.detail.trim();
                break;
            case 'premiseField':
                this.searchInput.sPremiseID = event.detail.trim();
                break;
            default:
        }

    }

    //On focusout from the field (other than child lwc), the values are captured in the specific track fields.
    //The 'data-id' attribute is used to identify the controlling fields in the parent lwc
    handleChange(event) {
        var value;
        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value.trim();
        }

        let datasetId = event.target.dataset.id;
        switch (datasetId) {
            case 'custNameField':
                this.searchInput.sName = value;
                break;
            case 'phoneField':
                //this.searchInput.sPhone = value;
                this.maskedPhone = phoneMask(value);
                break;
            case 'streetField':
                this.searchInput.sStreet = value;
                break;
            case 'spaceField':
                this.searchInput.sSpace = value;
                break;
            case 'cityField':
                this.searchInput.sCity = value;
                break;
            case 'zipField':
                this.searchInput.sZip = value;
                break;
            /*case 'facilityField':
                this.searchInput.sFacilityHousing = value;
                break;*/
            case 'inactiveCustField':
                this.searchInput.bInactiveCustomer = value;
                break;
            case 'probationField':
                this.searchInput.bProbation = value;
                break;
            case 'enrolledTenField':
                this.searchInput.bEnrolledTenant = value;
                break;
            /*case 'mfhcField':
                this.searchInput.bMFHC = value;
                break;*/
            default:
        }
    }

    get showCustomerList() {
        return this.searchData.length > 0;
    }

    setFreshSearchForm() {
        this.bCustomerDetailFlag = false; //hide customer details section
        this.listActiveSections = ['SearchForm'];
        this.searchData = [];
        this.template.querySelector(".setCustomerListIdClass").style.visibility = "hidden";
        if (this.bResCustomerTab) {
            this.template.querySelector(".setCustomerDetailIdClass").style.visibility = "hidden";
        }
        this.sHistoryRefresh = new Date().toLocaleString();
        //this.sSelectedFacilityId = '';
        this.sSelectedTenantId = '';
        this.sSelectedPersonId = '';
        this.sSelectedTenantTabId = '';
    }

    handleEnterKeySearch(event){
       this.handleSearch();
         
    }

    handleSubmitButtonSearch(){
        this.handleSearch();
    }

    //This method is called when Search button is clicked
    handleSearch() {

        this.setFreshSearchForm();
        this.bNonResDetailSearchVisibility = true;
        if (this.maskedPhone !== '' && this.maskedPhone !== undefined && this.maskedPhone !== null) {
            this.searchInput.sPhone = this.maskedPhone.replace(/\D/g, ''); //remove mask
        }
        else {
            this.searchInput.sPhone = '';
        }

        //If none of the fields are entered, throw error message
        if (this.searchInput.sAccountID === '' && this.searchInput.sPersonID === '' && this.searchInput.sPremiseID === '' && this.searchInput.sSAID === '' && this.searchInput.sName === ''
            && this.searchInput.sPhone === '' && this.searchInput.sStreet === '' && this.searchInput.sCity === '' && this.searchInput.sZip === '' && this.searchInput.sFacilityHousingOrgVal === '' && this.searchInput.sSpace === '') {
            //this.showToast("Please enter atleast one field.");
            this.showToast(this.label.SearchFieldMissingMsg);
        }
        else if (this.searchInput.sCity !== '' && (this.searchInput.sAccountID === '' && this.searchInput.sPersonID === '' && this.searchInput.sPremiseID === '' && this.searchInput.sSAID === '' && this.searchInput.sName === ''
            && this.searchInput.sPhone === '' && this.searchInput.sStreet === '' && this.searchInput.sZip === '' && this.searchInput.sFacilityHousingOrgVal === '' && this.searchInput.sSpace === '')) {
            this.showToast(this.label.CARE_NoCitySearchAllowMsg);

        } else {

            //This is to check valid values in the Child LWC (Account Id, SAID, PerID, PremID)
            let childValidFlag = true;

            this.template.querySelectorAll('c-care_-search-auto-complete').forEach(elem => {
                elem.handleSubmitFields();
                if (!elem.checkInpulValidFlag) {
                    childValidFlag = false;
                }

            });

            //fetch the template input fields to check if all input values are valid
            const allInputValid = this.assignValidityFields();
            
            if (!allInputValid || !childValidFlag) {
                this.showToast(this.label.CARE_ValidValuesMsg);
            } else {
                this.showLoadingSpinner = true;
                console.log('this.searchInput12==>' + JSON.stringify(this.searchInput));

                getCustomerList({ searchDetails: this.searchInput })
                    .then(result => {
                        console.log('result==>' + JSON.stringify(result));
                        if (result.success) {
                            this.searchData = result.listCustomers;

                            /*Start: For multiple row, split the values and display in custom sarch datatable*/
                            this.searchData = [];
                            this.searchListCustom = [];
                            result.listCustomers.forEach(element => {
                                let searchObj = { ...element };
                                searchObj.sAccId = (searchObj.sAccId !=undefined)?{ displayText: searchObj.sAccId.split("@#@") }:{ displayText:['']};
                                searchObj.sSAId = (searchObj.sSAId !=undefined)?{ displayText: searchObj.sSAId.split("@#@") }:{ displayText:['']};
                                searchObj.sSAType = (searchObj.sSAType !=undefined)?{ displayText: searchObj.sSAType.split("@#@") }:{ displayText:['']};
                                searchObj.sSAStatus = (searchObj.sSAStatus !=undefined)?{ displayText: searchObj.sSAStatus.split("@#@") }:{ displayText:['']};
                                searchObj.sRate = (searchObj.sRate !=undefined)?{ displayText: searchObj.sRate.split("@#@") }:{ displayText:['']};
                                this.searchListCustom.push(searchObj);
                            });
                            this.searchListCustom = [...this.searchListCustom];
                            this.searchData = this.searchListCustom;
                            if(this.searchData.length > 2){
                                this.fixedHeight = 'slds-table slds-table_bordered slds-table_resizable-cols fixedHeight';
                            }else{
                                this.fixedHeight = 'slds-table slds-table_bordered slds-table_resizable-cols';
                            }
                            /*End: For multiple row, split the values and display in custom sarch datatable*/

                            /*this.totalRecountCount = this.searchData.length;
                            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
                            //slice will take 0th element and ends with 5, but it doesn't include 5th element
                            //so 0 to 4th rows will be display in the table
                            this.searchDataSliced = this.searchData.slice(0, this.pageSize);
                            this.endingRecord = this.pageSize;
                            */
                            this.showLoadingSpinner = false;
                            this.listActiveSections = ['SearchForm', 'CustomerList'];
                            this.template.querySelector(".setCustomerListIdClass").style.visibility = "visible";
                            /*Start: For css of Tenant rows */
                            let dataTableGlobalStyle = document.createElement('style');
                            dataTableGlobalStyle.innerHTML = `                                        
                                                            .tenantBgClass{                                            
                                                                color: blue !important;
                                                            } 
                                                            `;
                            document.head.appendChild(dataTableGlobalStyle);
                            /*End: For css of Tenant rows */
                        }
                        else {
                            this.error = (result.errorMessage !== '') ? result.errorMessage : "There is some technical error. Please try after sometime.";
                            this.showToast(error.body.message);
                            this.searchData = null;
                            this.showLoadingSpinner = false;
                            this.template.querySelector(".setCustomerListIdClass").style.visibility = "hidden";

                        }
                    })
                    .catch(error => {
                        this.error = error.body.message;
                        this.showToast(error.body.message);
                        this.searchData = null;
                        this.showLoadingSpinner = false;
                    });
            }
        }
    }

    assignValidityFields() {
        const allInputValidForm = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        return allInputValidForm;
    }

    //This method is called when Clear button is clicked
    @api handleClear() {
        //This is to clear all the input fields (text and checkbox)
        this.template.querySelectorAll('lightning-input').forEach(elem => {
            if (elem.type === 'checkbox') {
                elem.checked = false;
            } else {
                //UI fields
                elem.value = '';
            }
            elem.setCustomValidity("");
        });
        //This is to clear all the picklist
        this.template.querySelectorAll('lightning-combobox').forEach(elem => {
            elem.value = null;
        });

        this.assignValidityFields();


        //This is to clear the Child LWC (Account Id, SAID, PerID, PremID)
        this.template.querySelectorAll('c-care_-search-auto-complete').forEach(elem => {
            elem.handleClearFields();

        });
        //Actual fields
        this.searchInput = {
            sAccountID: '',
            sPersonID: '',
            sPremiseID: '',
            bInactiveCustomer: false,
            sSAID: '',
            sName: '',
            sPhone: '',
            sStreet: '',
            sCity: '',
            sZip: '',
            sSpace: '',
            bNPFacilityType: false,
            bAGRFacilityType: false,
            bMFHCFacilityType: false,
            bSMFacilityType: false,
            sFacilityHousingOrgVal: '',
            bEnrolledTenant: false,
            bProbation: false
        };
        this.maskedPhone = '';
        this.setFreshSearchForm();

        this.template.querySelectorAll('.inputFacilityHousingOrg').forEach(elem => {
            elem.value = '';
        });
    }

    //Pagination: Start

    //clicking on previous button this method will be called
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if ((this.page < this.totalPage) && this.page !== this.totalPage) {
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);
        }
    }
    //this method displays records page by page
    displayRecordPerPage(page) {
        /*let's say for 2nd page, it will be => "Displaying 6 to 10 of 23 records. Page 2 of 5"
        page = 2; pageSize = 5; startingRecord = 5, endingRecord = 10
        so, slice(5,10) will give 5th to 9th records.
        */
        this.startingRecord = ((page - 1) * this.pageSize);
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount)
            ? this.totalRecountCount : this.endingRecord;

        this.searchDataSliced = this.searchData.slice(this.startingRecord, this.endingRecord);
        console.log('this.searchDataSliced', this.searchDataSliced);
        // this.dgdata1  = this.dgdata.slice(this.startingRecord, this.endingRecord);
        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }
    //Pagination: End




    //On row selection pass the Id to the child lwc for fetching the history record
    handleRowSelection(event) {
        let stringId = '';
        let listPersonId = [];
        let listFacilityId = [];
        let listFacilityIdUnique = [];
        let listTenantId = [];
        let listTenantIdUnique = [];
        let listPremId = []
        let listPersonIdUnique = [];
        let selectedRows = event.detail.selectedRows;
        this.bNonResDetailSearchVisibility = true;
        for (let cnt = 0; cnt < selectedRows.length; cnt++) {
            listPersonId.push(selectedRows[cnt].sPerId);
            listPremId.push(selectedRows[cnt].sPremId);
            listFacilityId.push(selectedRows[cnt].sFacilityId);
            listTenantId.push(selectedRows[cnt].sTenantId);
        }
        this.bCustomerDetailFlag = selectedRows.length > 0 ? true : false;
        listPersonIdUnique = listPersonId.filter((item, i, ar) => ar.indexOf(item) === i);
        listFacilityIdUnique = listFacilityId.filter((item, i, ar) => ar.indexOf(item) === i);
        listTenantIdUnique = listTenantId.filter((item, i, ar) => ar.indexOf(item) === i);
        if (listPersonIdUnique.length > 1 && this.bResCustomerTab) {
            this.bCustomerDetailFlag = false;
            //this.showToast("You can't select this SAID as it belongs to different Person ID. Please do reselection of all records of same person");
            this.showToast(this.label.InvalidPersonIdMsg);
        }

        this.sSelectedPersonId = listPersonIdUnique[0];
        if (selectedRows.length > 0) {
            this.sSelectedEIAccountId = selectedRows[0].sEIAccountId;
            //this.sSelectedBillingAccId = selectedRows[0].sAccId;
            this.sSelectedCustName = selectedRows[0].sCustName;
            this.sOldTenantName = selectedRows[0].sCustName;
            this.sSelectedProbStatus = (selectedRows[0].sProbation == "Y") ? true : false;
            this.sSelectedEIAccountEmail = selectedRows[0].sEIAccountEmail;
            this.sSelectedFacilityId = (selectedRows[0].sFacilityId != undefined && selectedRows[0].sFacilityId != '') ? selectedRows[0].sFacilityId : '';
            this.sSelectedFacilityType = selectedRows[0].sFHType;
            this.sSelectedTenantId = (selectedRows[0].sTenantId != undefined && selectedRows[0].sTenantId != '') ? selectedRows[0].sTenantId : '';
            this.sSelectedTenantTabId = (selectedRows[0].sTenantId != undefined && selectedRows[0].sTenantId != '') ? selectedRows[0].sTenantId : '';
            let billingAccountTemp = selectedRows[0].sAccId;
            if(billingAccountTemp !='' && billingAccountTemp !=undefined){
                if(billingAccountTemp.displayText !=undefined){
                    this.sSelectedBillingAccId = billingAccountTemp.displayText[0];
                }else{
                    this.sSelectedBillingAccId = billingAccountTemp;
                }
            }else{
                this.sSelectedBillingAccId = '';
            }
           
        } else {
            this.sSelectedFacilityId = '';
            this.sSelectedTenantId = '';
            this.sSelectedTenantTabId = '';
        }

        if (this.sSelectedPersonId != undefined && this.sSelectedPersonId.length < 10 && this.bResCustomerTab) {
            this.bCustomerDetailFlag = false;
            this.showToast("This Action is not allowed on Residential tab");
            // this.showToast(this.label.InvalidPersonIdMsg);
        }

        if (!this.bResCustomerTab) {
            this.bNonResDetailSearchVisibility = false;
            if (listFacilityIdUnique.length > 1) {
                this.showToast(this.label.InvalidFacilityIdMsg);
            } else if (listTenantIdUnique.length > 1) {
                this.showToast("You can't select this SAID as it belongs to different Tenant ID. Please do reselection of all records of same tenant");
            }/*else if(this.sSelectedTenantId =='' && this.sSelectedFacilityId ==''){
                this.showToast("Please do reselection either valid tenant or valid facility");
            }*/else {
                this.bNonResDetailSearchVisibility = true;
            }

        }


        this.listSelectedPremId = listPremId.filter((item, i, ar) => ar.indexOf(item) === i);
        this.listActiveSections = ["SearchForm", "CustomerList", "CustomerDetails"];
        if (this.bResCustomerTab) {
            this.template.querySelector(".setCustomerDetailIdClass").style.visibility = (this.bCustomerDetailFlag) ? "visible" : "hidden";
        }


    }

    refreshTabData(event) {
        if (event.target.label == 'History' || event.target.label == 'Housing Org' || event.target.label == 'Enroll' || event.target.label == 'SM Facility' || event.target.label == 'Tenant') {
            //this.template.querySelector("c-care_-history").refreshData();
            this.sHistoryRefresh = new Date().toLocaleString();
           if(!this.bResCustomerTab){ 
                if(event.target.label == 'Tenant'){
                    this.sSelectedTenantId = ''; // for tenant tab
                }else if((event.target.label == 'Enroll' || event.target.label == 'History' || event.target.label == 'SM Facility') && this.sSelectedTenantTabId !='' && this.sSelectedTenantTabId !=undefined){
                   if(!this.bTenantEnrollButton){
                    this.sSelectedTenantId =  this.sSelectedTenantTabId;
                   }
                   this.bTenantAdd = false;
                   this.bTenantEnrollButton = false;
                }
           }

        }
        //Refresh the sPevAppId to send back to child via s-selected-app-id attribute, whenver PEV tab is clicked, else with blank | SKMN
        if (event.target.label == 'PEV') {
            this.sPevAppId = 'tab';
            this.sHistoryRefresh = new Date().toLocaleString();
        }
        else {
            this.sPevAppId = '';
        }
    }

    historyTabRefreshFromChild(event) {
        if (event.detail == 'History') {
            this.sHistoryRefresh = new Date().toLocaleString();
        }

    }



    // The method onsort event handler
    updateColumnSorting(event) {
        let fieldName = event.detail.fieldName;
        let sortDirection = event.detail.sortDirection;
        // assign the latest attribute with the sorted column fieldName and sorted direction
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.sortData(fieldName, sortDirection);
    }

    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.searchData));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1 : -1;
  
       if(fieldname == 'sAccId' || fieldname == 'sSAId' || fieldname == 'sSAType' || fieldname == 'sSAStatus' || fieldname == 'sRate') {
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
    
                y = keyValue(y) ? keyValue(y) : ''; // sorting values based on direction
    
                return isReverse * ((x.displayText[0] > y.displayText[0]) - (y.displayText[0] > x.displayText[0]));
            }); // set the sorted data to data table data

       }else{
        // sorting data 
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
                y = keyValue(y) ? keyValue(y) : '';

                // sorting values based on direction
                return isReverse * ((x > y) - (y > x));
            });
       }



        // set the sorted data to data table data
        this.searchData = parseData;

    }

    /**** */
    renderedCallback() {
        //console.log('this.facilityHousingValues-->' + JSON.stringify(this.facilityHousingValues));
        console.log('this.initialized' + this.initialized);

        if (this.facilityHousingValues === null || this.facilityHousingValues === undefined
            || (isNotBlank(this.facilityHousingValues) && this.facilityHousingValues.length > 0)
            || this.initialized) {
            return;
        }
        this.initialized = true;
        if(this.bResCustomerTab ===false){ // STY-04324 To avoid set facility data
        let listId = this.template.querySelector('datalist').id;
        this.template.querySelector("input").setAttribute("list", listId);
        }

    }

    @wire(getFacilityHousingOrg, { bResCustomerTab: '$bResCustomerTab' })
    wiredFacHousingOrg(resp) {
        this.showLoadingSpinner = true;
        this._wiredFacHousingOrg = resp;
        const { data, error } = resp;

        if (data) {
            //Assign in local variable
            this.allFacilityHousingValues = data.listAllFacility;
            this.npFacilityHousingValues = data.listNPFacility;
            this.agrFacilityHousingValues = data.listAGRFacility;
            this.mfhcFacilityHousingValues = data.listMFHCFacility;
            this.smFacilityHousingValues = data.listSMFacility;

            //Assign ALL in list options
            this.facilityHousingValues = this.allFacilityHousingValues;

            this.showLoadingSpinner = false;
        } else if (error) {
            //this.error = error;
            //this.data = undefined;
            //this.showLoadingSpinner = false;
            console.log('this.error-->' + error)
            //this.showToastMessage(this.label.CARE_ErrorHeader, this.label.CARE_TransactionErrorMsg, 'error');

            this.showLoadingSpinner = false;
        }

        //this.template.querySelector(".slds-tabs_default__item").forEach({}).classList.add('setCustomDisablilityClass');//??
        this.template.querySelectorAll('.slds-tabs_default__item').forEach(elem => {
            if (elem.title === 'Enroll') {
                elem.classList.add('setCustomDisablilityClass');
            }
        });
    }

    //Function called from each of lightning input fields of facility checkboxes
    handleChangeFacility(event) {
        let value;
        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }
        if (event.target.dataset.id === 'checkboxNPField') {
            this.searchInput.bNPFacilityType = value;
        } else if (event.target.dataset.id === 'checkboxAGRField') {
            this.searchInput.bAGRFacilityType = value;
        } else if (event.target.dataset.id === 'checkboxMFHCField') {
            this.searchInput.bMFHCFacilityType = value;
        } else if (event.target.dataset.id === 'checkboxSMField') {
            this.searchInput.bSMFacilityType = value;
        }

        //Re-populate Facility Housing Org Dropdown
        this.populateFacilityHousingOrgDD();
    }

    //Function called from facility housing org picklist
    handleSelectFacility(event) {
        this.searchInput.sFacilityHousingOrgVal = event.target.value;
        let listFac = [];
        listFac = this.facilityHousingValues.reduce((a, o) => (o.sFacilityName == this.searchInput.sFacilityHousingOrgVal && a.push({ 'id': o.sId, 'type': o.sFacilityType }), a), []);
        this.sSelectedFacilityId = '';
        if (listFac.length > 0) {
            this.sSelectedFacilityId = listFac[0].id;
            this.sSelectedFacilityType = listFac[0].type;
        }
    }

    //method to populate Facility Housing Org
    populateFacilityHousingOrgDD() {
        //Clear the selected value
        this.searchInput.sFacilityHousingOrgVal = '';
        this.template.querySelectorAll('.inputFacilityHousingOrg').forEach(elem => {
            elem.value = '';
        });
        this.facilityHousingValues = []; //Clear the existing values

        //If all checkboxes are unchecked, populate with ALL
        if (!this.searchInput.bNPFacilityType && !this.searchInput.bAGRFacilityType && !this.searchInput.bMFHCFacilityType && !this.searchInput.bSMFacilityType) {
            this.facilityHousingValues = this.allFacilityHousingValues;
        }
        //Else Merge with the selected list of values against each checkbox
        else {
            if (this.searchInput.bNPFacilityType) {
                this.facilityHousingValues = this.sortList(this.facilityHousingValues.concat(this.npFacilityHousingValues));
            }
            if (this.searchInput.bAGRFacilityType) {
                this.facilityHousingValues = this.sortList(this.facilityHousingValues.concat(this.agrFacilityHousingValues));
            }
            if (this.searchInput.bMFHCFacilityType) {
                this.facilityHousingValues = this.sortList(this.facilityHousingValues.concat(this.mfhcFacilityHousingValues));
            }
            if (this.searchInput.bSMFacilityType) {
                this.facilityHousingValues = this.sortList(this.facilityHousingValues.concat(this.smFacilityHousingValues));
            }
        }
    }

    //Sort the list in alphabetical order
    sortList(nonSortedList) {
        const sortedList = nonSortedList.sort(function (a, b) {
            if (a.sFacilityName < b.sFacilityName) return -1;
            else if (a.sFacilityName > b.sFacilityName) return 1;
            return 0;
        });
        console.log(sortedList);
        return sortedList;
    }
    /**** */
    get checkTenantId() {
        return this.sSelectedTenantId != '' && this.sSelectedTenantId != undefined && this.sSelectedBillingAccId !='' && this.sSelectedBillingAccId != undefined;
    }

    get checkTenantFacilityId() {
        return this.sSelectedFacilityId != '' && this.sSelectedFacilityId != undefined && this.sSelectedFacilityType =='SM';
    }

    get checkSMFacilityId(){
        return (this.sSelectedFacilityId != '' && this.sSelectedFacilityId != undefined && this.sSelectedFacilityType !='SM') ;
    }

    goToTenantTab(event){
        this.bTenantAdd = true;
        this.sSelectedFacilityId = event.detail.idFacilityId; //receives the Facility Id from child
        this.template.querySelector('lightning-tabset').activeTabValue = 'tenant';
        this.sHistoryRefresh = new Date().toLocaleString();
        
    }

    goToEnrollTab(event){
        this.bTenantEnrollButton = true;
        this.sSelectedFacilityId = event.detail.idFacilityId; //receives the Facility Id from child
        this.sSelectedTenantId = event.detail.idTenantId; //receives the Tenant Id from child
        //this.sSelectedCustName = event.detail.sTenantName; //receives the Tenant Name from child
        this.template.querySelector('lightning-tabset').activeTabValue = 'enrollNonRes';
        this.sHistoryRefresh = new Date().toLocaleString();
        
    }
}