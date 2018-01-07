import urllib.parse
from models import Judge, Hack
from devpost import get_devpost_data

async def set_secret(judge):
    judge.secret = judge.email

async def allocate_judges(session):
    VIEWS_PER_HACK = 3
    num_hacks = session.query(Hack).count()
    num_judges = session.query(Judge).count() + 1

    if num_hacks == 0:
        # don't waste time querying the DB... just wait.
        return 0, 0, 0
    if num_judges <= VIEWS_PER_HACK:
        for judge in session.query(Judge):
            judge.start_loc = 0
            judge.end_loc = num_hacks - 1
            session.add(judge)
        session.commit()
        return 0, 0, num_hacks - 1

    total_hacks = num_hacks * VIEWS_PER_HACK
    hacks_per_judge = total_hacks // num_judges
    for idx, judge in enumerate(session.query(Judge)):
        judge.start_loc = (idx * hacks_per_judge) % num_hacks
        judge.curr_loc = judge.start_loc
        judge.end_loc = ((idx + 1) * hacks_per_judge - 1) % num_hacks
        session.add(judge)
    session.commit()
    left_hack = ((num_judges - 1) * hacks_per_judge) % num_hacks
    right_hack = (left_hack + hacks_per_judge) % num_hacks
    return left_hack, left_hack, right_hack

async def devpost_to_db(session, url):
    prizes, hacks = get_devpost_data(url)
    for prize in prizes:
        session.add(prize)
    session.commit()
    for hack in hacks:
        session.add(hack)
    session.commit()
    session.flush()
    session.close()

def email_invite_links(annotators):
    if not isinstance(annotators, list):
        annotators = [annotators]

    emails = []
    for annotator in annotators:
        link = urllib.parse.urljoin(settings.BASE_URL, '/login/%s' % annotator.secret)
        raw_body = settings.EMAIL_BODY.format(name=annotator.name, link=link)
        body = '\n\n'.join(utils.get_paragraphs(raw_body))
        emails.append((annotator.email, settings.EMAIL_SUBJECT, body))

    utils.send_emails(emails)

def send_emails(emails):
    '''
    Send a batch of emails.

    This function takes a list [(to_address, subject, body)].
    '''
    server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(settings.EMAIL_FROM, settings.EMAIL_PASSWORD)

    exceptions = []
    for e in emails:
        try:
            to_address, subject, body = e
            msg = email.mime.multipart.MIMEMultipart()
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = to_address
            recipients = [to_address]
            if settings.EMAIL_CC:
                msg['Cc'] = ', '.join(settings.EMAIL_CC)
                recipients.extend(settings.EMAIL_CC)
            msg['Subject'] = subject
            msg.attach(email.mime.text.MIMEText(body, 'plain'))
            server.sendmail(settings.EMAIL_FROM, recipients, msg.as_string())
        except Exception as e:
            exceptions.append(e) # XXX is there a cleaner way to handle this?

    server.quit()
    if exceptions:
        raise Exception('Error sending some emails: %s' % exceptions)
