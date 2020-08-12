//index database, create index version of db to save the db while we are manipulating it offline 
const indexDB = window.indexedDB || 
                window.mozIndexedDB || 
                window.webkitIndexedDB || 
                window.msIndexedDB;
//declaring db to manipulate 
let db;

//asking db system to open something called budget,1
//when request function is successful, do request.onsuccess
//if error do something else
const request = indexedDB.open("budget", 1);
const objectStoreName = "pending";
//shows browser db in console

//TODO
//read up on createObjectStore
//https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
//creating db, if db out of date, manually updating with new schema or db layout

request.onupgradeneeded = function ({newData}) {
    //define database to handle all offline data into new db
    let db = newData.result
    db.createObjectStore (objectStoreName, {autoIncrement: true}) 
}

//get event listener that the db is online or offline 
//use database check function to determine whether user is online or offline
request.onsuccess = function (event){
    db = event.target.result;
    //https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
    if(navigator.online) {
        console.log("You are online.");
        dbCheck();
    } else {
        console.log("You have lost your connection");
    }
};

//handle request .onsuccess and handle request .onerror 
request.onerror = function(event) {
    console.log("Request not successful" + event.target.errorCode);
};

//need a function to save the record/transaction 
function saveRecord(record) {
    const transaction = db.transaction(objectStoreName, "readwrite");
    const store = transaction.objectStore(objectStoreName);

    store.add(record);
}
//make sure that in the .oncheck function you are saying
//say what was pending (db.transaction) 
//when the transaction is successful (.onsuccess) set that equal to a function 
//which performs post method to db.
//have another function which is the db check (26)
function dbCheck() {
    const transaction = db.transaction(objectStoreName, "readwrite");
    //https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
    //object store link
    const store = transaction.objectStore(objectStoreName);
    let allRecords = store.getAll();
   
    allRecords.onsuccess = function() {
        const recordCount = allRecords.result.length;
        console.log(allRecords.result);
        if (recordCount === 0){
            return;
        }

        //get all the records and put them in json object
        const recordsJSON = JSON.stringify(allRecords.result);

        fetch("/api/transaction/bulk", {
            method: "POST", 
            body: recordsJSON,
            headers: {
                Accept: "application/json, text/plain, */*", 
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(() => {
            cleanUpRecords(); //clean up the records using a function
        })        
    };
}

function cleanUpRecords() {
    let t = db.transaction(objectStoreName, "readwrite");
    let s = transaction.objectStore(objectStoreName);
    s.clear();
}

window.addEventListener("online", dbCheck)

