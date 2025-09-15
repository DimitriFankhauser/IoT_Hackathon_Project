// sign-mintauth.mjs
import { ethers } from "ethers";
import { TypedDataEncoder } from "ethers";

// ===== Zertifikatsdaten (nur hier anpassen) =====
const PROJECT_NAME         = "Meier Gemüse";                                          // <-- einsetzen
const BATCH                = "report-2025-11-tomatofarm";                             // <-- einsetzen
const AMOUNT               = 1000;                                                     // <-- tCO2e Menge
const RECEIVER             = "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db";            // <-- einsetzen
const ATTESTATION_URI      = "ipfs://bafybeibdnlcu4th3csu64hyqpg5kzcuzkzjxauocdnrxjmu5khfvwqokze/dmrv_report_2.png";  // dein DMRV Link
// =====================================

// ===== KONFIG (nur hier anpassen) =====
const CONTRACT_ADDRESS     = "0x62FF318Bee4D6d605D163Ed3325077E32803599B";                             // <-- einsetzen
const VERIFIER_PRIVATE_KEY = "0xf343568f0bee18f8fb3eed4ca89b5bc3a17130ddedc5950850f9915c2c35d080";     // <-- einsetzen
const CHAIN_ID             = 1;                                                                        // z.B. 1 (Remix VM), 1337, 31337, 3333
// =====================================




// Helpers
const toId = (s) => ethers.keccak256(ethers.toUtf8Bytes(s));
const hexToBigInt = (h) => BigInt(h);

// ⚠️ Tuple a: NICHT ändern (so lassen, wie du es aktuell verwendest)!
const a = {
  // --- Beispielwerte, deine bleiben wie gehabt ---
  projectId:   toId(PROJECT_NAME),
  // Wenn dein a KEIN vintage hat, lass diese Zeile KOMPLETT weg
  // vintage:     2024,
  batchSerial: toId(BATCH),
  amount:      AMOUNT,
  receiver:    RECEIVER,
  nonce:       ethers.hexlify(ethers.randomBytes(32)),
  deadline:    Math.floor(Date.now()/1000) + 6*3600,
  // Wenn dein a KEIN cap hat, lass es weg
  // cap:         500,
  attestationURIHash: ethers.keccak256(ethers.toUtf8Bytes(ATTESTATION_URI)),
};

// EIP-712 Domain & Types (an deinen Contract angepasst)
const domain = {
  name: "CarbonCreditVerified",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const types = {
  MintAuth: [
    { name: "projectId", type: "bytes32" },
    // { name: "vintage", type: "uint16" },
    { name: "batchSerial", type: "bytes32" },
    { name: "amount", type: "uint256" },
    { name: "receiver", type: "address" },
    { name: "nonce", type: "bytes32" },
    { name: "deadline", type: "uint256" },
    // { name: "cap", type: "uint256" },
    { name: "attestationURIHash", type: "bytes32" },
  ],
};

// === Signatur erstellen ===
const signer = new ethers.Wallet(VERIFIER_PRIVATE_KEY);
const signature = await signer.signTypedData(domain, types, a);

// === Sanity-Checks ===
const digest = TypedDataEncoder.hash(domain, types, a);
const recovered = ethers.verifyTypedData(domain, types, a, signature);

// === tokenId wie on-chain berechnen ===
// WICHTIG: Nutze die Variante, die zu deinem Contract passt:
let tokenIdHex;

tokenIdHex = ethers.keccak256(ethers.solidityPacked(
  ["bytes32","bytes32"],
  [a.projectId, a.batchSerial]
));

const tokenIdDec = hexToBigInt(tokenIdHex);

// ============== SCHÖNE AUSGABE ==============
const line = (title="") => console.log(`\n========== ${title} ==========\n`);

line("CHECKS");
console.log("Chain ID (domain):           ", CHAIN_ID);
console.log("Contract (domain):           ", CONTRACT_ADDRESS);
console.log("Signature length:            ", signature.length, "(sollte 132 sein)");
console.log("Digest:                      ", digest);
console.log("Recovered signer (Verifier): ", recovered);
console.log("Verifier (from PrivKey):     ", signer.address);

line("DERIVED IDS");
console.log("projectId:                   ", a.projectId);
console.log("batchSerial:                 ", a.batchSerial);
console.log("=> tokenId (hex):            ", tokenIdHex);
console.log("=> tokenId (decimal):        ", tokenIdDec.toString());

line("Zertifikats Daten)");
console.log("Project Name:                ", PROJECT_NAME);
console.log("Batch Serial:                ", BATCH);
console.log("Amount:                      ", AMOUNT);
console.log("Receiver:                    ", RECEIVER);
console.log("Attestation URI:             ", ATTESTATION_URI);

line("Eintragung Blockchain (für Remix)");
console.log(`a =                          ["${a.projectId}", "${a.batchSerial}", ${a.amount}, "${a.receiver}", "${a.nonce}", ${a.deadline}, "${a.attestationURIHash}"]`);
console.log("attestationURI =             ", `"${ATTESTATION_URI}"`);
console.log("signature      =             ", signature);

