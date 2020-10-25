# Slack Judge Table Creator

I'm 99% sure I did not follow any TypeScript best practices. :)

### What this does

A script that creates n number of public channels in your Slack workspace. Built for HackRU.

### Prerequisites:

1. You need a Slack app created (https://api.slack.com/apps). The bot needs the following scopes: channels:manage, groups:write, im:write, and mpim:write. You also need to install the app into your workspace.
2. Make sure you have Node, npm, and tsc installed.

## Usage

1. First, install the necessary dependencies:

```
npm install
```

2. Next, compile the script:

```
tsc create-tables.ts
```

3. Create a config.json file based on the provided example-config.json file. Add your slack bot OAuth token to your config file!

You can find your token here:
![](readme/bot-oath-token.png?raw=true)

4. Run the script!

```
node create-tables.js <num-tables>
```

Links I referenced:

- https://www.npmjs.com/package/@slack/web-api
- https://slack.dev/node-slack-sdk/typescript

- https://api.slack.com/methods/conversations.create/code
