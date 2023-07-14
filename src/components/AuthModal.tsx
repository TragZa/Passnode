import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import PassnodeAuth from "../Passnode-Auth.svg";

type FormType = "login" | "register";

type AuthModalProps = {
  onMasterpasswordChange: (newMasterpassword: string) => void;
  onIsSubmittedChange: (newIsSubmitted: boolean) => void;
};

const AuthModal = ({
  onMasterpasswordChange,
  onIsSubmittedChange,
}: AuthModalProps) => {
  const [masterpassword, setMasterpassword] = useState("");
  const [formType, setFormType] = useState<FormType>("login");
  const [apitoken, setApitoken] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    onMasterpasswordChange(masterpassword);
  }, [masterpassword]);

  useEffect(() => {
    onIsSubmittedChange(isSubmitted);
  }, [isSubmitted]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formType === "login") {
      if (masterpassword && Cookies.get("apitoken")) {
        setIsSubmitted(true);
      }
    } else {
      if (apitoken) {
        if (!Cookies.get("apitoken")) {
          Cookies.set("apitoken", apitoken, { expires: 365 });
        }
        setIsRegistered(true);
      }
    }
  };

  if (isSubmitted) return null;

  return (
    <div className="bg-black flex flex-row w-screen h-screen justify-center items-center bg-opacity-50 backdrop-blur">
      <div>
        <PassnodeAuth />
      </div>
      <div className="bg-gray2 w-[500px] h-[500px] flex flex-col items-center">
        <div className="mt-[150px]">
          <button
            className={`w-[150px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              formType === "login" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => setFormType("login")}
          >
            Login
          </button>
          <button
            className={`w-[150px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              formType === "register" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => setFormType("register")}
          >
            Register
          </button>
        </div>
        <div className="bg-blue3 w-[300px] h-[2px]"></div>
        <form className="mt-10" onSubmit={handleFormSubmit}>
          {formType === "login" && (
            <label className="flex flex-col">
              Master Password
              <input
                className="mt-2 bg-gray w-[200px]"
                type="text"
                value={masterpassword}
                onChange={(e) => setMasterpassword(e.target.value)}
              />
            </label>
          )}
          {formType === "register" && (
            <>
              <label className="flex flex-col">
                API Token
                <input
                  className="mt-2 bg-gray w-[200px]"
                  type="text"
                  value={apitoken}
                  onChange={(e) => setApitoken(e.target.value)}
                />
              </label>
            </>
          )}
        </form>
        <form onSubmit={handleFormSubmit}>
          <button
            className={`mt-5 w-[100px] h-[30px] bg-blue2 ${
              formType === "login" ||
              (!isRegistered && !Cookies.get("apitoken"))
                ? "hover:bg-blue3 hover:text-black active:bg-blue4"
                : "bg-gray cursor-not-allowed"
            }`}
            type="submit"
          >
            {formType === "login"
              ? "Login"
              : isRegistered || Cookies.get("apitoken")
              ? "Registered"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
