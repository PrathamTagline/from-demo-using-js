const form = document.getElementById("dataForm");
const tableID = "dataTable";
const tableBody = document.querySelector(`#${tableID} tbody`);
const state = document.getElementById("state");
const city = document.querySelector("#city select");
const userid = "userID";
const userdata = "userData";
const gender = "gender";
const userHobbies = "hobbies";
const edit = "edit";
const deleted = "delete";
const cityID = "city";
const searchtextID = "search"
const disabledOption = "<option disabled selected value>---- select city ----</option>";
let td = `<td><button class="${edit}" value=${edit}>${edit}</button>
        <button class="${deleted}" value=${deleted}>${deleted}</button></td>`;


let userDB = [];
let userIdCounter = 1;
let exitedUserID = -1;

let stateCities = {
    "Gujarat": ["ahmedabad", "surat", "bharuch", "navsari"],
    "Panjab": ["Mohali", "Ludhiana", "Amritsar"]
};

state.addEventListener("change", () => {
    currentstate = state.value;
    const arr = stateCities[`${currentstate}`].sort();
    let optionList = disabledOption;
    for (let i = 0; i < arr.length; i++) {
        cityOption = `<option id="${arr[i]}" value="${arr[i]}">${arr[i]}</option>`;
        optionList += cityOption;
    }
    const newselect = document.createElement("select")
    newselect.innerHTML = optionList;
    document.getElementById(cityID).innerHTML = optionList;
})

form.addEventListener("submit", (event) => {
    event.preventDefault();

    let currentuserID = isIdExist(exitedUserID, userDB);
    if (currentuserID == true) {
        let UserID = exitedUserID;
        let updatedUser = addFormDataToDB(userDB);
        appendRowToTable(updatedUser);
        exitedUserID = -1;
    }
    else {
        let newUser = addFormDataToDB(userDB);
        appendRowToTable(newUser);
        form.reset();
    }
});

tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains(deleted)) {
        const row = event.target.closest("tr");
        const deleteIndex = row.rowIndex - 1;
        userDB.splice(deleteIndex, 1);
        tableBody.removeChild(row);
    }

    else if (event.target.classList.contains(edit)) {
        const row = event.target.closest("tr");
        const editedIndex = row.rowIndex - 1;

        const editedUserId = userDB[editedIndex][userid];
        exitedUserID = editedUserId;

        const editedUserData = userDB[editedIndex][userdata];
        let userDataKeys = Object.keys(editedUserData);

        const genderIndex = userDataKeys.indexOf(gender);
        userDataKeys.splice(genderIndex, 1);
        const hobbiesIndex = userDataKeys.indexOf(userHobbies);
        userDataKeys.splice(hobbiesIndex, 1);

        for (let i of userDataKeys) {
            form.querySelector(`[name="${i}"]`).value = editedUserData[`${i}`];
        }

        form.querySelector(`[name=${gender}][value="${editedUserData.gender}"]`).checked = true;

        const hobbies = form.querySelectorAll(`[name=${userHobbies}]`);
        hobbies.forEach((hobby) => {
            hobby.checked = editedUserData.hobbies.includes(hobby.value);
        });

        tableBody.removeChild(row);
    }
});

function isIdExist(ID, DB) {
    for (let i of DB.keys()) {
        if (DB[i][userid] == ID) {
            return true;
        }
    }
    return false;
}

function addFormDataToDB(DB) {
    let currentuserID = isIdExist(exitedUserID, userDB) ? exitedUserID : userIdCounter++;
    const formData = new FormData(form);
    let currentUserData = {
        userID: currentuserID,
        userData: {}
    };

    for (const [key, value] of formData.entries()) {
        currentUserData.userData[key] = value;
    }
    DB.push(currentUserData);
    return currentUserData;

}
function appendRowToTable(user) {
    let userID = user[userid];
    let userData = user[userdata];
    const newRow = document.createElement("tr");

    let tableDescriptions = `<td>${userID}</td>`;
    let userDataKeys = Object.keys(userData);

    for (let key of userDataKeys) {
        tableDescriptions += `<td>${userData[key]}</td>`;
    }

    tableDescriptions += td;

    newRow.innerHTML = tableDescriptions;
    tableBody.appendChild(newRow);
}

function tableFilter() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(searchtextID);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableID);
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}