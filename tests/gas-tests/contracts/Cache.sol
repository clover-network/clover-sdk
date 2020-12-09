pragma solidity >=0.4.22 <0.7.0;
contract Cache {
    constructor () public {}

    mapping(address=>uint256) public data;

    function setValue(uint256 _value) public {
        data[msg.sender] = _value;
    }

    function getValue(address addr) public view returns (uint256) {
        return data[addr];
    }
}

