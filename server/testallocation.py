from random import randint
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
    _max=max(hacks_per_judge)
    _min=min(hacks_per_judge)
    _range=_max-_min
    avg=sum(hacks_per_judge)/len(hacks_per_judge)
    print("(",judges,",",hacks,",",judges_per_hack,")")
    print("min: ",_min," max: ",_max," range: ",_range," avg: ",avg)
    #print(hacks_per_judge)

if __name__=="__main__":
    for i in range(0,20):
        judges=randint(8,20)
        hacks=randint(30,90)
        jph=randint(2,5)
        test(judges,hacks,jph)

