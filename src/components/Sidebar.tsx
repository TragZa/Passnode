import { useState, useEffect } from "react";
import PassnodeSidebar from "../Passnode-Sidebar.svg";
import WebsiteIcon from "./icons/WebsiteIcon";
import CardIcon from "./icons/CardIcon";
import NoteIcon from "./icons/NoteIcon";
import GenerateIcon from "./icons/GenerateIcon";
import Websites from "./Websites";
import Cards from "./Cards";
import Notes from "./Notes";
import PasswordGenerator from "./PasswordGenerator";
import ArrowIcon from "./icons/ArrowIcon";
import ArrowRIcon from "./icons/ArrowRIcon";

const Sidebar = ({
  masterpassword,
  isSubmitted,
}: {
  masterpassword: string;
  isSubmitted: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<
    "websites" | "cards" | "notes" | "generate"
  >("websites");
  const [openSidebar, setOpenSidebar] = useState(true);
  const [key, setKey] = useState(0);
  const [cardsKey, setCardsKey] = useState(0);
  const [notesKey, setNotesKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setOpenSidebar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      setKey((prevKey) => prevKey + 1);
    }
  }, [isSubmitted]);

  return (
    <div>
      {activeTab === "websites" && (
        <Websites key={key} masterpassword={masterpassword} />
      )}
      {activeTab === "cards" && (
        <Cards key={cardsKey} masterpassword={masterpassword} />
      )}
      {activeTab === "notes" && (
        <Notes key={notesKey} masterpassword={masterpassword} />
      )}
      {activeTab === "generate" && <PasswordGenerator />}
      {openSidebar && (
        <div className="bg-gray2 h-screen w-max flex flex-col items-start relative">
          <div>
            <PassnodeSidebar />
          </div>
          <button
            className={`mt-10 ml-10 flex w-[220px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              activeTab === "websites" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => setActiveTab("websites")}
          >
            <WebsiteIcon />
            Websites
          </button>
          <button
            className={`mt-5 ml-10 flex w-[220px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              activeTab === "cards" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => {
              setActiveTab("cards");
              setTimeout(() => {
                setCardsKey((prevCardsKey) => prevCardsKey + 1);
              }, 2000);
            }}
          >
            <CardIcon />
            Cards
          </button>
          <button
            className={`mt-5 ml-10 flex w-[220px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              activeTab === "notes" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => {
              setActiveTab("notes");
              setTimeout(() => {
                setNotesKey((prevNotesKey) => prevNotesKey + 1);
              }, 2000);
            }}
          >
            <NoteIcon />
            Notes
          </button>
          <button
            className={`mt-5 ml-10 flex w-[220px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4 ${
              activeTab === "generate" ? "bg-blue3 text-black" : ""
            }`}
            onClick={() => setActiveTab("generate")}
          >
            <GenerateIcon />
            Password Generator
          </button>
        </div>
      )}
      <button
        className="mb-5 ml-10 bottom-0 fixed flex w-[220px] h-[30px] hover:bg-blue3 hover:text-black active:bg-blue4"
        onClick={() => setOpenSidebar(!openSidebar)}
      >
        {openSidebar ? <ArrowIcon /> : <ArrowRIcon />}
        {openSidebar ? "Close Sidebar" : "Open Sidebar"}
      </button>
    </div>
  );
};

export default Sidebar;
