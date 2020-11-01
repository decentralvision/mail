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
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById('compose-form').addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();
    send_email();
  }); // By default, load the inbox

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
          emailEntries.appendChild(emailEntry);
        });
        document.querySelector("#emails-view").appendChild(emailEntries);
      });
      break;

    case "archive":
      fetch('/emails/archive').then(function (response) {
        return response.json();
      }).then(function (emails) {
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
      var error = document.createElement('h1');
      error.innerHTML = result.error;
      document.querySelector('#compose-view').append(error);
      return false;
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

  entry.addEventListener('click', function () {
    showEmail(email);
  });
  return entry;
};

var showPage = function showPage(email) {
  markAsRead(email); // mark email as read
  // clear previous email entry

  var showView = document.getElementById('show-view');
  showView.innerHTML = ""; // build the show page

  var emailFull = document.createElement("ul");
  var subject = document.createElement("li");
  subject.innerHTML = "Subject: ".concat(email.subject);
  var recipients = document.createElement("li");
  recipients.innerHTML = "Recipients: ".concat(email.recipients);
  var sender = document.createElement("li");
  sender.innerHTML = "Sender: ".concat(email.sender);
  var body = document.createElement("li");
  body.innerHTML = "Body: ".concat(email.body);
  emailFull.appendChild(recipients);
  emailFull.appendChild(subject);
  emailFull.appendChild(sender);
  emailFull.appendChild(body); // link to reply method
  // to do

  showView.appendChild(createReplyButton(email));
  showView.appendChild(createArchiveButton(email));
  showView.appendChild(emailFull);
  return showView;
};

var showEmail = function showEmail(email) {
  // hide both views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none'; // display email show-view

  document.querySelector('#show-view').style.display = 'block';
  entry = showPage(email);
};

var createArchiveButton = function createArchiveButton(email) {
  var archiveButton = document.createElement("button");

  if (!email.archived) {
    archiveButton.innerText = "Archive";
    archiveButton.addEventListener('click', function () {
      fetch("/emails/".concat(email.id), {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }).then(function () {
        load_mailbox("archive");
      });
    });
  } else {
    archiveButton.innerText = "Unarchive";
    archiveButton.addEventListener('click', function () {
      fetch("/emails/".concat(email.id), {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      }).then(function () {
        load_mailbox("archive");
      });
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

var createReplyButton = function createReplyButton(email) {
  replyButton = document.createElement("button");
  replyButton.innerText = "Reply";
  subjectLine = email.subject.slice(0, 3) == "Re:" ? email.subject : "Re: ".concat(email.subject);
  replyButton.addEventListener('click', function () {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender, document.querySelector('#compose-subject').value = subjectLine, document.querySelector('#compose-body').value = "On ".concat(email.timestamp, " ").concat(email.sender, " wrote: ").concat(email.body); // reformat email data to prefill data
    // load compose view with prefill data
  });
  return replyButton;
};