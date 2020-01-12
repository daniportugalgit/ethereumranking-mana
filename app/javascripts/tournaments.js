var _list = [];

function setListFromEvents(myList) {
	_list = [];

	for(var i = 0; i < myList.length; i++) {
		_list.push(myList[i].returnValues);
	}
}

function list() {
	return _list;
}

module.exports = {
	setListFromEvents,
	list
}