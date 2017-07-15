ANNOTATOR_ID = 'annotator_id'

# Setting
# keys
SETTING_CLOSED = 'closed' # boolean
# values
SETTING_TRUE = 'true'
SETTING_FALSE = 'false'

# Defaults
DEFAULT_WELCOME_MESSAGE = '''
Welcome to Sledge.

**Please read this important message carefully before continuing.**

Sledge is a fully automated expo judging system that both tells you where to go
and collects your ranking of the projects you have viewed.

If at any point, you can't find a particular submission, you can click the
'Skip' button and you will be assigned a new project. **Please don't skip
unless absolutely necessary.**

Sledge makes it really simple for you to submit votes, but please think hard
before you vote. **Once you make a decision, you can't take it back**.
'''.strip()

DEFAULT_EMAIL_SUBJECT = 'Welcome to Sledge!'

DEFAULT_EMAIL_BODY = '''
Hi {name},

Welcome to Sledge, the online expo judging system. This email contains your
magic link to the judging system.

DO NOT SHARE this email with others, as it contains your personal magic link.

To access the system, visit {link}.

Once you're in, please take the time to read the welcome message and
instructions before continuing.
'''.strip()

DEFAULT_CLOSED_MESSAGE = '''
The judging system is currently closed. Reload the page to try again.
'''.strip()

DEFAULT_DISABLED_MESSAGE = '''
Your account is currently disabled. Reload the page to try again.
'''.strip()

DEFAULT_LOGGED_OUT_MESSAGE = '''
You are currently logged out. Open your magic link to get started.
'''.strip()

DEFAULT_WAIT_MESSAGE = '''
Wait for a little bit and reload the page to try again.

If you've looked at all the projects already, then you're done.
'''
