"use strict";

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', function () {
    return load_mailbox('inbox');
  });
  document.querySelector('#sent').addEventListener('click', function () {
    return load_mailbox('sent');
  });
  document.querySelector('#archived').addEventListener('click', function () {
    return load_mailbox('archive');
  });
  document.querySelector('#compose').addEventListener('click', compose_email); // attaching event listener to s'more buttoonz
  // By default, load the inbox

  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#show-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block'; // Clear out composition fields

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  $('#compose-form').submit(function (e) {
    send_email();
    return false;
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#show-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none'; // Show the mailbox name

  document.querySelector('#emails-view').innerHTML = "<h3>".concat(mailbox.charAt(0).toUpperCase() + mailbox.slice(1), "</h3>"); // case statement load emails

  switch (mailbox) {
    case "sent":
      fetch('/emails/sent').then(function (response) {
        return response.json();
      }).then(function (emails) {
        emailEntries = document.createElement("div");
        emails.forEach(function (email) {
          var emailEntry = createEmailEntry(email);
          emailEntry.classList.add("sent");
          emailEntries.appendChild(emailEntry);
        });
        document.querySelector("#emails-view").appendChild(emailEntries);
      });
      break;

    case "inbox":
      fetch('/emails/inbox').then(function (response) {
        return response.json();
      }).then(function (emails) {
        emailEntries = document.createElement("div");
        emails.forEach(function (email) {
          var emailEntry = createEmailEntry(email);
          emailEntry.classList.add("inbox");
          emailEntry.addEventListener('click', function () {
            showEmail(email);
          });
          emailEntries.appendChild(emailEntry);
        });
        document.querySelector("#emails-view").appendChild(emailEntries);
      });
      break;

    case "archive":
      fetch('/emails/archive').then(function (response) {
        return response.json();
      }).then(function (emails) {
        console.log(emails);
        emailEntries = document.createElement("div");
        emails.forEach(function (email) {
          var emailEntry = createEmailEntry(email);
          emailEntry.classList.add("archive");
          emailEntries.appendChild(emailEntry);
        });
        document.querySelector("#emails-view").appendChild(emailEntries);
      });
      break;
  }
}

function send_email() {
  // try to submit email if user doesn't exist print error
  // else redirect to inbox 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  }).then(function (response) {
    return response.json();
  }).then(function (result) {
    if (result.error) {
      console.log(result.error);
      var error = document.createElement('h1');
      error.innerHTML = result.error;
      document.querySelector('#compose-view').append(error);
    } else {
      load_mailbox('sent');
    }
  });
}

var createEmailEntry = function createEmailEntry(email) {
  var entry = document.createElement("div");

  if (email.read) {
    entry.classList.add("read");
  }

  entry.innerText = "".concat(email.sender, " - ").concat(email.subject, " - ").concat(email.timestamp); // create link to show page

  return entry;
};

var showPage = function showPage(email) {
  markAsRead(email); // mark email as read
  // clear previous email entry

  var showView = document.getElementById('show-view');
  showView.innerHTML = ""; // build the show page

  var emailFull = document.createElement("ul");
  var subject = document.createElement("li");
  subject.innerHTML = email.subject;
  var recipients = document.createElement("li");
  recipients.innerHTML = email.recipients;
  var body = document.createElement("li");
  body.innerHTML = email.body;
  emailFull.appendChild(recipients);
  emailFull.appendChild(subject);
  emailFull.appendChild(body); // link to reply method
  // to do

  showView.appendChild(replyButton(email));
  showView.appendChild(archive_button(email));
  showView.appendChild(emailFull);
};

var showEmail = function showEmail(email) {
  // hide both views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none'; // display email show-view

  document.querySelector('#show-view').style.display = 'block';
  entry = showPage(email);
};

var archive_button = function archive_button(email) {
  var archiveButton = document.createElement("button");

  if (!email.archived) {
    archiveButton.innerText = "Archive";
    archiveButton.addEventListener('click', function () {
      fetch("/emails/".concat(email.id), {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }).then(load_mailbox("archive"));
    });
  } else {
    archiveButton.innerText = "Unarchive";
    archiveButton.addEventListener('click', function () {
      fetch("/emails/".concat(email.id), {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      }).then(load_mailbox("archive"));
    });
  }

  return archiveButton;
};

var markAsRead = function markAsRead(email) {
  fetch("/emails/".concat(email.id), {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
};

var replyButton = function replyButton(email) {// reformat email data to prefill data
  // load compose view with prefill data
};