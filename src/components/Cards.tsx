import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { Web3Storage } from "web3.storage";

type Credential = {
  bankname: string;
  cardtype: string;
  cardnumber: string;
  cardholdername: string;
  cvv: string;
  expirydate: string;
};

const Cards = ({ masterpassword }: { masterpassword: string }) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState<Credential>({
    bankname: "",
    cardtype: "",
    cardnumber: "",
    cardholdername: "",
    cvv: "",
    expirydate: "",
  });
  const [selectedCredential, setSelectedCredential] =
    useState<Credential | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const salt = Cookies.get("apitoken")?.slice(0, 16);

  const secretKey = CryptoJS.PBKDF2(masterpassword, `${salt}`, {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const encryptCredential = (credential: Credential) => {
    return {
      bankname: CryptoJS.AES.encrypt(
        credential.bankname,
        secretKey.toString()
      ).toString(),
      cardtype: CryptoJS.AES.encrypt(
        credential.cardtype,
        secretKey.toString()
      ).toString(),
      cardnumber: CryptoJS.AES.encrypt(
        credential.cardnumber,
        secretKey.toString()
      ).toString(),
      cardholdername: CryptoJS.AES.encrypt(
        credential.cardholdername,
        secretKey.toString()
      ).toString(),
      cvv: CryptoJS.AES.encrypt(
        credential.cvv,
        secretKey.toString()
      ).toString(),
      expirydate: CryptoJS.AES.encrypt(
        credential.expirydate,
        secretKey.toString()
      ).toString(),
    };
  };

  const decryptCredential = (credential: Credential) => {
    return {
      bankname: CryptoJS.AES.decrypt(
        credential.bankname,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
      cardtype: CryptoJS.AES.decrypt(
        credential.cardtype,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
      cardnumber: CryptoJS.AES.decrypt(
        credential.cardnumber,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
      cardholdername: CryptoJS.AES.decrypt(
        credential.cardholdername,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
      cvv: CryptoJS.AES.decrypt(credential.cvv, secretKey.toString()).toString(
        CryptoJS.enc.Utf8
      ),
      expirydate: CryptoJS.AES.decrypt(
        credential.expirydate,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
    };
  };

  const handleAddCredential = () => {
    if (
      credentials.some(
        (credential) =>
          decryptCredential(credential).bankname === newCredential.bankname
      )
    ) {
      alert("Bankname already exists");
    } else {
      const encryptedCredential = encryptCredential(newCredential);
      const updatedCredentials = [...credentials, encryptedCredential];
      setCredentials(updatedCredentials);
      setNewCredential({
        bankname: "",
        cardtype: "",
        cardnumber: "",
        cardholdername: "",
        cvv: "",
        expirydate: "",
      });
    }
  };

  const handleDeleteCredential = (credentialToDelete: Credential) => {
    setCredentials((prevCredentials) =>
      prevCredentials.filter(
        (credential) =>
          decryptCredential(credential).bankname !==
          decryptCredential(credentialToDelete).bankname
      )
    );
  };

  const handleShowHideNote = (credential: Credential) => {
    if (selectedCredential === credential) {
      setShowNote(!showNote);
    } else {
      setSelectedCredential(credential);
      setShowNote(true);
    }
  };

  const handleStoreCredentials = async () => {
    const token = Cookies.get("apitoken");
    if (!token) return;
    const client = new Web3Storage({ token });
    const data = JSON.stringify(credentials);
    const file = new File([data], "Cards", {
      type: "application/json",
    });
    try {
      await client.put([file], { name: "Cards" });
    } catch (error) {
      console.error(error);
      alert("An error occurred while storing data.");
    }
  };

  const handleRetrieveCredentials = async () => {
    setIsLoading(true);
    const token = Cookies.get("apitoken");
    if (!token) return;
    const client = new Web3Storage({ token });
    try {
      let cid;
      for await (const upload of client.list()) {
        if (upload.name === "Cards") {
          cid = upload.cid;
          break;
        }
      }
      if (!cid) return;
      const data = await client.get(cid);
      if (!data) return;
      const file = await data.files();
      if (!file || !file[0]) return;
      const text = await file[0].text();
      const retrievedCredentials = JSON.parse(text);
      setCredentials(retrievedCredentials);
    } catch (error) {
      console.error(error);
      alert("An error occurred while retrieving data.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleRetrieveCredentials();
  }, []);

  useEffect(() => {
    handleStoreCredentials();
  }, [credentials]);

  return (
    <div className="absolute">
      {showForm && (
        <div className="bg-gray2 w-screen flex flex-col items-center">
          <label className="mt-5 flex flex-col">
            Bank Name
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.bankname}
              onChange={(e) =>
                setNewCredential({ ...newCredential, bankname: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            Card Type
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.cardtype}
              onChange={(e) =>
                setNewCredential({
                  ...newCredential,
                  cardtype: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            Card Number
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.cardnumber}
              onChange={(e) =>
                setNewCredential({
                  ...newCredential,
                  cardnumber: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            Cardholder Name
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.cardholdername}
              onChange={(e) =>
                setNewCredential({
                  ...newCredential,
                  cardholdername: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            CVV
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.cvv}
              onChange={(e) =>
                setNewCredential({
                  ...newCredential,
                  cvv: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            Expiry Date
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.expirydate}
              onChange={(e) =>
                setNewCredential({
                  ...newCredential,
                  expirydate: e.target.value,
                })
              }
            />
          </label>
          <button
            className="mt-5 w-[100px] h-[30px] bg-blue2 hover:bg-blue3 hover:text-black active:bg-blue4"
            onClick={handleAddCredential}
          >
            Add
          </button>
        </div>
      )}
      <div className="bg-gray2 w-screen flex flex-col items-center">
        <button
          className="mt-5 mb-5 w-[100px] h-[30px] bg-blue2 hover:bg-blue3 hover:text-black active:bg-blue4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide" : "Show"}
        </button>
      </div>
      <div className="bg-gray w-screen flex flex-col items-center">
        {credentials.map((credential) => (
          <div
            className="bg-gray2 mt-5 w-[300px] flex flex-col items-center break-all"
            key={decryptCredential(credential).bankname}
          >
            <div className="mt-5">Bank Name</div>
            <div className="mt-2">{decryptCredential(credential).bankname}</div>
            <button
              className="w-[100px] h-[30px] bg-blue2 hover:bg-blue3 hover:text-black mt-5 active:bg-blue4"
              onClick={() => handleShowHideNote(credential)}
            >
              {selectedCredential === credential && showNote ? "Hide" : "Show"}
            </button>
            <button
              className="w-[100px] h-[30px] bg-red hover:bg-red2 hover:text-black mt-5 mb-5 active:bg-red3"
              onClick={() => handleDeleteCredential(credential)}
            >
              Delete
            </button>
            <div>
              {selectedCredential === credential && showNote && (
                <div className="flex flex-col items-center mb-5">
                  <div>Card Type</div>
                  <div className="mt-2">
                    {decryptCredential(credential).cardtype}
                  </div>
                  <div>Card Number</div>
                  <div className="mt-2">
                    {decryptCredential(credential).cardnumber}
                  </div>
                  <div>Cardholder Name</div>
                  <div className="mt-2">
                    {decryptCredential(credential).cardholdername}
                  </div>
                  <div>CVV</div>
                  <div className="mt-2">
                    {decryptCredential(credential).cvv}
                  </div>
                  <div>Expiry Date</div>
                  <div className="mt-2">
                    {decryptCredential(credential).expirydate}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray w-screen flex flex-col items-center">
        {isLoading && (
          <div className="bg-gray2 mt-5 w-[300px] h-[100px] flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="animate-spin w-6 h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default Cards;
