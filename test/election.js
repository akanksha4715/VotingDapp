var Election = artifacts.require("./Election");
var electioninstance;

contract("election",function(accounts){
	it("Has 4 candidates",function(){
		return Election.deployed().then(function(instance){
			return instance.candidatecount();
		}).then(function(count){
			assert.equal(count,4);
		});
	});
	it("Candidates are initialized with correct values",function(){
		return Election.deployed().then(function(instance){
			electioninstance=instance;
			return electioninstance.candidates(1);
		}).then(function(cand){
			assert.equal(cand[0],1,"Correct ID");
			assert.equal(cand[1],"Congress","Correct Name");
			assert.equal(cand[2],0,"Correct no. of Votes");
			return electioninstance.candidates(2);
		}).then(function(cand){
			assert.equal(cand[0],2,"Correct ID");
			assert.equal(cand[1],"BJP","Correct Name");
			assert.equal(cand[2],0,"Correct no. of Votes");
			return electioninstance.candidates(3);
		}).then(function(cand){
			assert.equal(cand[0],3,"Correct ID");
			assert.equal(cand[1],"AAP","Correct Name");
			assert.equal(cand[2],0,"Correct no. of Votes");
			return electioninstance.candidates(4);
		}).then(function(cand){
			assert.equal(cand[0],4,"Correct ID");
			assert.equal(cand[1],"Other","Correct Name");
			assert.equal(cand[2],0,"Correct no. of Votes");
		});
	});
	it("Voter has casted the vote",function(){
		return Election.deployed().then(function(instance){
		 electioninstance = instance;
		candidateid =2
		return instance.vote(candidateid,{from: accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length,1,"an event was triggered");
			assert.equal(receipt.logs[0].event,"votedevent","event type is correct");
			assert.equal(receipt.logs[0].args._candidateid.toNumber(),candidateid,"cand id is correct");
			return electioninstance.voters(accounts[0]);
		}).then(function(voted){
			assert(voted,"has casted the vote");
			return electioninstance.candidates(candidateid);
		}).then(function(candidate){
			var votecount = candidate[candidateid];
			assert.equal(votecount,1,"incremented by 1");
		})		
	});
	it("throws an exception for invalid candiates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1); //calling cand 1 here
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 0, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes"); // I've already voted cand 2 via this acc 
    });																		//that's why votecount ka assertion 1 se kiya h
  });

  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.vote(candidateId, { from: accounts[1] });
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 2, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 0, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 2, "candidate 2 did not receive any votes");
    });
  });
});