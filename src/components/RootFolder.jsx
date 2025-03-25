import { useContext, useState } from "react";
import { States } from "../App";
import { ChevronRight, FilePlus, FolderPlus } from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddFolder from "./AddFolder";
import AddFile from "./AddFile";

export default function RootFolder() {
  const { rootFolder, Auth } = useContext(States);
  const [arrowState, setArrowState] = useState("right");
  const [FolderDialogOpen, setFolderDialogOpen] = useState(false);
  const [FileDialogOpen, setFileDialogOpen] = useState(false);
  console.log(rootFolder);
  const handleArrowState = () => {
    setArrowState((prevState) => (prevState === "right" ? "down" : "right"));
  };
  return (
    <div className="flex w-full h-full flex-col">
      <div className="w-[15%] border-r h-full p-6 flex flex-col gap-2">
        <AlertDialog open={FolderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FolderPlus className="h-5 w-5" />
              <p>New Folder</p>
            </button>
          </AlertDialogTrigger>
          <AddFolder onClose={() => setFolderDialogOpen(false)} />
        </AlertDialog>
        <AlertDialog open={FileDialogOpen} onOpenChange={setFileDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FolderPlus className="h-5 w-5" />
              <p>New File</p>
            </button>
          </AlertDialogTrigger>
          <AddFile onClose={() => setFileDialogOpen(false)} />
        </AlertDialog>
        <div
          className="flex text-sm gap-3 mt-4 items-center bg-secondary p-2 border-l-5 border-l-[#52b2f9] cursor-pointer transition-all duration-100"
          onClick={handleArrowState}
        >
          <div
            className={`transform transition-transform duration-300 ${
              arrowState === "down" ? "rotate-90" : ""
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </div>
          <p className="hover:text-[#52b2f9] ">{rootFolder.rootFolder.name}</p>
        </div>
        <div>
          {arrowState === "down" && rootFolder.childFolders
            ? rootFolder.childFolders.map((content) => (
                <Folder content={content} />
              ))
            : null}
        </div>
        <div>
          {arrowState === "down" && rootFolder.files
            ? rootFolder.files.map((content) => <File content={content} />)
            : null}
        </div>
      </div>
      <div></div>
    </div>
  );
}
