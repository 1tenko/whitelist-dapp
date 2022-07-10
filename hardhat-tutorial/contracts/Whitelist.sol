//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    // max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    // if an address is whitelisted, we would set to true
    // it is false by default for all other addresses
    mapping(address => bool) public whitelistedAddresses;

    // this would be used to keep track of how many addresses have been whitelisted
    uint8 public numAddressesWhitelisted;

    // setting the max number of whitelisted addresses
    // user will input the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // this funtion adds the address of the sender to the whitelist
    function addAddressToWhitelist() public {
        // checks if the user has already been whitelisted
        require(
            !whitelistedAddresses[msg.sender],
            "Sender has already been whitelisted."
        );

        // checks if the  if the numAddressesWhitelisted < maxWhitelistedAddresses
        // if not, then throw an error
        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "Limit reached, no more addresses can be added"
        );

        // add the address which called the function to the whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;

        // increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;
    }
}
