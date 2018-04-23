'''utilities for allocating judges'''
import math
import copy

def allocate_judges_tables(judges, hacks, judges_per_hack):
    '''
    returns ranges of which hack should goto which judge
    so that each hack gets judges_per_hack amount of judges
    '''
    partition_size = hacks // judges
    partitions_per_judge = judges_per_hack
    hack_nums=list(range(0,hacks))
    partitions=partition(hack_nums, partition_size)
    #keep sifting forward to distributed end thoughout the sublists
    theif=0
    while len(partitions) > judges:
        #print(partitions)
        sift_front(partitions,theif)
        theif=(theif+1)%len(partitions)
        

    allocations=[]
    for i in range(0,judges):
        for j in range(i, i + partitions_per_judge):
            #print(allocations)
            try:
                allocations[i]+=partitions[j % len(partitions)]
            except Exception as e:
                allocations.append(copy.deepcopy(partitions[j % len(partitions)]))
    return allocations

def allocate_judges_presentation(judges, hacks):
    allocations = []
    for j in range(0,judges):
        judge = []
        for h in range(0,hacks):
            judge.append(h)
        allocations.append(judge)

    return allocations

def partition(nums, partition_size):
    '''
    splits nums into arrays of size partition
    if it doesn't devide evenly the remander is added to the end
    '''
    partitions=[]
    num_partitions = math.ceil(len(nums) / partition_size)
    # +2 because range goes to len -1 and i need to goto len+1
    # to also get the remander
    for i in range(0, num_partitions*partition_size, partition_size):
        partitions.append(copy.deepcopy(nums[i:i+partition_size]))
    return partitions

def sift_front(the_list, theif):
    '''
    shifts inner list elements form list to list from the last sublist to the theif list
    '''
    # reverse traversal from last elem to dest before destination
    for i in range(len(the_list)-1,theif+1,-1):
        the_list[i-1].append(copy.deepcopy(the_list[i][0]))
        del the_list[i][0]
        if len(the_list[i]) == 0:
            del the_list[i]
