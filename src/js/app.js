window.addEventListener('load', async () => {
// Modern dapp browsers...
  if (window.ethereum) {

    window.web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
      console.log("injected");
      App.initAccount();


    } catch (error) {
      console.log("Please enable access to Metamask");
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    App.initAccount();

  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
});

App = {
  Web3Provider: null,
  contracts: {},

  initAccount: function() {

    App.web3Provider = web3.currentProvider;
    // Display current wallet
    console.log("initAccount called");

    web3.eth.getAccounts().then(function(result){

      return result[0];
      
    }).then(function(account) {
      

      document.getElementById("account").innerHTML = account;

      // refresh page when wallet changes
      // see https://metamask.github.io/metamask-docs/Advanced_Concepts/Provider_API#ethereum.on(eventname%2C-callback)

      window.ethereum.on('accountsChanged', function(account) {
        window.location.reload(true);
      });


      // Display current wallet ETH balance
      var accountWeiBalance = web3.eth.getBalance(account, function(error, result) {
        if (!error) {
          console.log(JSON.stringify(result));

          var accountBalance = web3.utils.fromWei(result, "ether");
          document.getElementById("account_balance").innerHTML = accountBalance;

        } else {
          console.log(error);
        }
      });
    })
    return App.initContract();
  },

   initContract: function() {
    $.getJSON('FDT_ETHExtension.json', function(data) {
      //Get the necessary contract artifact file and instantiate it with truffle-contract
      var FDT_ETHExtensionArtifact = data;
      App.contracts.FDT_ETHExtension = TruffleContract(FDT_ETHExtensionArtifact);

      // Set the provider for this contracts
      App.contracts.FDT_ETHExtension.setProvider(App.web3Provider);


      return App.getTokenSupply();
    });


  },



  handleMintTokens: function(event) {

    console.log("Mint Button pressed");

    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {

      account = accounts[0];

      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
        FDT_ETHExtensionInstance = instance;

        return FDT_ETHExtensionInstance.mint($("#mint-token-address").val(), $("#mint-token-amount").val(), {from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });


  },

  handleAddMinter: function(event) {

    console.log("Button pressed");

    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {

      account = accounts[0];

      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
        FDT_ETHExtensionInstance = instance;

        return FDT_ETHExtensionInstance.addMinter($("#new-minter-address").val(), {from: account});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  handleClaimDividends: function(event) {
    console.log("Claim Dividends button pressed");

    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {

      account = accounts[0];

      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {

        FDT_ETHExtensionInstance = instance;

        return FDT_ETHExtensionInstance.withdrawFunds({from: account});
      }).catch(function(err) {
        console.log(err.message);
      });

    });
  },

  handlePayContract: function(event) {
    console.log("Pay Button pressed");

    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {

      account = accounts[0];

      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {

        FDT_ETHExtensionInstance = instance;
        var _contractAddress = FDT_ETHExtensionInstance.address;

        console.log(_contractAddress);
        console.log(account);

        var payAmount = ($("#pay-contract-amount").val());

        console.log(payAmount);

        var payAmountInWei = web3.utils.toWei(payAmount);

        console.log(payAmountInWei);



        return FDT_ETHExtensionInstance.payToContract({from: account, to: _contractAddress, value: payAmountInWei});
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getTokenSupply: function() {

    var FDT_ETHExtensionInstance;

    App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
      FDT_ETHExtensionInstance = instance;

      return FDT_ETHExtensionInstance.totalSupply();
    }).then(function(tokenSupply) {
      console.log("Token supply: " + tokenSupply);
      document.getElementById("token-supply").innerHTML = tokenSupply;
    }).catch(function(err){
      console.log(err.message);
    });

    return App.getUserTokenCount();
  },

  getUserTokenCount: function() {
    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {
      account = accounts[0];
      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
        FDT_ETHExtensionInstance = instance;

        return FDT_ETHExtensionInstance.balanceOf(account);
      }).then(function(userTokenCount) {
        console.log("Tokens held in this wallet: " + userTokenCount);
        document.getElementById("user-token-count").innerHTML = userTokenCount;
      }).catch(function(err){
        console.log(err.message);
      });

    });

    return App.getDividendBalance();

  },

  getDividendBalance: function() {
    var FDT_ETHExtensionInstance;

    web3.eth.getAccounts().then(function(accounts) {
      account = accounts[0];
      App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
        FDT_ETHExtensionInstance = instance;

        return FDT_ETHExtensionInstance.dividendBalanceOf(account);
      }).then(function(userDividendBalance) {
        console.log(JSON.stringify(userDividendBalance));
        var _userDividendBalance = web3.utils.fromWei(userDividendBalance, "ether");
        console.log("Dividends unclaimed in ETH: " + _userDividendBalance);
        document.getElementById("dividend-balance").innerHTML = _userDividendBalance;
      }).catch(function(err){
        console.log(err.message);
      });

    });

    return App.getMinterDashboard();
  },

  getMinterDashboard: function() {

    var mintButton = document.getElementById("btn-mint-tokens");
    mintButton.addEventListener("click", function() {
      return App.handleMintTokens();
    });

    var addMinterButton = document.getElementById("btn-add-minter");
    addMinterButton.addEventListener("click", function () {
      return App.handleAddMinter();
    });


    var claimDividendsButton = document.getElementById("btn-claim-dividends");
    claimDividendsButton.addEventListener("click", function () {
      return App.handleClaimDividends();
    });

    var payToContractButton = document.getElementById("btn-pay-contract");
    payToContractButton.addEventListener("click", function () {
      return App.handlePayContract();
    });

    return App.getContractBalance();
  },

  getContractBalance: function() {
    var FDT_ETHExtensionInstance;

    App.contracts.FDT_ETHExtension.deployed().then(function(instance) {
      FDT_ETHExtensionInstance = instance;

      return FDT_ETHExtensionInstance.address;
    }).then(function(contractAddress) {
      console.log("Contract Address: " + contractAddress);

      document.getElementById("contract-address").innerHTML = contractAddress;

      var contractWeiBalance = web3.eth.getBalance(contractAddress, function(error, result) {
        if (!error) {
          console.log(JSON.stringify(result));

          var contractBalance = web3.utils.fromWei(result, "ether");
          document.getElementById("contract-funds-balance").innerHTML = contractBalance;

        } else {
          console.log(error);
        }
      });

    });

  }

};