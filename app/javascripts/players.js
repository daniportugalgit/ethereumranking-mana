var _list = [];
/*
Example of Player:
player.name //player's name
player.fbId //social ID
player.first //how many times finished a tournament in first place
player.second //how many times finished a tournament in second place
player.third //how many times finished a tournament in third place
player.points //total points achieved
 */

var _alias = [];
/*
_alias.push({name:"Alex Portugal", nickname:"Lex"});
_alias.push({name:"Andrés Camacho", nickname:"Dé"});
_alias.push({name:"Daniel Portugal", nickname:"Dani"});
_alias.push({name:"Fellipe Cicconi", nickname:"Cicconera"});
_alias.push({name:"Bruno Baggio", nickname:"Ôncio"});
_alias.push({name:"Igor Ibrahim", nickname:"Igão"});
_alias.push({name:"Ivan Martinez", nickname:"Ivaneided"});
*/

function addPlayer(myPlayer) {
	_list.push(myPlayer);
}

function clearList() {
	_list = [];
}

function getPlayerByAddress(address) {
	for(var i = 0; i < _list.length; i++) {
	  if(_list[i].address == address)
	    return _list[i];
	}

	return null;
}

function getPlayerByName(name) {
	for(var i = 0; i < _list.length; i++) {
	  if(_list[i].name == name)
	    return _list[i];
	}

	return null;
}

function getPlayerByAlias(alias) {
	for(var i = 0; i < _list.length; i++) {
	  if(getAlias(_list[i].name) == alias)
	    return _list[i];
	}

	return null;
}

function list() {
	return _list;
}

function getAlias(name) {
	for(var i = 0; i < _alias.length; i++) {
	  if(_alias[i].name == name)
	    return _alias[i].nickname;
	}

	return name.split(" ")[0];
}

function getAddressListByAliasList(aliasList) {
	let addressList = [];
	for(var i = 0; i < aliasList.length; i++) {
		addressList.push(getPlayerByAlias(aliasList[i]).address);
	}

	return addressList;
}

module.exports = {
	addPlayer,
	clearList,
	getPlayerByAddress,
	getPlayerByName,
	getPlayerByAlias,
	list,
	getAlias,
	getAddressListByAliasList
}