(function() {
    $(function() {
        var newItem = [{
            subject: "",
            message: "",
            author: "",
            timestamp: ""
        }];

        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB.")
        }
        var request = window.indexedDB.open("noteapp", 4);
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            var todoObj = db.createObjectStore("noteapp", {
                autoIncrement: true
            });
            todoObj.createIndex("subject", "subject", {
                unique: false
            });
            todoObj.createIndex("message", "message", {
                unique: false
            });
            todoObj.createIndex("author", "author", {
                unique: false
            });
            todoObj.createIndex("timestamp", "timestamp", {
                unique: false
            });
        };
        request.onerror = function(event) {};
        request.onsuccess = function(event) {
            db = request.result;
            displayData();
        };
    });

    $(function() {
        $('#submit').click(function(e) {
            e.preventDefault();
            var subject = $('#subject').val().trim();
            var message = $('#message').val().trim();
            var author = $('#authorname').val().trim();
            var date = new Date().toDateString().trim();

            var newItem = [{
                subject: subject,
                message: message,
                author: author,
                timestamp: date
            }];

            var transaction = db.transaction(["noteapp"], "readwrite");
            transaction.oncomplete = function() {};
            transaction.onerror = function() {};
            var objectStore = transaction.objectStore("noteapp");
            var countRequest = objectStore.count();
            countRequest.onsuccess = function() {}
            var objectStoreRequest = objectStore.add(newItem[0]);
            objectStoreRequest.onsuccess = function(event) {
                var smessage = document.getElementById('smessage');
                smessage.setAttribute('class', "alert alert-success");
                smessage.innerHTML = "<strong>Note Added Succesfully!</strong> "
                setTimeout(function() {
                    smessage.removeAttribute('class', "alert alert-success");
                    smessage.innerHTML = "";

                }, 3000);

            };
            document.getElementById('subject').value = "";
            document.getElementById('message').value = "";
            document.getElementById('authorname').value = "";
            displayData();
        });
    });

    var displayData = function() {
        res();

        if (document.getElementById('resultContainer').childNodes.length > 0) {

            res(document.getElementById('resultContainer').childNodes.length);
        }
        var objectStore = db.transaction('noteapp').objectStore('noteapp');
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            var divContainer = document.createElement('div');
            divContainer.setAttribute('style', "align:center");
            var resultsWrapper = document.getElementById("resultsWrapper")
            var ran = document.getElementById('ran')
            if (cursor) {
                var tr = document.createElement('div');
                tr.setAttribute('id', cursor.key);
                tr.setAttribute('class', "flex-item");
                tr.setAttribute('style', "width:40% ");
                tr.onclick = function(event) {
                    details(event)
                }
                var td1 = document.createElement('header');

                td1.setAttribute('class', "w3-container w3-light-grey");
                td1.setAttribute('id', cursor.key);
                var td2 = document.createElement('div');
                td2.setAttribute('id', cursor.key);
                td2.setAttribute('class', "w3-container ");
                var text1 = document.createTextNode("Subject:     " + cursor.value.subject);
                td2.innerHTML = "Date:    " + cursor.value.timestamp + "<br/><br/>" + "Message Word Count:    " + cursor.value.message.trim().length;
                td2.setAttribute("style", "color:White");

                td1.appendChild(text1);
                tr.appendChild(td1);
                tr.appendChild(td2);

                divContainer.appendChild(tr);
                resultContainer.appendChild(divContainer)
                cursor.continue();
            }
            if (document.getElementById('resultContainer').childNodes.length != 0) {
                document.getElementById('title').innerHTML = "<Center><h2>Hi, you have " + (document.getElementById('resultContainer').childNodes.length) + " Note(s)</h2><Center>"
            }
        }
    }

    function res() {
        var nodes = document.getElementById('resultContainer');
        while (nodes.hasChildNodes()) {
            nodes.removeChild(nodes.childNodes[0]);
        }
    }

    function deleteItem(event, id) {

        var key = event.target.getAttribute(id);

        var transaction = db.transaction(["noteapp"], "readwrite");
        var request = transaction.objectStore("noteapp").delete(+id);

        request.onsuccess = function() {
            displayData();
            alert("Note Deleted")

        };
        setTimeout(function() {
            var dmessage = document.getElementById('dmessage');
            dmessage.setAttribute('class', "alert alert-info");
            dmessage.innerHTML = "<strong>Note Deleted Succesfully!</strong>"

        }, 5000);

    };

    function updateData(id, sub, msg, author) {
        var transaction = db.transaction(['noteapp'], 'readwrite');
        var objectStore = transaction.objectStore('noteapp');
        var objectStoreTitleRequest = objectStore.get(+id);
        objectStoreTitleRequest.onsuccess = function() {
            // Grab the data object returned as the result
            var updateData = objectStoreTitleRequest.result;

            updateData.message = msg;
            updateData.author = author;
            updateData.subject = sub;
            updateData.timestamp = new Date().toDateString();
            var updateTitleRequest = objectStore.put(updateData, +id);
            updateTitleRequest.onsuccess = function() {
                alert("Note Updated")
                displayData();
            };

            var dmessage = document.getElementById('smessage');
            dmessage.innerHTML = "<strong>Note Updated Succesfully!</strong>";
        };

    }

    function details(event) {
        event.target.setAttribute('data-toggle', "modal");
        event.target.setAttribute('data-target', "#myModal2");
        var key = event.target.getAttribute('id');
        var transaction = db.transaction(["noteapp"], "readwrite");
        var request = transaction.objectStore("noteapp").get(+key);
        request.onsuccess = function() {

            var subject2 = document.getElementById('subject2');
            subject2.setAttribute('value', request.result.subject);
            var message2 = document.getElementById('message2');
            message2.value = request.result.message;
            var authorname2 = document.getElementById('authorname2');
            authorname2.setAttribute('value', request.result.author);
            deleteButton = document.getElementById('delete')
            deleteButton.onclick = function(event) {
                deleteItem(event, key);
            }
            updateButton = document.getElementById('update')
            updateButton.onclick = function() {
                updateData(key, subject2.value, message2.value, authorname2.value)
            }

        }
    }


})();
