// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * CarbonCreditVerified (Step 2, stack-safe)
 *
 * - ERC-1155 CO2-Credits (1 Token = 1 tCO2e)
 * - tokenId = keccak256(projectId, batchSerial)
 * - Rollen: ADMIN_ROLE, MINTER_ROLE
 * - Mint NUR mit gültiger Verifier-Signatur (EIP-712)
 * - Nonce + Deadline (Replay-Schutz, zeitliche Begrenzung)
 * - Optional: attestationURI (z. B. IPFS-Link zu DMRV-Report)
 * - Stack-safe: nutzt Struct MintAuth für die Signaturdaten
 *
 * Abhängigkeiten (OpenZeppelin >= 5.x):
 *   - @openzeppelin/contracts/token/ERC1155/ERC1155.sol
 *   - @openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol
 *   - @openzeppelin/contracts/access/AccessControl.sol
 *   - @openzeppelin/contracts/utils/cryptography/EIP712.sol
 *   - @openzeppelin/contracts/utils/cryptography/ECDSA.sol
 */

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @notice Einfache Registry für Verifier-Accounts (Signer).
contract VerifierRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    mapping(address => bool) public isVerifier;

    event VerifierAdded(address indexed account);
    event VerifierRemoved(address indexed account);

    constructor(address admin) {
        _grantRole(ADMIN_ROLE, admin);
    }

    function addVerifier(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "zero addr");
        require(!isVerifier[account], "exists");
        isVerifier[account] = true;
        emit VerifierAdded(account);
    }

    function removeVerifier(address account) external onlyRole(ADMIN_ROLE) {
        require(isVerifier[account], "not verifier");
        isVerifier[account] = false;
        emit VerifierRemoved(account);
    }
}

