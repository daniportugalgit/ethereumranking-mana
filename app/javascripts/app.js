// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

// Import basic libraries:
import Web3 from 'web3';
import TruffleContract from 'truffle-contract';
import Gasmon from 'gasmon';

// Import contract artifacts and turn them into usable abstractions:
import contract_artifacts from '../../build/contracts/MTGNoonRanking.json';
const Contract = TruffleContract(contract_artifacts);

// Import my custom tools:
const Flow = require('./flow.js');
const Metamon = require('./metamon.js');
//const Gasmon = require('./gasmon.js');

const Vault = require('./vault.js');
const Bgmon = require('./bgmon.js');
const Players = require('./players.js');
const Tournaments = require('./tournaments.js');
const Ui = require('./uiUtils.js');

var _instance; //deployed contract instance;
var _localDev = false; //set this to true (and disable Metamask extension) to test with ganache
var _playersScanned = 0; //used for the asynchronous player getters

window.App = {
  start: async function() {
    var self = this;
        
    Vault.setEnvironment(Metamon.currentNetwork());

    await App.initContracts();

    Metamon.init(App.onMetamaskError,
                 App.onMetamaskNeedLogin,
                 App.onMetamaskConnect,
                 App.onMetamaskDisconnect,
                 _localDev, true);

    Gasmon.init();
    
    App.initMenu();    
    App.getAllAddresses();
    App.showSection(Vault.sections[0]);
    App.populateTournamentFormats();
    //App.hideLoader(); //done after fetching the ranking
  },

  initContracts: async function() {
    Contract.setProvider(web3.currentProvider);

    if (_localDev) {
      _instance = await Contract.deployed();
    } else {
      try {
        _instance = await Contract.at(Vault.currentAddress());
      } catch(e) {
        console.error("ERROR: " + e.message);
      }
    }
  },

  initMenu: function() {
    $(".nav-link").on("click", function(){
      $(".nav-item").find(".active").removeClass("active");
      $(this).addClass("active");
    });
  },

  onMetamaskError: function(message) {
    console.log(message);
  },

  onMetamaskNeedLogin: function() {
    //alert("Por favor, faça login no Metamask.");
    App.hideContent();
    App.setConnectButtonVisibility(true);
  },

  onMetamaskConnect: async function(accs) {
    $("#user_address").html(Metamon.currentUser());
    App.setConnectButtonVisibility(false);
    Bgmon.activateBackground();
    App.setUserData();
    App.showContent();
  },

  onMetamaskDisconnect: function() {
    App.setConnectButtonVisibility(true);
    Bgmon.deactivateBackground();
    App.hideContent();
  },

  setUserData: function() {
    App.setAdminStatus();

    Flow.call(_instance,
              "players",
              [Metamon.currentUser()],
              App.onGetUserResult,
              App.onError);
  },

  setAdminStatus: async function(roleNumber, roleName) {
    let owner = await _instance.owner.call();
    
    if(owner == Metamon.currentUser()) {
      $("#" + "admin" + "_badge").show();
      Ui.enableButton("newPlayer");
      Ui.enableButton("newTournament");
      $("#menu-item-admin").show();
    } else {
      $("#" + "admin" + "_badge").hide();
      Ui.disableButton("newPlayer");
      Ui.disableButton("newTournament");
      $("#menu-item-admin").hide();
    }
  },

  onGetUserResult: function(functionName, result, extraParam) {
    console.log("App :: Logged player fetched: " + JSON.stringify(result));

    if(!result.name)
      result.name = "Unregistered player";

    $('#user_name').html(result.name);

    if(result.fbId != 0)
      $("#user_image_div").html("<img src=\"" + Vault.fbGraphURL + parseInt(result.fbId) + Vault.fbGraphParams + "\" width=\"50px\">");
    else
      $("#user_image_div").html("<img src=\"http://funpowerhouse.com/ranking/img/default-user.jpg\" width=\"50px\">");
  },

  getAllAddresses: function() {
    Flow.call(_instance,
              "getAllPlayers",
              [],
              App.populatePlayers,
              App.onError);
  },

  populatePlayers: function(functionName, result, extraParam) {
    console.log("App :: Players fetched: " + JSON.stringify(result));

    Players.clearList();

    for(var i = 0; i < result.length; i++) {
      Players.addPlayer({ address: result[i] });
    }

    App.calculateRanking();
  },

  calculateRanking: function() {
    _playersScanned = 0;

    for(var i = 0; i < Players.list().length; i++) {
      Flow.call(_instance,
                "players",
                [Players.list()[i].address],
                App.onGetPlayerResult,
                App.onGetPlayerError,
                Players.list()[i].address);
    }
  },

  onGetPlayerResult: function(functionName, result, playerAddress) {
    _playersScanned++;
    var playerObj = Players.getPlayerByAddress(playerAddress);
    playerObj.name = result.name;
    playerObj.fbId = parseInt(result.fbId);
    playerObj.first = parseInt(result.firstPlace);
    playerObj.second = parseInt(result.secondPlace);
    playerObj.third = parseInt(result.thirdPlace);
    playerObj.points = playerObj.first * 3 + playerObj.second * 2 + playerObj.third;

    if(_playersScanned >= Players.list().length) {
      App.sortPlayers(); //After this line we have the ranking at Players.list();
      App.showRanking();
    }
  },

  sortPlayers: function() {
    Players.list().sort(function(a, b){return b.points-a.points});
  },

  showRanking: function() {
    console.log("App :: Ranking fetched: ");
    console.log(Players.list());

    $("#sec_ranking").html("");

    for(var i = 0; i < Players.list().length; i++) {
      $("#sec_ranking").append(App.getPlayerHtmlVirginBlock(i+1));
      App.fillRankItem(i+1);
    }

    App.hideLoader();
    App.getTournaments();
    App.updateVersion();
  },

  getPlayerHtmlVirginBlock(rank) {
    return "<div class=\"d-flex justify-content-center\"><div id=\"rank_" + rank + "\" class=\"imageRank\"><div class=\"player_badge\"></div><div class=\"rank_bg\"><img src=\"http://funpowerhouse.com/ranking/img/playerItem.png\"></div><div class=\"player_picture_div\"></div><div class=\"player_name_div\"><div class=\"player_text_div\"></div></div><div class=\"player_points_generic player_points_div\"></div><div class=\"player_points_generic player_points_small player_1st_div\"></div><div class=\"player_points_generic player_points_small player_2nd_div\"></div><div class=\"player_points_generic player_points_small player_3rd_div\"></div></div></div>";
  },

  fillRankItem: function(rank) {
    let myPlayer = Players.list()[rank-1];
    let myDiv = $("#rank_" + rank);

    myDiv.children(".player_picture_div").html("<img src=\"" + Vault.fbGraphURL + myPlayer.fbId + Vault.fbGraphParams + "\" width=\"100px\">");
    myDiv.children(".player_name_div").children(".player_text_div").html(Players.getAlias(myPlayer.name));
    myDiv.children(".player_points_div").html(myPlayer.points);
    myDiv.children(".player_1st_div").html(myPlayer.first);
    myDiv.children(".player_2nd_div").html(myPlayer.second);
    myDiv.children(".player_3rd_div").html(myPlayer.third);
    myDiv.children(".player_badge").html("<img src=\"http://funpowerhouse.com/ranking/img/medals/m_" + Math.min(myPlayer.first,20) + ".png\" width=\"100px\"></img>");
  },

  onGetPlayerError: function(functionName, error) {
    console.log("*[ERROR] PLAYERS RESULT: " + error.message);
  },

  newTournament: function() {
    let systemName = "newTournament";

    if(!Ui.isFormValid(systemName)) return;

    Ui.showButtonLoader(systemName);
    App.showWaitingForMetamaskMsg(systemName);

    let date = Ui.getParamFromForm(systemName, "date", "text");
    let format = Ui.getParamFromForm(systemName, "format", "select");
    let ranking = Ui.getParamFromForm(systemName, "ranking", "number").split(",");

    try {
      ranking = Players.getAddressListByAliasList(ranking);
    } catch(error) {
      App.onError(systemName, "ERROR: One or more players not found.");
    }

    Flow.exec(_instance,
              "newTournament",
              [date,format,ranking],
              {from:Metamon.currentUser(), gasPrice:Gasmon.idealGasPrice()},
              App.onHash,
              App.onExecutionSuccess,
              App.onError);
  },

  newPlayer: function() {
    let systemName = "newPlayer";

    if(!Ui.isFormValid(systemName)) return;

    Ui.showButtonLoader(systemName);
    App.showWaitingForMetamaskMsg(systemName);

    let address = Ui.getParamFromForm(systemName, "address", "text");
    let name = Ui.getParamFromForm(systemName, "name", "text");
    let fbId = Ui.getParamFromForm(systemName, "fbId", "number");

    Flow.exec(_instance,
              "newPlayer",
              [address,name,fbId],
              {from:Metamon.currentUser(), gasPrice:Gasmon.idealGasPrice()},
              App.onHash,
              App.onExecutionSuccess,
              App.onError);
  },

  getTournaments: async function() {
    let tournaments = await _instance.getPastEvents('NewTournament', {fromBlock:Vault.deployBlock()});
    tournaments.reverse();
    Tournaments.setListFromEvents(tournaments); // After this line we have the tournament list at Tournaments.list();

    App.showTournaments();
  },

  showTournaments: function() {
    console.log("App :: Tournaments fetched:");
    console.log(Tournaments.list());
        
    $("#tournaments_container").html("");

    for(var i = 0; i < Tournaments.list().length; i++) {
      $("#tournaments_container").append(App.getTournamentHtmlVirginBlock(i+1));
      App.fillTournamentItem(Tournaments.list()[i], i+1);
    }
  },

  getTournamentHtmlVirginBlock(tournamentNumber) {
    return "<div id=\"tournament_" + tournamentNumber + "\" class=\"tournament_container\"><div class=\"tournament_date_div\"></div><div class=\"tournament_separator_div\"><div class=\"position_1\">1º</div><div class=\"position_2\">2º</div><div class=\"position_3\">3º</div></div><div class=\"tournament_pictures champion_picture_div\"></div><div class=\"tournament_pictures vice_champion_picture_div\"></div><div class=\"tournament_pictures third_place_picture_div\"></div></div>";
  },

  fillTournamentItem: function(tournament, number) {
    let myDiv = $("#tournament_" + number);

    myDiv.children(".tournament_date_div").html(tournament.date + ": " + tournament.format);
    myDiv.children(".champion_picture_div").html("<img src=\"" + Vault.fbGraphURL + Players.getPlayerByAddress(tournament.champion).fbId + Vault.fbGraphParams + "\" width=\"80px\">");
    myDiv.children(".vice_champion_picture_div").html("<img src=\"" + Vault.fbGraphURL + Players.getPlayerByAddress(tournament.viceChampion).fbId + Vault.fbGraphParams + "\" width=\"80px\">");
    myDiv.children(".third_place_picture_div").html("<img src=\"" + Vault.fbGraphURL + Players.getPlayerByAddress(tournament.thirdPlace).fbId + Vault.fbGraphParams + "\" width=\"80px\">");
  },

  ///////////////
  //UI:
  onHash: function(systemName, hash) {
    $("#" + systemName + "_result").html(Vault.getPendingHashMessage(hash));
  },

  onError: function(systemName, message) {
    $("#" + systemName + "_result").html(Vault.getColoredErrorMessage(message));
    Ui.hideButtonLoader(systemName);
  },

  onExecutionSuccess: function(systemName, receipt) {
    $("#" + systemName + "_result").html(Vault.getSuccessHashMessage(receipt.tx));
    Ui.hideButtonLoader(systemName);
    App.getAllAddresses();
  },

  showWaitingForMetamaskMsg: function(systemName) {
    $("#" + systemName + "_result").show();
    $("#" + systemName + "_result").html(Vault.getAwaitingMetamaskMessage());
  },
  
  showSection: function(sectionName) {
    for (var i=0; i<Vault.sections.length; i++){
      App.hideSection(Vault.sections[i]);
    }

    let targetSection = $("#"+sectionName);
    targetSection.show();
    $(this).addClass("active");
  },

  hideSection: function(sectionName) {
    let targetSection = $("#"+sectionName);
    targetSection.hide();
    $(this).removeClass("active");
  },

  metamaskConnect: function() {
    Metamon.connectToMetamask();
  },

  setConnectButtonVisibility: function(visible) {
    if(visible) {
      $("#user_div").hide();
      $("#connect_button_div").show();
    } else {
      $("#user_div").show();
      $("#connect_button_div").hide();
    }
  },

  showLoader: function(message) {
    $("#loader-message").html(message);
    $("#loader").show();
    $("#loader-message").show();
    $("#contentWrapper").hide();
  },

  hideLoader: function() {
    $("#loader").hide();
    $("#loader-message").hide();
    $("#contentWrapper").show();
  },

  onResize: function() {
    if(Metamon.currentUser() != 'undefined')
      Bgmon.activateBackground();
  },

  updateVersion: function() {
    $('#versionLabel').html("v " + Vault.version);
    $('#versionLabel').show();
  },

  copyUserToClipboard: function() {
    Metamon.copyUserToClipboard();
  },

  speeds: function() {
    console.log(Gasmon.speeds());
  },

  populateTournamentFormats: function() {
    $('newTournament_format').html("");

    for(var i = 0; i < Vault.formats.length; i++) {
      $('#newTournament_format').append("<option value=\"" + Vault.formats[i] + "\">" + Vault.formats[i] + "</option>");
    }
  },

  showContent: function() {
    $('.container').show();
    $('.navbar-nav').show();
    $('#metamask_warning').hide();
  },

  hideContent: function() {
    $('.container').hide();
    $('.navbar-nav').hide();
    $('#metamask_warning').show();
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof window.web3 !== 'undefined') {
    console.log("Using web3 detected from external source.")
    window.web3 = new Web3(web3.currentProvider);
    //window.web3 = window['ethereum'] || window.web3.currentProvider;
  } else {
    console.log("No web3 detected. Falling back to http://localhost:8545.");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});