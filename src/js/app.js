App = {
  web3Provider: null,
  contracts: {},
  accounts: '0x0',
  hasVoted: false,

  init: function(){
    return App.initWeb3();
  },
  initWeb3: function(){
    if(typeof web3 !== 'undefined') {
      //if web3 instance is already provided by metamask
      App.web3Provider=web3.currentProvider;
      web3= new  Web3(web3.currentProvider);
    }
    else{
      // Specifying default instance if noweb3 instance provided
      App.web3Provider= new Web3.providers.HttpProvider('http://localhost:7545');
      web3 =new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract: function(){
    $.getJSON("Election.json",function(election){
      App.contracts.Election= TruffleContract(election);
      //contract connecting to provider
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },
  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedevent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
  render: function(){
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    // Load account data
    web3.eth.getCoinbase(function(error,account){
      if(error===null){
        App.accounts=account;
        $("#accountAddress").html("Your account: "+account);
      }
    });
    
     //Load contract data
     App.contracts.Election.deployed().then(function(instance){
      electionInstance=instance;
      return electionInstance.candidatecount();
     }).then(function(candidatecount){
        var candidatesresults= $("#candidatesResults");
        candidatesresults.empty();
        var candidatesselect= $("#candidatesSelect");
        candidatesselect.empty();
        for(var i=1;i<=candidatecount;i++){
          electionInstance.candidates(i).then(function(candidate){
              var id = candidate[0];
              var name = candidate[1];
              var voteCount = candidate[2];
              // Render candidate result
              var candidateTemplate = "<tr><th>"+ id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>" //yaha ; ni tha
              candidatesresults.append(candidateTemplate);
              //Render candidate ballot option
              var candidateOption = "<option value=' "+ id + " '>"+ name + "</option>"
              candidatesselect.append(candidateOption);
          });
        }//loop ends here
        return electionInstance.voters(App.accounts);
      }).then(function(hasVoted){
        if(hasVoted){
          $('form').hide();
        }
        loader.hide();
        content.show();
      }).catch(function(error){
      console.warn(error);
     });
  },// render ending here
  castVote: function(){
    var id = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.vote(id, {from: App.accounts})
    }).then(function(res){
      $('#content').hide();
      $('#loader').show();
      
    }).catch(function(error){
      console.error(error);
    });
  }
};
$(function(){
  $(window).load(function(){
    App.init();
  });
});
  /*
  */
