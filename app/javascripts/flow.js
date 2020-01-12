/**
 * @author Daniel Portugal daniportugal@gmail.com
 * 
 * Flow forfeits the normal promisse flow in favor of a callback flow.
 * It's just a matter of code styling personal preference.
**/

/**
 * Calls a SOL getter and calls back onResult and onError.
 * @param {truffle-contract} contract a deployed truffle-contract
 * @param {string} functionName the name of the SOL function to be called
 * @param {any[]} solParams parameters to be passed to the SOL function
 * @param {function} onResult callback function: success
 * @param {function} onError callback function: error
 * @param {function} extraParam arbitrary parameter you can pass to the result callback
 * @callback onResult(functionName, response);
 * @callback onError(functionName, errorMessage);
 */
function call(contract, functionName, solParams, onResult, onError, extraParam) {
	contract[functionName].call.apply(null, solParams)
	  .on('error', function(error) {
	    onError(functionName, error.message);
	  })
	  .then(function(response){
	    onResult(functionName, response, extraParam);
	  })
	  //.catch((error) => {
	    //onError(functionName, error.message);
	  //});
}

/**
 * Executes a SOL function and calls back onTxHash, onResult and onError.
 * @param {truffle-contract} contract a deployed truffle-contract
 * @param {string} functionName the name of the SOL function to be called
 * @param {any[]} solParams parameters to be passed to the SOL function
 * @param {object} options SOL options object, such as {from:currentUser}
 * @param {function} onTxHash callback function: tx hash
 * @param {function} onResult callback function: success
 * @param {function} onError callback function: error
 * @callback onTxHash(functionName, txHash);
 * @callback onResult(functionName, receipt);
 * @callback onError(functionName, errorMessage);
 */
function exec(contract, functionName, solParams, options, onTxHash, onResult, onError) {
	solParams.push(options);
    	
	contract[functionName].sendTransaction.apply(null, solParams)
      .once('transactionHash', function(hash) {
        onTxHash(functionName, hash);
      })
      .on('error', function(error) {
        onError(functionName, error.message);
      })
      .then(function(receipt){
        onResult(functionName, receipt);
      })
      //.catch((error) => {
        //onError(functionName, error.message);
      //});
}

//Same as exec(), but for overloaded functions
function execBySig(contract, functionSignature, solParams, options, onTxHash, onResult, onError) {
	let functionName = functionSignature.split("(")[0];

	solParams.push(options);
    	
	contract.methods[functionSignature].sendTransaction.apply(null, solParams)
      .once('transactionHash', function(hash) {
        onTxHash(functionName, hash);
      })
      .on('error', function(error) {
        onError(functionName, error.message);
      })
      .then(function(receipt){
        onResult(functionName, receipt);
      })
      //.catch((error) => {
      //  onError(functionName, error.message);
      //});
}

module.exports = {
  call,
  exec,
  execBySig
};