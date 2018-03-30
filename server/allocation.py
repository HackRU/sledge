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
    # partitions go around in a circle stealing elements
    # from eachother until the list has as many partitions
    # as judges
    theif=0
    victim=1
    while len(partitions) > judges:
        partitions[theif].append(copy.deepcopy(partitions[victim][0]))
        del partitions[victim][0]
        if len(partitions[victim]) == 0:
            del partitions[victim]
        theif+=1
        if theif==len(partitions)-1:
            theif=0
        victim=theif + 1

    allocations=[]
    for i in range(0,judges):
        for j in range(i, i + partitions_per_judge):
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
