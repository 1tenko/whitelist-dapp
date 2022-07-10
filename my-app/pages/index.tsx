import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useRef } from "react";
import RenderButton from "../components/RenderButton";

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
