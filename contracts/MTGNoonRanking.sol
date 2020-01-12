pragma solidity 0.5.3;

contract Ownable {
    address payable public owner;
    
    event OwnershipTransferred(address newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address payable newOwner) onlyOwner public  {
        require(newOwner != address(0));

        owner = newOwner;

        emit OwnershipTransferred(newOwner);
    }
}

contract MTGNoonRanking is Ownable {
	uint public tournamentCount;

	struct Player {
		string name; //player name
		uint firstPlace; //how many times has won the tournament
		uint secondPlace; //how many times has come in second place
		uint thirdPlace; //how many times has come in third place
		uint fbId;
		bool exists;
	}

	struct Tournament {
		string date;
		string format;
		address[] ranking;
	}

	mapping(address => Player) public players;
	mapping(bytes32 => Tournament) private _tournaments;

	address[] public playerList;
	
	event NewTournament(bytes32 id, string date, string format, address indexed champion, address indexed viceChampion, address indexed thirdPlace);
	event NewPlayer(string playerName);

	constructor() Ownable() public {
		//newPlayer(0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c, "Alex Portugal", 1129603824);
		newPlayer(0xdCe35a43265653F95f180E1ba165AFc0eE54FA83, "Andrés Camacho", 1137004145);
		newPlayer(0x6F165B30ee4bFc9565E977Ae252E4110624ab147, "Daniel Portugal", 1732225227);
		newPlayer(0x5F6207bbA080552C205cC975EF2879c4C255a575, "Fellipe Cicconi", 614768563);
		//newPlayer(0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB, "Igor Ibrahim", 1327742419);
		newPlayer(0x960ab26FD09F06b8e51F70aDA89760bBB5DEB4D9, "Ivan Martinez", 1111568276);
		//newPlayer(0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C, "Bruno Baggio", 100000721361697);
	}

	function newTournament(string memory date, string memory format, address[] memory ranking) onlyOwner public returns(bytes32) {
		require(ranking.length >= 3, "Tournaments must have at least 3 players.");

		tournamentCount++;
		bytes32 myAddress = keccak256(abi.encodePacked(address(this), date, format, tournamentCount));

		_tournaments[myAddress] = Tournament(date, format, ranking);

		players[ranking[0]].firstPlace++;
		players[ranking[1]].secondPlace++;
		players[ranking[2]].thirdPlace++;

		emit NewTournament(myAddress, date, format, ranking[0], ranking[1], ranking[2]);

		return myAddress;
	}

	function newPlayer(address playerAddress, string memory playerName, uint fbId) onlyOwner public returns(bool) {
		require(!players[playerAddress].exists, "Player already exists");

		players[playerAddress] = Player(playerName, 0, 0, 0, fbId, true);
		playerList.push(playerAddress);

		emit NewPlayer(playerName);

		return true;
	}

	function getTournament(bytes32 id) public view returns(string memory date, string memory format, address[] memory ranking) {
		Tournament memory myTournament = _tournaments[id];

		return (myTournament.date, myTournament.format, myTournament.ranking);
	}

	function getAllPlayers() public view returns(address[] memory) {
		return playerList;
	}
}