import { expect } from "chai";
import { step } from "mocha-steps";
import { describeWithClover, customRequest } from "./util";

describeWithClover("Clover RPC (Web3Api)", (context) => {

	step("should get client version", async function () {
		const version = await context.web3.eth.getNodeInfo();
		expect(version).to.be.equal("node-frontier-template/v1.1/fc-rpc-0.1.0");
	});

	step("should remote sha3", async function () {
		const data = context.web3.utils.stringToHex("hello");
		const hash = await customRequest(context.web3, "web3_sha3", [data]);
		const local_hash = context.web3.utils.sha3("hello");
		expect(hash.result).to.be.equal(local_hash);
	});
});
