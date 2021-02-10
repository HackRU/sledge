# Day of checklist
these are step by step instructions of how to run judging day of for the most part.
this was developed for hackru fall 2020 and was ran remote, so there may be things that need
to be update for when the hackathon is no longer virtual. (like the slack channel script)

**this assumes you've gone through the deploy instructions with aws lightsail**

# The checklist
1. Login to lightsail, delete sledge db (rm data/sledge.db) and restart sledge (sudo systemctl restart sledge)
2. assign table numbers in devpost manage panel
3. run create channels script with the amount of submissions
  - Num_tables = number of submissions in script
  - Need a slack token (via bot token)
4. Announce table(channel) numbers assigned
5. download csv from devpost manage hackathon>metrics
6. load csv into sledge devpost csv import tab
7. Convert Tracks into tracks
8. Add judges
  - Add a few extra no name judges just in case there are some day of don’t know about
9. Add categories
10. Expand categories(try to make sure there is an equal amount per track)
11. Click populate db
12. Click start judging
13. Tell judges to start judging
14. Under admin actions manually assign 2 judges to check out each prize to rank specifically based on that prize
15. Look at visualize ratings and visualize prizes to monitor progress
16. with 30 mins left start considering manually asking judges to compare two hacks on devpost if two hacks are close together in score
  - You can use the visualize prizes page to decide who to assign to a prize. This will help you assign a judge that has already seen those hacks
  - You can force the ranking assignments to the front of the queue with tools/bump.sh
17. **For f20 we are aiming to send results no later than 2:50 pm est**
18. You can use the following scripts to get data for winners
  - tools/topsubmissions: 1st and 2nd place for each track
  - tools/topprizes_rankings: 1st place for each prize
  - If there is a tie, use the other method to break it
19. Once you have a clear, confident understanding of who won each prize, make a report of which projects won each prize.    
20. Make sure no one wins multiple prizes
  - Priority: track, superlatives, mlh prize
21. Send report to dayof/directors to announce and setup demos.
