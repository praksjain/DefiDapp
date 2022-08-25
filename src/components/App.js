import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import PrakToken from '../abis/PrakToken.json'
import DigitalBank from '../abis/DigitalBank.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load PrakToken
    const prakTokenData = PrakToken.networks[networkId]
    if (prakTokenData) {
      const prakToken = new web3.eth.Contract(PrakToken.abi, prakTokenData.address)
      this.setState({ prakToken })
      let prakTokenBalance = await prakToken.methods.balanceOf(this.state.account).call()
      this.setState({ prakTokenBalance: prakTokenBalance.toString() })
    } else {
      window.alert('PrakToken contract not deployed to detected network.')
    }

    // Load Digital Bank
    const digitalBankData = DigitalBank.networks[networkId]
    if (digitalBankData) {
      const digitalBank = new web3.eth.Contract(DigitalBank.abi, digitalBankData.address)
      this.setState({ digitalBank })
      let stakeBalance = await digitalBank.methods.stakeBalance(this.state.account).call()
      this.setState({ stakeBalance: stakeBalance.toString() })
    } else {
      window.alert('DigitalBank contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.digitalBank.address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.digitalBank.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.digitalBank.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      prakToken: {},
      digitalBank: {},
      daiTokenBalance: '0',
      prakTokenBalance: '0',
      stakeBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        prakTokenBalance={this.state.prakTokenBalance}
        stakeBalance={this.state.stakeBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;