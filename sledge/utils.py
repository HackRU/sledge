import urllib.parse

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
