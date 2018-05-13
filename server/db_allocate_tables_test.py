import sqlite3
db=sqlite3.connect("data/sledge.db")
c=db.cursor()
judges={}
hacks={}
alloc=c.execute("select * from judge_hacks")
for row in alloc:
    try:
        judges[row[1]]+=1
    except Exception:
        judges[row[1]]=1
    try:
        hacks[row[2]]+=1
    except Exception:
        hacks[row[2]]=1
# the values in this array should be around the same
print(judges)
print("---")
# all the values in this array should be exactly the same (it should be judges_per_hack)
print(hacks)
