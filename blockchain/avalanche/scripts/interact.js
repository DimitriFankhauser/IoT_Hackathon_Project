const { ethers } = require("hardhat");

async function main() {
    console.log("=== DeviceConsumptionToken Trust-Based System Demo ===\n");

    // Get provider from Hardhat
    const provider = ethers.provider;

    // Get signers
    const owner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const customer = new ethers.Wallet(process.env.CUSTOMER_KEY, provider);
    console.log("Owner address:", owner.address);
    console.log("Customer address:", customer.address);
    console.log();

    // Connect to existing deployed contract
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS environment variable not set. Please deploy the contract first using deploy.js");
    }

    console.log("Connecting to deployed contract at:", contractAddress);
    const DeviceConsumptionToken = await ethers.getContractFactory("DeviceConsumptionToken");
    const contract = DeviceConsumptionToken.attach(contractAddress).connect(owner);
    console.log("Connected to contract successfully");
    console.log();

    // Mint tokens for customer to pay bills
    console.log("=== Minting Tokens for Customer ===");
    const mintAmount = ethers.utils.parseUnits("1000", 18); // 1000 eCHF

    const mintTx = await contract.mint(customer.address, mintAmount);
    await mintTx.wait();
    console.log(`Minted ${ethers.utils.formatUnits(mintAmount, 18)} eCHF to Customer`);
    console.log();

    // Check initial balance
    console.log("=== Initial Token Balance ===");
    const customerBalance = await contract.balanceOf(customer.address);
    console.log(`Customer balance: ${ethers.utils.formatUnits(customerBalance, 18)} eCHF`);
    console.log();

    // Register customer
    console.log("=== Registering Customer ===");
    try {
        // Check if customer is already registered
        const alreadyRegistered = await contract.isRegistered(customer.address);
        if (alreadyRegistered) {
            console.log("Customer is already registered, skipping registration");
        } else {
            const regTx = await contract.registerCustomer(customer.address);
            await regTx.wait();
            console.log("Customer registered");
        }
    } catch (error) {
        console.log("Registration error:", error.message);
        console.log("Checking if customer is already registered...");
        const isRegistered = await contract.isRegistered(customer.address);
        console.log(`Customer already registered: ${isRegistered}`);
    }
    console.log();

    // Check registration status
    const isCustomerRegistered = await contract.isRegistered(customer.address);
    console.log(`Customer registered: ${isCustomerRegistered}`);
    console.log();

    // Record initial usage for customer (they start owing money)
    console.log("=== Recording Initial Usage (Trust-Based) ===");
    const kWh1 = 150; // 150 kWh
    const cost1 = ethers.utils.parseUnits("45", 18); // 45 eCHF (0.30 per kWh)

    try {
        const tx = await contract.recordUsageAndCharge(customer.address, kWh1, cost1);
        await tx.wait(); // Wait for transaction confirmation
        console.log(`Recorded ${kWh1} kWh usage for Customer, cost: ${ethers.utils.formatUnits(cost1, 18)} eCHF`);
    } catch (error) {
        console.log("Usage recording error:", error.message);
        console.log("Checking customer registration status...");
        const isRegistered = await contract.isRegistered(customer.address);
        console.log(`Customer registered: ${isRegistered}`);
        if (!isRegistered) {
            console.log("Customer not registered, attempting to register first...");
            const regTx = await contract.registerCustomer(customer.address);
            await regTx.wait();
            console.log("Customer registered, retrying usage recording...");
            const usageTx = await contract.recordUsageAndCharge(customer.address, kWh1, cost1);
            await usageTx.wait();
            console.log(`Recorded ${kWh1} kWh usage for Customer, cost: ${ethers.utils.formatUnits(cost1, 18)} eCHF`);
        } else {
            throw error; // Re-throw if it's not a registration issue
        }
    }
    console.log();

    // Check outstanding balance
    console.log("=== Outstanding Balance After Usage ===");
    const outstanding1 = await contract.getOutstandingBalance(customer.address);
    console.log(`Customer outstanding balance: ${ethers.utils.formatUnits(outstanding1, 18)} eCHF`);
    console.log();

    // Customer makes a partial payment
    console.log("=== Customer Makes Partial Payment ===");
    const payment1 = ethers.utils.parseUnits("20", 18); // 20 eCHF partial payment

    // Approve contract to spend tokens
    const customerContract = contract.connect(customer);
    const approveTx = await customerContract.approve(contract.address, payment1);
    await approveTx.wait();
    console.log(`Customer approved ${ethers.utils.formatUnits(payment1, 18)} eCHF for payment`);

    // Make payment
    const paymentTx = await customerContract.makePayment(payment1);
    await paymentTx.wait();
    console.log(`Customer paid ${ethers.utils.formatUnits(payment1, 18)} eCHF`);

    // Check updated balance
    const outstanding1After = await contract.getOutstandingBalance(customer.address);
    console.log(`Customer outstanding balance after payment: ${ethers.utils.formatUnits(outstanding1After, 18)} eCHF`);
    console.log();

    // Record additional usage for Customer
    console.log("=== Recording Additional Usage for Customer ===");
    const additionalKWh = 100;
    const additionalCost = ethers.utils.parseUnits("30", 18); // 30 eCHF

    const additionalUsageTx = await contract.recordUsageAndCharge(customer.address, additionalKWh, additionalCost);
    await additionalUsageTx.wait();
    console.log(`Recorded additional ${additionalKWh} kWh for Customer, cost: ${ethers.utils.formatUnits(additionalCost, 18)} eCHF`);

    const finalOutstanding = await contract.getOutstandingBalance(customer.address);
    console.log(`Customer total outstanding balance: ${ethers.utils.formatUnits(finalOutstanding, 18)} eCHF`);
    console.log();

    // Customer makes another payment to clear remaining balance
    console.log("=== Customer Makes Final Payment ===");
    const remainingBalance = await contract.getOutstandingBalance(customer.address);

    const finalApproveTx = await customerContract.approve(contract.address, remainingBalance);
    await finalApproveTx.wait();
    console.log(`Customer approved ${ethers.utils.formatUnits(remainingBalance, 18)} eCHF for final payment`);

    const finalPaymentTx = await customerContract.makePayment(remainingBalance);
    await finalPaymentTx.wait();
    console.log(`Customer paid ${ethers.utils.formatUnits(remainingBalance, 18)} eCHF (full remaining balance)`);

    const finalOutstandingAfter = await contract.getOutstandingBalance(customer.address);
    console.log(`Customer outstanding balance after final payment: ${ethers.utils.formatUnits(finalOutstandingAfter, 18)} eCHF`);
    console.log();

    // Check total usage
    console.log("=== Total Usage Summary ===");
    const customerData = await contract.customers(customer.address);
    console.log(`Customer - Total kWh: ${customerData.totalKWh}, Outstanding: ${ethers.utils.formatUnits(customerData.outstandingBalance, 18)} eCHF`);
    console.log();

    // Provider withdraws collected payments
    console.log("=== Provider Withdraws Collected Payments ===");
    const contractBalance = await contract.balanceOf(contract.address);
    console.log(`Contract balance: ${ethers.utils.formatUnits(contractBalance, 18)} eCHF`);

    if (contractBalance > 0) {
        const withdrawTx = await contract.withdrawTokens(contractBalance);
        await withdrawTx.wait();
        console.log(`Provider withdrew ${ethers.utils.formatUnits(contractBalance, 18)} eCHF`);

        const ownerBalance = await contract.balanceOf(owner.address);
        console.log(`Owner balance after withdrawal: ${ethers.utils.formatUnits(ownerBalance, 18)} eCHF`);
    }
    console.log();

    // Final customer token balance
    console.log("=== Final Customer Token Balance ===");
    const finalCustomerBalance = await contract.balanceOf(customer.address);
    console.log(`Customer final balance: ${ethers.utils.formatUnits(finalCustomerBalance, 18)} eCHF`);

    console.log("\n=== Demo Complete ===");
    console.log("The trust-based billing system allows customers to:");
    console.log("1. Use electricity first, build up outstanding balances");
    console.log("2. Make payments at any time to reduce their debt");
    console.log("3. Continue using electricity even with outstanding balances");
    console.log("4. Make partial or full payments as they choose");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
