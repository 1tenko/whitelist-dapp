import type { NextPage } from "next";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

const Home: NextPage = () => {
  // to keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // keeps track of whether the current metamask address has joined the whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  // set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  // tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  // create a reference to the We3 Modal (used for connecting to metamask)
  // which persists as long as the page is open
  const web3ModalRef = useRef();

  /*
  * Returns a Provider or Signer object representing the Ethereum RPC
  with or without the signing capabilities of metamask attached

  * A 'Provider' is needed to interact with the blockchain
  --> reading transactions, reading balances, reading state, etc.

  * A 'Signer' is a special type of Provider used in  case a 'write' transaction
  needs to be made to the blockchain, which involves the connected account needing to make a digital signature to authorize the transaction being sent.
  Metamask exposes a Signer API to allow your website to request signatures from the user using Signer functions.

  *@param{*}needSigner - True if you need the signer, default false otherwise
  */
  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask
    // since we store 'web3Modal' as a reference, we need to access the 'current'
    // value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // if user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change the network to Rinkeby");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // adds the current connected address to the whitelist
  const addAddressToWhitelist = async () => {
    try {
      // we need a Signer here since this is a 'write' function
      const signer = await getProviderOrSigner(true);

      // create a new instance of the Contract with a Signer,
      // which allows update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // wait for tx to get mined
      await tx.wait();
      setLoading(false);
      // get updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  // gets the number of whitelisted addresses
  const getNumberOfWhitelisted = async () => {
    try {
      // get the provider from web3Modal, which in our case is metamask
      // no need for Signer here, as we are only reading state from blockchain
      const provider = await getProviderOrSigner();

      // we connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // checks if the address is in whitelist
  const checkIfAddressInWhitelist = async () => {
    try {
      // we will need signer later to get the user's address
      // even though it's a read transaction, since Signers are just
      // special kind of Providers, we can use it in it's place
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // get the address associated to the signer which is connected to metamask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  // connects metamask wallet
  const connectWallet = async () => {
    try {
      // get the provider from the web3Modal, which in our case is metamask
      // when used for first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  // returns a button based on the state of the dapp
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className="leading-none text-xl my-8">
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return (
          <button className="border-0 bg-[#0000FF] text-white rounded text-[15px] p-[20px] w-[200px] mb-[2%] cursor-pointer">
            Loading...
          </button>
        );
      } else {
        return (
          <button
            onClick={addAddressToWhitelist}
            className="border-0 bg-[#0000FF] text-white rounded text-[15px] p-[20px] w-[200px] mb-[2%] cursor-pointer"
          >
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button
          onClick={connectWallet}
          className="border-0 bg-[#0000FF] text-white rounded text-[15px] p-[20px] w-[200px] mb-[2%] cursor-pointer"
        >
          Connect your wallet
        </button>
      );
    }
  };

  // whenever 'walletConnected' changes, this effect will be called
  useEffect(() => {
    // if wallet not connected, create new instance of Web3Modal and connect the metamask wallet
    if (!walletConnected) {
      // assign W3b3Modal class to the reference object by setting it's 'current' value
      // 'current' value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className=".main min-h-[50%] flex justify-center items-center flex-row">
        <div>
          <h1 className="text-4xl my-8">Welcome to Crypto Devs!</h1>
          <div className="leading-none text-xl my-8">
            It's an NFT collection for developers in Crypto.
          </div>
          <div className="leading-none text-xl my-8">
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img
            className="w-[70%] h-[50%] ml-[20%]"
            src="./crypto-devs.svg"
            alt="/"
          />
        </div>
      </div>
      <footer className="flex py-8  justify-center items-center">
        Made with &#10084; by Tenko
      </footer>
    </div>
  );
};

export default Home;
