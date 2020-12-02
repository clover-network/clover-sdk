import Web3 from "web3";
import { JsonRpcResponse } from "web3-core-helpers";
import { spawn, ChildProcess } from "child_process";

export const PORT = 19931;
export const RPC_PORT = 19932;
export const WS_PORT = 19933;

export const DISPLAY_LOG = process.env.CLOVER_LOG || false;
export const CLOVER_LOG = process.env.CLOVER_LOG || "info";

export const BINARY_PATH = process.env.CLOVER;
export const SPAWNING_TIME = 60000;

export const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
export const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

export async function customRequest(web3: Web3, method: string, params: any[]) {
	return new Promise<JsonRpcResponse>((resolve, reject) => {
		(web3.currentProvider as any).send(
			{
				jsonrpc: "2.0",
				id: 1,
				method,
				params,
			},
			(error: Error | null, result?: JsonRpcResponse) => {
				if (error) {
					reject(
						`Failed to send custom request (${method} (${params.join(",")})): ${
							error.message || error.toString()
						}`
					);
				}
				resolve(result);
			}
		);
	});
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Wait a block to finalize.
// It will include all previously executed transactions since the last finalized block.
export async function createAndFinalizeBlock(web3: Web3) {
	const currentBlock = await web3.eth.getBlockNumber();
	while(true) {
		try {
			const newBlock = await web3.eth.getBlock(currentBlock + 1);
			if (newBlock) {
				break;
			}
		} catch (err) {
			await sleep(1000);
		}
	}
}

export async function startCloverNode(provider?: string): Promise<{ web3: Web3; binary: ChildProcess }> {

	var web3;
	if (!provider || provider == 'http') {
		web3 = new Web3(`http://localhost:${RPC_PORT}`);
	}

	const cmd = BINARY_PATH;
	const args = [
		`--dev`,
		`--validator`,
		`--execution=Native`, // Faster execution using native
		`--rpc-cors=all`,
		`--unsafe-rpc-external`,
		`--unsafe-ws-external`,
		`-l${CLOVER_LOG}`,
		`--port=${PORT}`,
		`--rpc-port=${RPC_PORT}`,
		`--ws-port=${WS_PORT}`,
		`--tmp`,
	];
	const binary = spawn(cmd, args);

	binary.on("error", (err) => {
		if ((err as any).errno == "ENOENT") {
			console.error(
				`\x1b[31mMissing Frontier binary (${BINARY_PATH}).\nPlease compile the Clover project:\ncargo build\x1b[0m`
			);
		} else {
			console.error(err);
		}
		process.exit(1);
	});

	const binaryLogs = [];
	await new Promise((resolve) => {
		const timer = setTimeout(() => {
			console.error(`\x1b[31m Failed to start Clover Node.\x1b[0m`);
			console.error(`Command: ${cmd} ${args.join(" ")}`);
			console.error(`Logs:`);
			console.error(binaryLogs.map((chunk) => chunk.toString()).join("\n"));
			process.exit(1);
		}, SPAWNING_TIME - 2000);

		const onData = async (chunk) => {
			if (DISPLAY_LOG) {
				console.log(chunk.toString());
			}
			binaryLogs.push(chunk);
			if (chunk.toString().match(/Next epoch starts/)) {
				if (!provider || provider == "http") {
					// This is needed as the EVM runtime needs to warmup with a first call
					await web3.eth.getChainId();
				}

				clearTimeout(timer);
				if (!DISPLAY_LOG) {
					binary.stderr.off("data", onData);
					binary.stdout.off("data", onData);
				}
				// console.log(`\x1b[31m Starting RPC\x1b[0m`);
				resolve();
			}
		};
		binary.stderr.on("data", onData);
		binary.stdout.on("data", onData);
	});

	if (provider == 'ws') {
		web3 = new Web3(`ws://localhost:${WS_PORT}`);
	}

	return { web3, binary };
}

export function describeWithClover(title: string, cb: (context: { web3: Web3 }) => void, provider?: string) {
	describe(title, () => {
		let context: { web3: Web3 } = { web3: null };
		let binary: ChildProcess;
		// Making sure the Clover node has started
		before("Starting Clover Test Node", async function () {
			this.timeout(SPAWNING_TIME);
			const init = await startCloverNode(provider);
			context.web3 = init.web3;
			binary = init.binary;
		});

		after(async function () {
			//console.log(`\x1b[31m Killing RPC\x1b[0m`);
			binary.kill();
		});

		cb(context);
	});
}
