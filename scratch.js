const baseApiUrl = "http://localhost:8080/api/"
const learnerList = [];
const ticketList = [];

// J'ai complété ma liste déroulante avec les learners qui viennent de l'API.
fetch(baseApiUrl + "learners")
    .then(response => response.json())
    .then(learners => {
        for (const learner of learners) {
            const option = document.createElement("option");
            option.textContent = learner.firstName;
            option.value = learner.id;

            document.getElementById("input-name").appendChild(option);

            learnerList.push(learner);
        }
        getTicketListFromAPI();
    });

function getTicketListFromAPI() {
    fetch(baseApiUrl + "tickets")
        .then(response => response.json())
        .then(tickets => {
            for (const ticket of tickets) {
                // Remplissage du tableau
                createTableLine(ticket);
                ticketList.push(ticket);
            }
        });
}

function createTableLine(ticket) {
    // Je m'occupe de créer une nouvelle ligne dans le tableau
    const ligne = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.textContent = "#" + ticket.id;
    ligne.appendChild(td1);

    const td2 = document.createElement("td");
    // à changer pour avoir le prénom
    td2.textContent = learnerList.find(learner => ticket.learnerIdx === learner.id).firstName;
    // td2.textContent = learnerList.find(function (learner) {
    //     return learner.id === ticket.learnerIdx;
    // }).firstName;
    ligne.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = ticket.description;
    ligne.appendChild(td3);

    const td4 = document.createElement("td");
    td4.textContent = new Date(ticket.date).toLocaleDateString();
    ligne.appendChild(td4);

    const td5 = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "Je passe mon tour";

    button.addEventListener("click", function () {
        if (button.parentElement.parentElement.className === "line-through") {
            button.parentElement.parentElement.className = "";
            button.textContent = "Je passe mon tour";
        } else {
            button.parentElement.parentElement.className = "line-through";
            button.textContent = "Je veux mon tour";
        }
    });

    td5.appendChild(button);
    ligne.appendChild(td5);

    const table = document.getElementById("table-body");
    table.appendChild(ligne);
}

document.getElementById("help-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedLearnerIdx = document.getElementById("input-name").value;
    const ticketAlreadyPosted = ticketList.find(ticket => selectedLearnerIdx === ticket.learnerIdx);
    if (!ticketAlreadyPosted) {

        const postDetails = {
            method: "POST",
            body: JSON.stringify({
                date: new Date(),
                description: document.getElementById("input-desc").value,
                learnerIdx: selectedLearnerIdx,
                solved: false
            }),
            headers: {"Content-Type": "application/json;charset=UTF-8"}
        }

        fetch(baseApiUrl + "tickets", postDetails)
            .then(response => response.json())
            .then(ticket => createTableLine(ticket));

        // A la fin, on vide le champ input pour pouvoir mettre un nouveau nom.
        document.getElementById("input-desc").value = "";
    } else {
        alert("Tu es déjà dans la liste mon coco.");
    }
});

document.getElementById("button-next").addEventListener("click", function () {
    const nameTable = document.getElementById("table-body");

    if (nameTable.firstElementChild !== null) {
        nameTable.removeChild(nameTable.firstElementChild);
    }

    // const tableRows = document.getElementsByTagName("tr");
    // if (tableRows.length > 1)
    //     tableRows[1].remove();
});
