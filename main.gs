function main() {
  scanAndDeleteEmail(`category:promotions -L:important -is:starred older_than:3m`);
}

const SEARCH_PAGE_SIZE = 50;
const MAX_PROCESSED_EMAIL_LIMIT = 500;
const SUMMARY_RECIPIENT = "<put your email here>";

function scanAndDeleteEmail(query){
  let idx = 0;

  const rawSummaryList = [];
  const messageList = [];
  while(true) {
    const threadList = GmailApp.search(query, idx, SEARCH_PAGE_SIZE);
    for (const thread of threadList){
      for (const message of thread.getMessages()){
        messageList.push(message);

        const sender = message.getFrom();
        const subject = message.getSubject();

        rawSummaryList.push(`${sender} | ${subject}`);
      }
    }

    idx += SEARCH_PAGE_SIZE;

    if (rawSummaryList.length > MAX_PROCESSED_EMAIL_LIMIT) {
      break;
    }

    if (threadList.length < SEARCH_PAGE_SIZE) {
      // last page
      break;
    }
  }

  rawSummaryList.sort();

  const summaryList = rawSummaryList.map(entry => `- ${entry}`);
  const htmlSummaryList = rawSummaryList.map(entry => `<li>${encodeHtmlSpecialChar(entry)}</li>`);

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
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

