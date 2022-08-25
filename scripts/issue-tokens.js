const DigitalBank = artifacts.require("DigitalBank");

module.exports = async function (callback) {
    let digitalBank = await DigitalBank.deployed()
    await digitalBank.issueTokens()
    console.log("Tokens issued..!!")
    callback()

};