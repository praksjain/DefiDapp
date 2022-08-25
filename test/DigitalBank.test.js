const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const PrakToken = artifacts.require('PrakToken')
const DigitalBank = artifacts.require('DigitalBank')

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('DigitalBank', ([owner, investor]) => {
    let daiToken, prakToken, digitalBank;
    before(async () => {

        // Load all contracts
        daiToken = await DaiToken.new()
        prakToken = await PrakToken.new()
        digitalBank = await DigitalBank.new(daiToken.address, prakToken.address)

        // Transfer all PrakTokens to Digital Bank
        await prakToken.transfer(digitalBank.address, tokens('1000000'))

        // Transfer some DaiTokens to Investor
        await daiToken.transfer(investor, tokens('1000'), { from: owner })
    })

    // Check deployment
    describe('Dai Token Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Dai Token')
        })
    })

    describe('Prak Token Deployment', async () => {
        it('has a name', async () => {
            const name = await prakToken.name();
            assert.equal(name, 'Prak Token')
        })
    })

    describe('Digital Bank Deployment', async () => {
        it('has a name', async () => {
            const name = await digitalBank.name();
            assert.equal(name, 'Digital Bank')
        })

        it('contract has tokens', async () => {
            let balance = await prakToken.balanceOf(digitalBank.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Digital Bank', async () => {
        it('interest accurred on depositing dai token', async () => {
            let result;

            // Check investor's balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('1000'), 'Balance is incorrect')

            // Stack dai tokens
            await daiToken.approve(digitalBank.address, tokens('1000'), { from: investor })
            await digitalBank.stakeTokens(tokens('100'), { from: investor })

            // Check result after staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('900'))

            result = await daiToken.balanceOf(digitalBank.address)
            assert.equal(result.toString(), tokens('100'))

            result = await digitalBank.currentStakingStatus(investor)
            assert.equal(result.toString(), 'true')

            result = await digitalBank.hasStaked(investor)
            assert.equal(result.toString(), 'true')

            // Issue Tokens
            await digitalBank.issueTokens({ from: owner })

            // Check balances
            result = await prakToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'))

            // Ensure only owner can issue the tokens
            await digitalBank.issueTokens({ from: investor }).should.be.rejected;

            // Unstake Tokens
            await digitalBank.unstakeTokens({ from: investor })

            // Check balances
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('1000'))

            result = await daiToken.balanceOf(digitalBank.address)
            assert.equal(result.toString(), tokens('0'))

            result = await digitalBank.stakeBalance(investor)
            assert.equal(result.toString(), tokens('0'))
            result = await digitalBank.currentStakingStatus(investor)
            assert.equal(result.toString(), 'false')
        })
    })



})
