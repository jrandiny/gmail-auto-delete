function main() {
  scanAndDeleteEmail(`category:promotions AND -L:important AND -is:starred AND older_than:1y`)
}

const SEARCH_PAGE_SIZE = 50;
const MAX_PROCESSED_EMAIL_LIMIT = 500;
const SUMMARY_RECIPIENT = "<put your email here>";

function scanAndDeleteEmail(query){
  let idx = 0;

  const summaryList = [];
  const htmlSummaryList = [];
  const messageList = [];
  while(true) {
    const threadList = GmailApp.search(query, idx, SEARCH_PAGE_SIZE);
    for (const thread of threadList){
      for (const message of thread.getMessages()){
        messageList.push(message);

        const sender = message.getFrom();
        const subject = message.getSubject();

        summaryList.push(`- ${sender} | ${subject}`);
        htmlSummaryList.push(`<li>${encodeHtmlSpecialChar(sender)} | ${encodeHtmlSpecialChar(subject)}</li>`);
      }
    }

    idx += SEARCH_PAGE_SIZE;

    if (summaryList.length > MAX_PROCESSED_EMAIL_LIMIT) {
      break;
    }

    if (threadList.length < SEARCH_PAGE_SIZE) {
      // last page
      break;
    }
  }

  const htmlBody = `<h3>Report</h3><p>Query used: <code>${query}</code></p><p>The following email have been moved to trash:</p><ul>${htmlSummaryList.join("")}</ul>`;
  const body = `Query: ${query}\nThe following email have been moved to trash:\n${summaryList.join("\n")}`;

  GmailApp.sendEmail(SUMMARY_RECIPIENT, `Promotion Email Deleter - ${summaryList.length} emails deleted`, body, {
    htmlBody: htmlBody
  });

  // we delete at the end, to make sure that the report is sent before doing any deletion
  for (const message of messageList){
    message.moveToTrash();
  }
}

function encodeHtmlSpecialChar(input){
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

