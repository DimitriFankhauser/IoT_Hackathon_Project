const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const Billing = await hre.ethers.getContractFactory("DeviceConsumptionToken");
    const billing = await Billing.deploy();
    await billing.deployed();

    const contractAddress = billing.address;
    console.log("Billing contract deployed to:", contractAddress);

    // Write contract address to .env file
    const envPath = path.join(__dirname, "..", ".env");

    try {
        // Read existing .env file if it exists
        let existingContent = "";
        if (fs.existsSync(envPath)) {
            existingContent = fs.readFileSync(envPath, "utf8");
        }

        // Remove any existing CONTRACT_ADDRESS line and add the new one
        const lines = existingContent.split("\n");
        const filteredLines = lines.filter(line => !line.startsWith("CONTRACT_ADDRESS="));
        filteredLines.push(`CONTRACT_ADDRESS=${contractAddress}`);

        // Write back to .env file
        fs.writeFileSync(envPath, filteredLines.join("\n"));
        console.log("Contract address written to .env file");

    } catch (error) {
        console.warn("Could not write to .env file:", error.message);
        console.log("Please manually set CONTRACT_ADDRESS in your .env file:");
        console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
