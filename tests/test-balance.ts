import { expect } from "chai";
import { step } from "mocha-steps";

import { createAndFinalizeBlock, describeWithClover, customRequest, GENESIS_ACCOUNT, GENESIS_ACCOUNT_PRIVATE_KEY } from "./util";

describeWithClover("Clover RPC (Balance)", (context) => {
	const GENESIS_ACCOUNT_BALANCE = "1000000000000000000000";
	const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";

	step("genesis balance is setup correctly", async function () {
		expect(await context.web3.eth.getBalance(GENESIS_ACCOUNT)).to.equal(GENESIS_ACCOUNT_BALANCE);
	});

	step("balance to be updated after transfer", async function () {
		this.timeout(15000);

		const tx = await context.web3.eth.accounts.signTransaction({
			from: GENESIS_ACCOUNT,
			to: TEST_ACCOUNT,
			value: "0x200", // Must me higher than ExistentialDeposit (500)
			gasPrice: "0x01",
			gas: "0x100000",
		}, GENESIS_ACCOUNT_PRIVATE_KEY);
		await customRequest(context.web3, "eth_sendRawTransaction", [tx.rawTransaction]);
		await createAndFinalizeBlock(context.web3);
		// 999999999999999978488 + 512 + 21000 (gas price) = 1000000000000000000000
		expect(await context.web3.eth.getBalance(GENESIS_ACCOUNT)).to.equal("999999999999999978488");
		expect(await context.web3.eth.getBalance(TEST_ACCOUNT)).to.equal("512");
	});
});
