const DaiToken = artifacts.require("DaiToken");
const PrakToken = artifacts.require("PrakToken");
const DigitalBank = artifacts.require("DigitalBank");

module.exports = async function (deployer, network, accounts) {
  // Deploy Dai Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed()

  // Deploy Prak Token
  await deployer.deploy(PrakToken)
  const prakToken = await PrakToken.deployed()

  // Deploy Token Farm Token
  await deployer.deploy(DigitalBank, daiToken.address, prakToken.address)
  const digitalBank = await DigitalBank.deployed()

  // Transfer all PrakTokens to DigitalBank
  await prakToken.transfer(digitalBank.address, '1000000000000000000000000')

  // Transfer 1000 DaiTokens to investor
  await daiToken.transfer(accounts[1], '1000000000000000000000')

};