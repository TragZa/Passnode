import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { Web3Storage } from "web3.storage";

type Credential = {
  notename: string;
  note: string;
};

const Notes = ({ masterpassword }: { masterpassword: string }) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState<Credential>({
    notename: "",
    note: "",
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
      notename: CryptoJS.AES.encrypt(
        credential.notename,
        secretKey.toString()
      ).toString(),
      note: CryptoJS.AES.encrypt(
        credential.note,
        secretKey.toString()
      ).toString(),
    };
  };

  const decryptCredential = (credential: Credential) => {
    return {
      notename: CryptoJS.AES.decrypt(
        credential.notename,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
      note: CryptoJS.AES.decrypt(
        credential.note,
        secretKey.toString()
      ).toString(CryptoJS.enc.Utf8),
    };
  };

  const handleAddCredential = () => {
    if (
      credentials.some(
        (credential) =>
          decryptCredential(credential).notename === newCredential.notename
      )
    ) {
      alert("Notename already exists");
    } else {
      const encryptedCredential = encryptCredential(newCredential);
      setCredentials([...credentials, encryptedCredential]);
      setNewCredential({ notename: "", note: "" });
    }
  };

  const handleDeleteCredential = (credentialToDelete: Credential) => {
    setCredentials((prevCredentials) =>
      prevCredentials.filter(
        (credential) =>
          decryptCredential(credential).note !==
          decryptCredential(credentialToDelete).note
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
    const file = new File([data], "Notes", {
      type: "application/json",
    });
    try {
      await client.put([file], { name: "Notes" });
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
        if (upload.name === "Notes") {
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
            Note Name
            <input
              className="bg-gray mt-2 w-[300px]"
              value={newCredential.notename}
              onChange={(e) =>
                setNewCredential({ ...newCredential, notename: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col mt-2">
            Note
            <textarea
              className="bg-gray mt-2 w-[500px] h-[100px]"
              value={newCredential.note}
              onChange={(e) =>
                setNewCredential({ ...newCredential, note: e.target.value })
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
          className="mt-5 mb-5 w-[100px] h-[30px] bg-blue2 hover:bg-blue3 hover:text-blac active:bg-blue4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide" : "Show"}
        </button>
      </div>
      <div className="bg-gray w-screen flex flex-col items-center">
        {credentials.map((credential) => (
          <div
            className="bg-gray2 mt-5 w-[300px]  flex flex-col items-center break-all"
            key={decryptCredential(credential).notename}
          >
            <div className="mt-5">Note Name</div>
            <div className="mt-2">{decryptCredential(credential).notename}</div>
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
                  <div>Note</div>
                  <div className="mt-2">
                    {decryptCredential(selectedCredential).note}
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

export default Notes;
