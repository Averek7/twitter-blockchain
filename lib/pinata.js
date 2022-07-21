import axios from "axios";
const key = "b08d03fc142e06eb1d7a";
const secret =
  "ef9e47c9b5d1d648e62e0e5a2ccb7de3f53d9c14ea31a7e63a6834017eed95b1";

export const pinJSONToIPFS = async (json) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
    .post(url, json, {
      heeaders: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      return response.data.IpfsHash;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const pinFileToIPFS = async (file, pinataMetaData) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", file);
  data.append("pinataMetaData", JSON.stringify(pinataMetaData));

  return axios
    .post(url, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then((response) => {
      response.data.IpfsHash;
    })
    .catch((error) => console.log(error));
};