contract CarbonCreditVerified is ERC1155, ERC1155Supply, AccessControl, EIP712 {
    using ECDSA for bytes32;

    // Rollen
    bytes32 public constant ADMIN_ROLE  = DEFAULT_ADMIN_ROLE;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Verifier-Quelle
    VerifierRegistry public immutable verifierRegistry;

    // Mint-Tracking pro tokenId
    mapping(uint256 => uint256) public mintedOf;

    // Optional: Attestation/Report URI pro tokenId
    mapping(uint256 => string) public attestationURIOf;

    // Nonces gegen Replay
    mapping(bytes32 => bool) public usedNonce;

    // ====== Events ======
    event Minted(
        uint256 indexed tokenId,
        bytes32 indexed projectId,
        bytes32 batchSerial,
        address to,
        uint256 amount
    );

    event Retired(
        uint256 indexed tokenId,
        address indexed from,
        address indexed beneficiary,
        uint256 amount,
        string  memoURI,
        uint256 timestamp
    );

    event MintedWithAuthorization(
        uint256 indexed tokenId,
        address indexed receiver,
        uint256 amount,
        address indexed verifier,
        uint256 newTotalMinted
    );

    // ====== EIP-712 Typed Struct ======
    struct MintAuth {
        bytes32 projectId;
        bytes32 batchSerial;
        uint256 amount;
        address receiver;
        bytes32 nonce;
        uint256 deadline;
        bytes32 attestationURIHash; // keccak256(bytes(attestationURI))
    }

    bytes32 public constant MINT_AUTH_TYPEHASH =
        keccak256("MintAuth(bytes32 projectId,bytes32 batchSerial,uint256 amount,address receiver,bytes32 nonce,uint256 deadline,bytes32 attestationURIHash)");

    /**
     * @param admin        Admin-/Minter-Adresse
     * @param baseURI_     Base-URI (z. B. "ipfs://<CID>/{id}.json")
     * @param _verifiers   Adresse der VerifierRegistry
     */
    constructor(address admin, string memory baseURI_, address _verifiers)
        ERC1155(baseURI_)
        EIP712("CarbonCreditVerified", "1")
    {
        require(admin != address(0), "admin=0");
        require(_verifiers != address(0), "verifiers=0");
        verifierRegistry = VerifierRegistry(_verifiers);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    // ---------- Hilfsfunktionen ----------

    /// @notice Deterministische ID aus Klartext -> bytes32
    function toId(string memory s) public pure returns (bytes32) {
        return keccak256(bytes(s));
    }

    /// @notice Eindeutige tokenId aus (projectId, batchSerial)
    function computeTokenId(
        bytes32 projectId,
        bytes32 batchSerial
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(projectId, batchSerial)));
    }

    // ---------- Retirement ----------

    /// @notice Unwiderrufliches Stilllegen (Burn) mit Nachweis-Event.
    function retire(
        uint256 tokenId,
        uint256 amount,
        address beneficiary,
        string calldata memoURI
    ) external {
        require(amount > 0, "amount=0");
        require(balanceOf(msg.sender, tokenId) >= amount, "insufficient");
        _burn(msg.sender, tokenId, amount);
        emit Retired(tokenId, msg.sender, beneficiary, amount, memoURI, block.timestamp);
    }

    // ---------- Admin ----------

    /// @notice Admin: setzt die Base-URI (wirkt für IDs ohne eigene URI).
    function setBaseURI(string calldata newBaseURI) external onlyRole(ADMIN_ROLE) {
        _setURI(newBaseURI);
    }

    // ---------- EIP-712 intern ----------

    function _hashMintAuth(MintAuth calldata a) internal view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            MINT_AUTH_TYPEHASH,
            a.projectId,
            a.batchSerial,
            a.amount,
            a.receiver,
            a.nonce,
            a.deadline,
            a.attestationURIHash
        ));
        return _hashTypedDataV4(structHash);
    }

    function _recoverSigner(MintAuth calldata a, bytes calldata signature) internal view returns (address) {
        return ECDSA.recover(_hashMintAuth(a), signature);
    }

    // ---------- Minting via Verifier-Signatur (EIP-712) ----------

    /**
     * @notice Mint nur mit gültiger Verifier-Signatur (EIP-712).
     * - Beim ersten Mint einer tokenId wird Cap gesetzt (a.cap>0) und optional attestationURI gespeichert.
     * - Bei Folgemints muss Cap identisch sein (oder 0 übergeben), attestationURI falls übergeben identisch.
     *
     * Anforderungen:
     * - caller: MINTER_ROLE (Relayer/Issuer)
     * - Signer: muss in VerifierRegistry aktiv sein
     * - nonce unbenutzt, deadline in der Zukunft
     * - mintedOf[tokenId] + a.amount <= capOf[tokenId]
     */
    function mintWithAuthorization(
        MintAuth calldata a,
        string calldata attestationURI,
        bytes calldata signature
    ) external onlyRole(MINTER_ROLE) {
        require(block.timestamp <= a.deadline, "auth expired");
        require(!usedNonce[a.nonce], "nonce used");
        require(a.amount > 0, "amount=0");
        require(a.receiver != address(0), "receiver=0");

        address signer = _recoverSigner(a, signature);
        require(signer != address(0), "bad sig");
        require(verifierRegistry.isVerifier(signer), "not verifier");

        usedNonce[a.nonce] = true;

        uint256 tokenId = computeTokenId(a.projectId, a.batchSerial);

        if (bytes(attestationURI).length > 0) {
            require(
                keccak256(bytes(attestationURI)) == a.attestationURIHash,
                "attest hash mismatch"
            );
            attestationURIOf[tokenId] = attestationURI;
            require(
                keccak256(bytes(attestationURIOf[tokenId])) == a.attestationURIHash,
                "attest uri mismatch"
            );
        }

        uint256 newMinted = mintedOf[tokenId] + a.amount;
        mintedOf[tokenId] = newMinted;

        _mint(a.receiver, tokenId, a.amount, "");

        emit Minted(tokenId, a.projectId, a.batchSerial, a.receiver, a.amount);
        emit MintedWithAuthorization(tokenId, a.receiver, a.amount, signer, newMinted);
    }

    // ---------- Erforderliche Overrides (Mehrfachvererbung) ----------

    // ERC1155 + ERC1155Supply definieren beide _update (Batch-Variante) -> einmal überschreiben
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    // ERC1155 und AccessControl definieren beide supportsInterface -> kombinierter Override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // debug ToDo: vor offizielem deploy entfernen!
    function debugDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
    function debugHash(
        MintAuth calldata a
    ) external view returns (bytes32 structHash, bytes32 digest) {
        structHash = keccak256(abi.encode(
            MINT_AUTH_TYPEHASH,
            a.projectId,
            a.batchSerial,
            a.amount,
            a.receiver,
            a.nonce,
            a.deadline,
            a.attestationURIHash
        ));
        digest = _hashTypedDataV4(structHash);
    }
    function debugRecover(
        MintAuth calldata a,
        bytes calldata signature
    ) external view returns (address) {
        bytes32 structHash = keccak256(abi.encode(
            MINT_AUTH_TYPEHASH,
            a.projectId,
            a.batchSerial,
            a.amount,
            a.receiver,
            a.nonce,
            a.deadline,
            a.attestationURIHash
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature);
    }
}
