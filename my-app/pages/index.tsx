import type { NextPage } from "next";
import Head from "next/head";
import { useState, useRef } from "react";
import RenderButton from "../components/RenderButton";
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

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className=".main min-h-[50%] flex justify-center items-center">
        <div>
          <h1 className="text-4xl my-8">Welcome to Crypto Devs!</h1>
          <div className="leading-none text-xl my-8">
            It's an NFT collection for developers in Crypto.
          </div>
          <div className="leading-none text-xl my-8">
            have already joined the Whitelist
          </div>
          <RenderButton />
        </div>
        <div>
          <img
            className="w-[70%] h-[50%] ml-[20%]"
            src="./crypto-devs.svg"
            alt="/"
          />
        </div>
      </div>
      <footer className="">Made with &#10084; by Tenko</footer>
    </div>
  );
};

export default Home;
