import { expect } from "chai";
import { step } from "mocha-steps";

import { createAndFinalizeBlock, describeWithClover } from "./util";

describeWithClover("Clover RPC (Block)", (context) => {
	let previousBlock;
	// Those tests are dependant of each other in the given order.
	// The reason is to avoid having to restart the node each time
	// Running them individually will result in failure

	it("should return genesis block", async function () {
		const block = await context.web3.eth.getBlock(0);
		expect(block).to.include({
			author: "0x0000000000000000000000000000000000000000",
			difficulty: "0",
			extraData: "0x",
			gasLimit: 0,
			gasUsed: 0,
			logsBloom:
				"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
			miner: "0x0000000000000000000000000000000000000000",
			number: 0,
			receiptsRoot: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
			size: 501,
			timestamp: 0,
			totalDifficulty: null,
		});

		expect((block as any).sealFields).to.eql([
			"0x0000000000000000000000000000000000000000000000000000000000000000",
			"0x0000000000000000",
		]);
		expect(block.hash).to.be.a("string").lengthOf(66);
		expect(block.parentHash).to.be.a("string").lengthOf(66);
		expect(block.timestamp).to.be.a("number");
	});

	step("should have empty uncles and correct sha3Uncles", async function () {
		const block = await context.web3.eth.getBlock(0);
		expect(block.uncles).to.be.a("array").empty;
		expect(block.sha3Uncles).to.equal("0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347");
	});

	step("should have empty transactions and correct transactionRoot", async function () {
		const block = await context.web3.eth.getBlock(0);
		expect(block.transactions).to.be.a("array").empty;
		expect(block).to.include({
			transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
		});
	});

	let firstBlockCreated = false;
	step("should be at block 1 after block production", async function () {
		this.timeout(15000);
		await createAndFinalizeBlock(context.web3);
		expect(await context.web3.eth.getBlockNumber()).to.greaterThan(1);
		firstBlockCreated = true;
	});

	step("should have valid timestamp after block production", async function () {
		const block = await context.web3.eth.getBlock("latest");
		expect(block.timestamp).to.be.greaterThan(0);
	});

	step("retrieve block information", async function () {
		expect(firstBlockCreated).to.be.true;

		const block = await context.web3.eth.getBlock(1);
		expect(block).to.include({
			author: "0x15fdd31c61141abd04a99fd6822c8558854ccde3",
			difficulty: "0",
			extraData: "0x",
			gasLimit: 0,
			gasUsed: 0,
			//hash: "0x14fe6f7c93597f79b901f8b5d7a84277a90915b8d355959b587e18de34f1dc17",
			logsBloom:
				"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
			miner: "0x15fdd31C61141abd04A99FD6822c8558854ccDe3",
			number: 1,
			//parentHash: "0x04540257811b46d103d9896e7807040e7de5080e285841c5430d1a81588a0ce4",
			receiptsRoot: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
			size: 507,
			totalDifficulty: null,
			//transactions: [],
			transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
			//uncles: []
		});
		previousBlock = block;

		expect(block.transactions).to.be.a("array").empty;
		expect(block.uncles).to.be.a("array").empty;
		expect((block as any).sealFields).to.eql([
			"0x0000000000000000000000000000000000000000000000000000000000000000",
			"0x0000000000000000",
		]);
		expect(block.hash).to.be.a("string").lengthOf(66);
		expect(block.parentHash).to.be.a("string").lengthOf(66);
		expect(block.timestamp).to.be.a("number");
	});

	step("get block by hash", async function() {
		const latest_block = await context.web3.eth.getBlock("latest");
		const block = await context.web3.eth.getBlock(latest_block.hash);
		expect(block.hash).to.be.eq(latest_block.hash);
	});

	step("get block by number", async function() {
		const block = await context.web3.eth.getBlock(1);
		expect(block).not.null;
	});

	step("should include previous block hash as parent", async function () {
		await createAndFinalizeBlock(context.web3);
		const block = await context.web3.eth.getBlock(2);
		expect(block.hash).to.not.equal(previousBlock.hash);
		expect(block.parentHash).to.equal(previousBlock.hash);
	});
});
