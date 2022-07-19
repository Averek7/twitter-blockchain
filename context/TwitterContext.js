import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import client from "../lib/client";

const TwitterContext = createContext();

export const TwitterProvider = ({ children }) => {
  const [appStatus, setAppStatus] = useState();
  const [currentAccount, setCurrentAccount] = useState("loading...");
  //   const [currentAccountId, setCurrentAccountId] = useState("");
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
    *[_type == 'tweets']{
      *author*: author->{name, walletAddress, profileImage, isProfileImageNft},
      tweet,
      timestamp
    }|order(timestamp desc)`;

    const sanityResponse = await client.fetch(query);
    sanityResponse.forEach(async (item) => {
      const newItem = {
        tweet: item.tweet,
        timestamp: item.timestamp,
        author: {
          name: item.author.name,
          walletAddress: item.author.walletAddress,
          isProfileImageNft: item.author.isProfileImageNft,
          profileImage: item.author.profileImage,
        },
      };
    });
    setTweets((prevState) => [...prevState, newItem]);
  };

  const getCurrentUserDetails = async (userAccount = currentAccount) => {
    if (appStatus !== "Connected") return;
    const query = `
      *[_type == "users" && _id == ${userAccount}]{
        *tweets*: tweets[]->{timestamp, tweet}|order(timestamp desc),
        name,
        profileImage,
        isProfileImageNft,
        coverImage,
        walletAddress 
      }
    `;
    const sanityResponse = await client.fetch(query);
    setCurrentUser({
      tweets: sanityResponse[0].tweets,
      name: sanityResponse[0].name,
      profileImage: sanityResponse[0].profileImage,
      isProfileImageNft: sanityResponse[0].isProfileImageNft,
      coverImage: sanityResponse[0].coverImage,
      walletAddress: sanityResponse[0].walletAddress,
    });
  };
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
