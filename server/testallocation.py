import allocation
def test(judges,hacks,judges_per_hack):
    the_allocation=allocation.allocate_judges_tables(judges,hacks,judges_per_hack)
    # maybe check for std deviation to make sure distribution is "fair"
    # maybe check range instead
    assert len(the_allocation)==judges
    judgings=[0]*hacks
    hacks_per_judge=[0]*judges
    judge_num=0
    for judge in the_allocation:
        assert judge_num<judges # cant have more allocations then judges
        hacks_per_judge[judge_num]=len(judge)
        for hack in judge:
            assert hack<hacks # cant judge a hack that doesn't exist
            judgings[hack]+=1
        judge_num+=1
    for times_judged in judgings:
        assert times_judged==judges_per_hack
    max_hacks_per_judge=max(hacks_per_judge)
    min_hacks_per_judge=min(hacks_per_judge)
    print("min: "+str(min_hacks_per_judge)+" max: "+str(max_hacks_per_judge))
    print("range: "+str(max_hacks_per_judge-min_hacks_per_judge))
    print(hacks_per_judge)
