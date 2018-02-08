import os
import sqlite3

sql = None

# Initialization

def initdb(datadir):
    global sql
    sql = sqlite3.connect(os.path.join(datadir, 'sledge.db'))

    c = sql.cursor()
    c.execute(
        # The hacks table is a all the hacks and the info needed to judge them
        'CREATE TABLE IF NOT EXISTS hacks ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'description TEXT NOT NULL,'
            'location INTEGER NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The judges table is all the judges, what they need to authenticate,
        # and how to contact them.
        'CREATE TABLE IF NOT EXISTS judges ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'email TEXT NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The judge_hacks table records all hacks assigned to a judge
        'CREATE TABLE IF NOT EXISTS judge_hacks ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'hack_id INTEGER NOT NULL,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(hack_id) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The superlatives table is all the superlatives
        'CREATE TABLE IF NOT EXISTS superlatives ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The superlative_placements is the first and second choice of
        # each judge for each superlative
        'CREATE TABLE IF NOT EXISTS superlative_placements ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'superlative_id INTEGER NOT NULL,'
            'first_choice INTEGER,'
            'second_choice INTEGER,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(first_choice) REFERENCES hacks(id),'
            'FOREIGN KEY(second_choice) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The ratings table is the score given by each judge on a 0-20 scale
        'CREATE TABLE IF NOT EXISTS ratings ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'hack_id INTEGER NOT NULL,'
            'rating INTEGER NOT NULL,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(hack_id) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    sql.commit()

# Modifications

def add_hack(hack):
    name        = hack.get('hack_name')
    description = hack.get('hack_description')

    c = sql.cursor()
    c.execute(
        'INSERT INTO hacks ('
            'name, description, location)'
        'VALUES (?,?,?);',
        [hack.get('hack_name'), hack.get('hack_description'), 0])

    sql.commit()

def are_hacks_populated():
    c = sql.cursor()
    c.execute('SELECT * FROM hacks;')
    return c.fetchone() != None

def add_superlative_ranking(ranking):
    judgeid  = ranking.get('judgeId')
    superid  = ranking.get('superlativeId')
    firstid  = ranking.get('firstChoiceId')
    secondid = ranking.get('secondChoiceId')

    c = sql.cursor()
    c.execute(
        'INSERT OR REPLACE INTO superlative_placements'
            '(id, judge_id, superlative_id, first_choice, second_choice)'
        'VALUES ('
            '(SELECT id FROM superlative_placements WHERE judge_id=? AND superlative_id=?),'
            '?, ?, ?, ?);',
        [judgeid, superid, judgeid, superid, firstid, secondid])

    sql.commit()

def add_judge(judge):
    name  = judge.get('name')
    email = judge.get('email')

    c = sql.cursor()
    c.execute(
        'INSERT INTO judges ('
            'name, email)'
        'VALUES (?,?)',
        [name, email])
    sql.commit()

def add_rating(rating):
    judgeid = rating.get('judgeId')
    hackid  = rating.get('hackId')
    rating  = rating.get('rating')

    c = sql.cursor()
    c.execute(
        'INSERT OR REPLACE INTO ratings'
            '(id, judge_id, hack_id, rating)'
        'VALUES ('
            '(SELECT id FROM ratings WHERE judge_id=? AND hack_id=?),'
            '?, ?, ?);',
        [judgeid, hackid, judgeid, hackid, rating])
    sql.commit()

def add_superlative(superlative):
    name = superlative.get('name')

    c = sql.cursor()
    c.execute(
        'INSERT INTO superlatives ('
            'name)'
        'VALUES (?)',
        [name])
    sql.commit()

# Serialization

def serialize_hacks():
    c = sql.cursor()
    c.execute('SELECT id,name,description,location FROM hacks;')

    hacks = []
    for hack in c.fetchall():
        hacks.append({
            'id': hack[0],
            'name': hack[1],
            'description': hack[2],
            'location': hack[3] })
    return hacks

def serialize_judges():
    c = sql.cursor()
    c.execute('SELECT id,name,email FROM judges;')

    judges = []
    for judge in c.fetchall():
        judges.append({
            'id': judge[0],
            'name': judge[1],
            'email': judge[2] })
    return judges

def serialize_judge_hacks():
    c = sql.cursor()
    c.execute('SELECT id,judge_id,hack_id FROM judge_hacks;')

    judge_hacks = []
    for judge_hack in c.fetchall():
        judge_hacks.append({
            'id': judge_hack[0],
            'judgeId': judge_hack[1],
            'hackId': judge_hack[2] })
    return judge_hacks

def serialize_superlatives():
    c = sql.cursor()
    c.execute('SELECT id,name FROM superlatives;')

    superlatives = []
    for superlative in c.fetchall():
        superlatives.append({
            'id': superlative[0],
            'name': superlative[1] })
    return superlatives

def serialize_superlative_placements():
    c = sql.cursor()
    c.execute('SELECT id,judge_id,superlative_id,first_choice,second_choice FROM superlative_placements;')

    superlative_placements = []
    for superlative_placement in c.fetchall():
        superlative_placements.append({
            'id': superlative_placement[0],
            'judgeId': superlative_placement[1],
            'superlativeId': superlative_placement[2],
            'firstChoice': superlative_placement[3],
            'secondChoice': superlative_placement[4] })
    return superlative_placements

def serialize_ratings():
    c = sql.cursor()
    c.execute('SELECT id,judge_id,hack_id,rating FROM ratings;')

    ratings = []
    for rating in c.fetchall():
        ratings.append({
            'id': rating[0],
            'judgeId': rating[1],
            'hackId': rating[2],
            'rating': rating[3] })
    return ratings
