import sledge.utils as utils
import urllib.parse

def email_invite_links(annotators):
    if settings.DISABLE_EMAIL or annotators is None:
        return
    if not isinstance(annotators, list):
        annotators = [annotators]

    emails = []
    for annotator in annotators:
        link = urllib.parse.urljoin(settings.BASE_URL, '/login/%s' % annotator.secret)
        raw_body = settings.EMAIL_BODY.format(name=annotator.name, link=link)
        body = '\n\n'.join(utils.get_paragraphs(raw_body))
        emails.append((annotator.email, settings.EMAIL_SUBJECT, body))

    utils.send_emails(emails)

def email_invite_links(annotators):
    if settings.DISABLE_EMAIL or annotators is None:
        return
    if not isinstance(annotators, list):
        annotators = [annotators]

    emails = []
    for annotator in annotators:
        link = urllib.parse.urljoin(settings.BASE_URL, '/login/%s' % annotator.secret)
        raw_body = settings.EMAIL_BODY.format(name=annotator.name, link=link)
        body = '\n\n'.join(utils.get_paragraphs(raw_body))
        emails.append((annotator.email, settings.EMAIL_SUBJECT, body))

    utils.send_emails(emails)
