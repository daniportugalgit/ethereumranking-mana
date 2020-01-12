let MTGNoonRankingABI = artifacts.require("MTGNoonRanking");

module.exports = async function(deployer, network, accounts) {
	await deployer.deploy(MTGNoonRankingABI);
};