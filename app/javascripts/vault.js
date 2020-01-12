const version = "0.2.6";
const sections = ["sec_ranking", "sec_tournaments", "sec_admin"];
const formats = ["Draft", "Modern", "Commander", "Tiny Leaders", "2HG",
				 "Standard", "Legacy", "Vintage", "Brawl", "Pioneer",
				 "Conspiracy", "Sealed", "Pauper", "Cube", "Vanguard",
				 "Planar", "Archenemy", "Kingdom", "Emperor", "Titan Arena"];

const fbGraphURL = "http://graph.facebook.com/"
const fbGraphParams = "/picture?type=large";

var _mainnet = "0xCd4E86682B66255c34290a22a5e7822dc2F0B366";
var _ropsten = "0x4c2A1605bbA1eA99c84C520832E4C37ED703C493";
var _currentContractAddress = _ropsten;

var _deployBlockLocal = 1;
var _deployBlockRopsten = 7114853;
var _deployBlockMainnet = 9268463;
var _currentDeployBlock = _deployBlockLocal;

var _etherscanRopstenURL = "https://ropsten.etherscan.io/tx/";
var _etherscanMainnetURL = "https://etherscan.io/tx/";
var _currentEtherscanURL = _etherscanRopstenURL;

var _messages = {};
_messages.success = "(sucesso)";
_messages.pending = "(aguardando mineração...)";
_messages.calling = "";
_messages.waitingMetamask = "METAMASK: aguardando aprovação...";
_messages.coloredPending = "<span style='color:purple'>" + _messages.pending + "</span>";
_messages.coloredSuccess = "<span style='color:green'>" + _messages.success + "</span>";

function getPendingHashMessage(hash) {
	let url = _currentEtherscanURL + hash;
    return "<a target='_blank' href='" + url + "''>" + hash + "</a> " + _messages.coloredPending;
}

function getSuccessHashMessage(hash) {
	let url = _currentEtherscanURL + hash;
    return "<a target='_blank' href='" + url + "''>" + hash + "</a> " + _messages.coloredSuccess;
}

function getColoredErrorMessage(msg) {
	return "<span style='color:red'>" + msg + "</span>";
}

function getAwaitingMetamaskMessage() {
	return _messages.waitingMetamask;
}

function currentAddress() {
	return _currentContractAddress;
}

function currentEtherscanURL() {
	return _currentEtherscanURL;
}

function setRopstenEnvironment() {
	_currentContractAddress = _ropsten;
	_currentEtherscanURL = _etherscanRopstenURL;
	_currentDeployBlock = _deployBlockRopsten;
}

function setMainnetEnvironment() {
	_currentContractAddress = _mainnet;
	_currentEtherscanURL = _etherscanMainnetURL;
	_currentDeployBlock = _deployBlockMainnet;
}

function setEnvironment(currentNetwork) {
	if(currentNetwork == 1) {
		setMainnetEnvironment();
	} else if(currentNetwork == 3) {
		setRopstenEnvironment();
	}
}

function deployBlock() {
	return _currentDeployBlock;
}

module.exports = {
	version,
	sections,
	formats,
	fbGraphURL,
	fbGraphParams,
	getPendingHashMessage,
	getSuccessHashMessage,
	getColoredErrorMessage,
	getAwaitingMetamaskMessage,
	currentAddress,
	currentEtherscanURL,
	setRopstenEnvironment,
	setMainnetEnvironment,
	setEnvironment,
	deployBlock
}