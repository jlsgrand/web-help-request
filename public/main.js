let lastHelpRequestName = "";

// Gestion de l'ajout d'un personne dans la liste
document.getElementById("help-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Je récupère le nom de la personne qui veut de l'aide
    const name = document.getElementById("input-name").value;

    if (name !== lastHelpRequestName) {
        addToFirestore(name);
    } else {
        alert("Tu es déjà dans la liste mon coco.");
    }
});

// Gestion de la suppression d'une personne dans la liste
document.getElementById("button-next").addEventListener("click", function () {
    const nameTable = document.getElementById("table-body");
    if (nameTable.firstElementChild) {
        removeOneFromFirestore(nameTable)
    }
});

// On peut raffraîchir sans recharger la page
document.getElementById("button-refresh").addEventListener("click", function () {
    readListFromFirestore();
});

/**
 * Récupération des tickets qui ne sont pas encore passés triés par position croissante.
 * Récupération du dernier numéro de ticket
 */
function readListFromFirestore() {
    const db = firebase.firestore();

    // Récupération de tous les apprenants qui n'ont pas encore eu leur ticket.
    db.collection("tickets").where("done", "==", false).orderBy("date").get().then((querySnapshot) => {
        cleanTableInDom();
        querySnapshot.forEach((doc) => {
            createLineInDom(doc.id, doc.data().name, new Date(doc.data().date.seconds * 1000), doc.data().pass);
        });
    });

    // Récupération du dernier rentré dans la liste pour ne pas qu'il puisse se re-rentrer.
    db.collection("tickets").where("done", "==", false).orderBy("date", "desc").limit(1).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            lastHelpRequestName = doc.data().name;
        });
    });
}

/**
 * Suppression du premier apprenant dans la liste
 * @param table la table html qui contient les apprenants
 */
function removeOneFromFirestore(table) {
    const db = firebase.firestore();
    db.collection("tickets").doc(table.firstElementChild.dataset.docRef).delete().then(() => {
        table.removeChild(table.firstElementChild);
    }).catch((error) => {
        console.error("Erreur lors de la suppression d'une personne dans la liste: ", error);
    });
}

/**
 * Ajout d'un apprenant dans la BDD.
 *
 * @param name le nom à ajouter
 */
function addToFirestore(name) {
    const creationDate = new Date();
    const db = firebase.firestore();

    db.collection("tickets").add({
        date: creationDate,
        name: name,
        pass: false,
        done: false
    }).then((docRef) => {
        createLineInDom(docRef.id, name, creationDate, false)
        // Je met à jour le lastHelpRequestName
        lastHelpRequestName = name;

        // A la fin, on vide le champ input pour pouvoir mettre un nouveau nom.
        document.getElementById("input-name").value = "";
    }).catch((error) => {
        console.error("Erreur lors de la sauvegarde Firestore: ", error);
    });
}

/**
 * Fonction mettant à jour la propriété pass d'un élément de la BDD.
 *
 * @param button le bouton à changer
 * @param docRef l'identifiant de l'élément firestore à MàJ
 * @param pass la valeur de l'attribut pass
 */
function setPassToTicketInFirestore(button, docRef, pass) {
    const db = firebase.firestore();

    db.collection("tickets").doc(docRef).update({
        pass: pass
    }).then(() => {
        setPassStyle(pass, button);
    }).catch((error) => {
        // The document probably doesn't exist.
        console.error("Erreur lors de la modification d'un élément: ", error);
    });
}

/**
 * Fonction d'ajout d'un nouveau ticket dans le tableau.
 *
 * @param docRef l'ID du doc créé dans Firestore (à garder pour les updates)
 * @param name le nom de l'apprenant.e
 * @param date la date d'inscription
 * @param pass "je passe mon tour"
 */
function createLineInDom(docRef, name, date, pass) {
    // Création de la nouvelle ligne
    const line = document.createElement("tr");
    line.dataset.docRef = docRef;
    line.dataset.pass = pass;

    // Cellule 1 : nom
    const td1 = document.createElement("td");
    td1.textContent = name;
    line.appendChild(td1);

    // Cellule 2 : date
    const td2 = document.createElement("td");
    td2.textContent = date.toLocaleString();
    line.appendChild(td2);

    // Cellule 3 : bouton "je passe mon tour"
    const td3 = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "Je passe mon tour";

    button.addEventListener("click", function () {
        let pass = (line.dataset.pass === "true");
        pass = !pass;
        line.dataset.pass = pass;
        setPassToTicketInFirestore(button, line.dataset.docRef, pass);
    });

    td3.appendChild(button);
    line.appendChild(td3);

    const table = document.getElementById("table-body");
    table.appendChild(line);

    setPassStyle(pass, button);
}

/**
 * Fonction de nettoyage de la table HTML
 */
function cleanTableInDom() {
    const nameTable = document.getElementById("table-body");
    while (nameTable.firstElementChild) {
        nameTable.removeChild(nameTable.firstElementChild);
    }
}

/**
 * Fonction utilisée pour mettre la ligne passée en barrée
 * @param pass le paramètre pour barrer ou débarrer
 * @param button le bouton à gérer
 */
function setPassStyle(pass, button) {
    if (!pass) {
        button.parentElement.parentElement.className = "";
        button.textContent = "Je passe mon tour";
    } else {
        button.parentElement.parentElement.className = "line-through";
        button.textContent = "Je veux mon tour";
    }
}