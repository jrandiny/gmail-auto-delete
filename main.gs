function main() {
  scanAndDeleteEmail(`category:promotions AND -L:important AND -is:starred AND older_than:1y`)
}

const SEARCH_PAGE_SIZE = 50;
const MAX_PROCESSED_EMAIL_LIMIT = 1000;
const SUMMARY_RECIPIENT = "<put your email here>";

function scanAndDeleteEmail(query){
  let idx = 0;

  const summaryList = [];
  while(true) {
    const threadList = GmailApp.search(query, idx, SEARCH_PAGE_SIZE);
    for (const thread of threadList){
      for (const message of thread.getMessages()){
        message.moveToTrash();
        summaryList.push(`- ${message.getFrom()} - ${message.getSubject()}`)
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

  const body = `The following email have been moved to trash:\n${summaryList.join('\n')}`;

  GmailApp.sendEmail(SUMMARY_RECIPIENT, `Promotion Email Deleter - ${summaryList.length} emails deleted`, body);
}
