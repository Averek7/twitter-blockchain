import { ethers } from "ethers";
import client from "../../lib/client";
import { useRouter } from "next/router";
import InitialState from "./InitialState";
import LoadingState from "./LoadingState";
import FinishState from "./FinishState";
import { useContext, useState } from "react";
import TwitterContext from "../../context/TwitterContext";
import { contractABI, contractAddress } from "../../lib/constants";
import { pinJSONToIPFS, pinFileToIPFS } from "../../lib/pinata";

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(metamask);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

function ProfileImageMinter() {
  const router = useRouter();
  const [status, setStatus] = useState("initial");
  const [profileImage, setProfileImage] = useState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { setAppStatus, currentAccount } = useContext(TwitterContext);

  const mint = async () => {
    if (!name || !description || !profileImage) return setStatus("loading");

    const pinataMetaData = {
      name: `${name} - ${description}`,
    };

    const ipfsImageHash = await pinFileToIPFS(profileImage, pinataMetaData);

    await client
      .patch(currentAccount)
      .set({ profileImage: ipfsImageHash })
      .set({ isProfileImageNft: true })
      .commit();

    const imageMetaData = {
      name: name,
      description: description,
      image: `ipfs://${ipfsImageHash}`,
    };

    const ipfsJsonHash = await pinJSONToIPFS(imageMetaData, pinataMetaData);

    const contract = await getEthereumContract();

    const transactionParameters = {
      to: contractAddress,
      from: currentAccount,
      data: await contract.mint(currentAccount, `ipfs://${ipfsJsonHash}`),
    };

    try {
      await metamask.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      setStatus("finish");
    } catch (error) {
      console.log(error);
      setStatus("finish");
    }
  };

  const modalChildren = (modalStatus = status) => {
    switch (modalStatus) {
      case "initial":
        <InitialState
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          mint={mint}
        />;
        break;
      case "loading":
        <LoadingState />;
        break;
      case "finish":
        <FinishState />;
        break;
      default:
        router.push("/");
        setAppStatus("error");
        break;
    }
  };
  return <div>{modalChildren(status)}</div>;
}

export default ProfileImageMinter;
