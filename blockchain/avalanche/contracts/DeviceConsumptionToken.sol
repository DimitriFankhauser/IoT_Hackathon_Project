// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeviceConsumptionToken is ERC20 {
    // Adresse des Verifiers – darf Tokens minten
    address public verifier;

    constructor() ERC20("Device Consumption Token", "WTF") {
        // Start: der Deploy-Account ist automatisch Verifier
        verifier = msg.sender;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized: only verifier");
        _;
    }

    // Setzt einen neuen Verifier (nur der aktuelle Verifier darf das)
    function setVerifier(address _verifier) external onlyVerifier {
        verifier = _verifier;
    }

    // Mint: erstellt neue Tokens
    function mint(address to, uint256 amount) external onlyVerifier {
        _mint(to, amount);
    }

    // Burn: vernichtet Tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
