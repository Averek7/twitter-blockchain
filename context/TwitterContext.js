import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import client from "../lib/client";

const TwitterContext = createContext();

export const TwitterProvider = ({ children }) => {
  const [appStatus, setAppStatus] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweets, setTweets] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const router = useRouter();

  useEffect(() => {
    checkIfWallectIsConnected();
  }, []);

  useEffect(() => {
    if (!currentAccount || appStatus !== "Connected") return;
  }, [currentAccount, appStatus]);

  const checkIfWallectIsConnected = async () => {
    if (!window.ethereum) return;
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        setAppStatus("Connected");
        setCurrentAccount(addressArray[0]);
        createUserAccount(addressArray[0]);
      } else {
        router.push("/");

        setAppStatus("Not Connected");
      }
    } catch (error) {
      console.error(error);
      setAppStatus("error");
    }
  };

  const connectToWallet = async () => {
    if (!window.ethereum) return setAppStatus("No MetaMask");
    try {
      setAppStatus("loading");
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (addressArray.length > 0) {
        setAppStatus("Connected");
        setCurrentAccount(addressArray[0]);
        createUserAccount(addressArray[0]);
      } else {
        router.push("/");
        setAppStatus("Not Connected");
      }
    } catch (error) {
      console.error(error);
      setAppStatus("error");
    }
  };

  /**
   * Creates an account in Sanity DB if the user does not already have one
   * @param {String} userAddress Wallet address of the currently logged in user
   */

  const createUserAccount = async (userAddress = currentAccount) => {
    if (!window.ethereum) return setAppStatus("No MetaMask");
    try {
      const userDoc = {
        _type: "users",
        _id: userAddress,
        name: "Unnamed",
        isProfileImageNft: false,
        profileImage:
          "https://about.twitter.com/content/dam/about-twitter/en/brand-toolkit/brand-download-img-1.jpg.twimg.1920.jpg",
        walletAddress: userAddress,
      };

      await client.createIfNotExists(userDoc);

      setAppStatus("Connected");
    } catch (error) {
      router.push("/");
      console.error(error);
      setAppStatus("error");
    }
  };

  const fetchTweet = async () => {
    const query = `
      *[_type == "tweets"]{
        "author": author->{name, walletAddress, profileImage, isProfileImageNft},
        tweet,
        timestamp
      }|order(timestamp desc)
    `;

    const response = await client.fetch(query);

    setTweets([]);

    response.forEach((item) => {
      const newItem = {
        tweet: item.tweet,
        timestamp: item.timestamp,
        author: {
          name: item.author.name,
          walletAddress: item.author.walletAddress,
          profileImage: item.author.profileImage,
          isProfileImageNft: item.author.isProfileImageNft,
        },
      };
      setTweets((prevState) => [...prevState, newItem]);
    });
  };

  const getCurrentUserDetails = async (userAccount = currentAccount) => {
    if (appStatus !== "Connected") return;
    const query = `
      *[_type == "users" && _id == "${userAccount}"]{
        "tweets": tweets[]->{timestamp, tweet}|order(timestamp desc),
        name,
        profileImage,
        isProfileImageNft,
        coverImage,
        walletAddress
      }
    `;
    const response = await client.fetch(query);

    setCurrentUser({
      tweets: response[0].tweets,
      name: response[0].name,
      profileImage: response[0].profileImage,
      walletAddress: response[0].walletAddress,
      coverImage: response[0].coverImage,
      isProfileImageNft: response[0].isProfileImageNft,
    });
  };

  fetchTweet();
  getCurrentUserDetails(currentAccount);

  return (
    <TwitterContext.Provider
      value={{
        appStatus,
        currentAccount,
        connectToWallet,
        fetchTweet,
        tweets,
        currentUser,
        getCurrentUserDetails,
      }}
    >
      {children}
    </TwitterContext.Provider>
  );
};

export default TwitterContext;
