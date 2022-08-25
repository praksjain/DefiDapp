// SPDX-License-Identifier: MIT
// Digital bank - user can earn interest by depositing some amount

pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./PrakToken.sol";

contract DigitalBank {
    string public name = "Digital Bank";
    DaiToken public daiToken;
    PrakToken public prakToken;
    address public owner;

    mapping(address => uint256) public stakeBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public currentStakingStatus;
    address[] public stakers;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only for owner");
        _;
    }

    constructor(DaiToken _daiToken, PrakToken _prakToken) public {
        daiToken = _daiToken;
        prakToken = _prakToken;
        owner = msg.sender;
    }

    // Stake tokens
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "Amount must be greate than 0");
        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakeBalance[msg.sender] += _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        hasStaked[msg.sender] = true;
        currentStakingStatus[msg.sender] = true;
        // daiToken.approve(msg.sender, _amount);
    }

    // Unstake tokens (Withdraw)
    function unstakeTokens() public {
        uint256 balance = stakeBalance[msg.sender];
        require(balance > 0);
        daiToken.transfer(msg.sender, balance);

        // Resetting
        currentStakingStatus[msg.sender] = false;
        stakeBalance[msg.sender] = 0;
    }

    // Issue tokens
    function issueTokens() public onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            uint256 balance = stakeBalance[stakers[i]];
            if (balance > 0) {
                prakToken.transfer(stakers[i], balance);
            }
        }
    }
}
