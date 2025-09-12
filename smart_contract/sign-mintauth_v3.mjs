// sign-mintauth.mjs
import { ethers } from "ethers";
import { TypedDataEncoder } from "ethers";

// ==== ANPASSEN (3 Felder!) ====
const CONTRACT_ADDRESS     = "0x09197b6faf9f5ADE46D476A0061F0119FB681367"; // Adresse deines Step-2-Contracts
const RECEIVER             = "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db";        // wohin gemintet wird
const VERIFIER_PRIVATE_KEY = "0xa844565f7de438a8933808aeac0fce79e7498826876764327acfb6cfafeeb70b"; // Hex-PrivKey der Verifier-Adresse
// ==== ENDE ANPASSEN ====

const CHAIN_ID = 1; // Remix/Hardhat

// Werte aus deiner Nachricht:
const ATTESTATION_URI = "ipfs://bafybeigiusz6umnusy342ao4ykn4i6vq6we7zsewl7mxp5lwtkg77w4snq/dmrv_report.json";

// Helper
const toId = (s) => ethers.keccak256(ethers.toUtf8Bytes(s));

const a = {
  projectId:   toId("Tomatofarm-zug"), // passe bei Bedarf an (oder nimm deine eigenen Keys)
  batchSerial: toId("audit-2"),
  amount:      500,                   // 1 Token = 1 tCO2e
  receiver:    RECEIVER,
  nonce:       ethers.hexlify(ethers.randomBytes(32)),
  deadline:    Math.floor(Date.now()/1000) + 6*3600, // 6h gültig
  attestationURIHash: ethers.keccak256(ethers.toUtf8Bytes(ATTESTATION_URI))
};

const domain = {
  name: "CarbonCreditVerified",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS
};

const types = {
  MintAuth: [
    { name: "projectId", type: "bytes32" },
    { name: "batchSerial", type: "bytes32" },
    { name: "amount", type: "uint256" },
    { name: "receiver", type: "address" },
    { name: "nonce", type: "bytes32" },
    { name: "deadline", type: "uint256" },
    { name: "attestationURIHash", type: "bytes32" }
  ]
};

const signer = new ethers.Wallet(VERIFIER_PRIVATE_KEY);
const signature = await signer.signTypedData(domain, types, a);

// Sanity: Länge prüfen (132 inkl. 0x)
console.log("signature length =", signature.length); // sollte 132 sein
if (signature.length !== 132) {
  throw new Error("Signatur hat nicht 65 Bytes (132 hex inkl. 0x).");
}

// 1) Länge checken
console.log("signature length =", signature.length); // muss 132 sein

// 2) Hash/Digest wie on-chain
const digest = TypedDataEncoder.hash(domain, types, a);
console.log("digest =", digest);

// Wer wurde wiederhergestellt?
const recovered = ethers.verifyTypedData(domain, types, a, signature);
console.log("Recovered signer =", recovered);




// Ausgabe für Remix
console.log("\n== Remix Eingaben ==");
console.log("\na (Tuple) = [");
console.log(`  "${a.projectId}",`);
console.log(`  "${a.batchSerial}",`);
console.log(`  ${a.amount},`);
console.log(`  "${a.receiver}",`);
console.log(`  "${a.nonce}",`);
console.log(`  ${a.deadline},`);
console.log(`  "${a.attestationURIHash}"`);
console.log("]");
console.log(`\nattestationURI = "${ATTESTATION_URI}"`);
console.log(`\nsignature = ${signature}`);
console.log(`\nVerifier address = ${signer.address}`);
