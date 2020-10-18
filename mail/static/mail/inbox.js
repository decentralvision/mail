document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // attaching event listener to s'more buttoonz
  

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#show-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  $('#compose-form').submit(function(e){
    send_email();
    return false;
  })
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#show-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // case statement load emails
  switch (mailbox) {
    case "sent":
      fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
          emailEntries = document.createElement("div")
          emails.forEach(email => {
            const emailEntry = createEmailEntry(email)
            emailEntry.classList.add("sent")
            emailEntries.appendChild(emailEntry)
          });
          document.querySelector("#emails-view").appendChild(emailEntries)
      });
      break;

    case "inbox":
      fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
          emailEntries = document.createElement("div")
          emails.forEach(email => {
            const emailEntry = createEmailEntry(email)
            emailEntry.classList.add("inbox")
            emailEntry.addEventListener('click', function() {
              showEmail(email)
            });
            emailEntries.appendChild(emailEntry)
          });
          document.querySelector("#emails-view").appendChild(emailEntries)
      });
      break;

    case "archive":
      fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        console.log(emails)
        emailEntries = document.createElement("div")
        emails.forEach(email => {
          const emailEntry = createEmailEntry(email)
          emailEntry.classList.add("archive")
          emailEntries.appendChild(emailEntry)
        });
        document.querySelector("#emails-view").appendChild(emailEntries)
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
  })
  .then(response => response.json())
  .then(result => {
      if (result.error) {
        console.log(result.error);
        const error = document.createElement('h1');
        error.innerHTML = result.error;
        document.querySelector('#compose-view').append(error);
      } 
      else {
        load_mailbox('sent')
      }
  });
}


const createEmailEntry = (email) => {
  const entry = document.createElement("div")
  if (email.read) {
    entry.classList.add("read")
  }
  entry.innerText = `${email.sender} - ${email.subject} - ${email.timestamp}`
  // create link to show page

  return entry
}


const showPage = (email) => {
  markAsRead(email)
  // mark email as read
  // clear previous email entry
  const showView = document.getElementById('show-view')
  showView.innerHTML = ""

  // build the show page
  const emailFull = document.createElement("ul")
  const subject = document.createElement("li")
  subject.innerHTML = email.subject 
  const recipients = document.createElement("li")
  recipients.innerHTML = email.recipients 
  const body = document.createElement("li")
  body.innerHTML = email.body 
  emailFull.appendChild(recipients)
  emailFull.appendChild(subject)
  emailFull.appendChild(body)
  // link to reply method
  // to do
  showView.appendChild(replyButton(email))
  showView.appendChild(archive_button(email))
  showView.appendChild(emailFull)
}


const showEmail = (email) => {
  // hide both views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // display email show-view
  document.querySelector('#show-view').style.display = 'block';
  entry = showPage(email)
}


const archive_button = (email) => {
  const archiveButton = document.createElement("button");
  if (!email.archived) {
    archiveButton.innerText = "Archive"
    archiveButton.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      }).then(load_mailbox("archive"))
  })} else {
    archiveButton.innerText = "Unarchive"
    archiveButton.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      }).then(load_mailbox("archive"))
      
    })
  }
  return archiveButton
}


const markAsRead = (email) => {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}


const replyButton = (email) => {

  // reformat email data to prefill data
  // load compose view with prefill data
}