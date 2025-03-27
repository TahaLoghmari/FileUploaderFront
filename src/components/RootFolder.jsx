import React, { useContext, useState, useEffect, useCallback } from "react";
import { States } from "../App";
import { Button } from "@/components/ui/button";
import ShareFile from "./ShareFile";

import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  Share2,
  Trash2,
  File,
  Folder,
  X,
} from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddFolder from "./AddFolder";
import AddFile from "./AddFile";
import { API_BASE_URL } from "../lib/api";
import ShareFolder from "./ShareFolder";
import DeleteFolder from "./DeleteFolder";
import DeleteFile from "./DeleteFile";

export default function RootFolder() {
  const { rootFolder, Auth } = useContext(States);
  const [FolderDialogOpen, setFolderDialogOpen] = useState(false);
  const [FileDialogOpen, setFileDialogOpen] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [activeFolder, setActiveFolder] = useState(rootFolder.id);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "--";
    const kb = bytes / 1024;
    if (kb < 1) {
      return "< 1 KB";
    } else if (kb < 1000) {
      return `${Math.round(kb * 10) / 10} KB`;
    } else {
      const mb = kb / 1024;
      return `${Math.round(mb * 10) / 10} MB`;
    }
  };
  const [folderHiearchy, setFolderHiearchy] = useState({
    byFolderId: {
      [rootFolder.id]: {
        name: rootFolder.name,
        parentId: null,
        childIds: [],
        fileChildIds: [],
        isExpanded: false,
        childrenLoaded: false,
        Path: `${rootFolder.name}`,
        createdTime: formatDate(rootFolder.createdAt),
      },
    },
    byFileId: {},
  });
  const handleArrowState = (folderId) => {
    setFolderHiearchy((prevState) => {
      const newState = { ...prevState };
      newState.byFolderId = {
        ...newState.byFolderId,
        [folderId]: {
          ...newState.byFolderId[folderId],
          isExpanded: !newState.byFolderId[folderId].isExpanded,
        },
      };
      return newState;
    });
  };
  const handleOpenedState = (fileId) => {
    setFolderHiearchy((prevState) => {
      const newState = { ...prevState };
      newState.byFileId = {
        ...newState.byFileId,
        [fileId]: {
          ...newState.byFileId[fileId],
          Opened: !newState.byFileId[fileId].Opened,
        },
      };
      return newState;
    });
  };
  const handleFileDetails = (fileId) => {
    const file = folderHiearchy.byFileId[fileId];
    if (loading) {
      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
            <p className="text-lg font-medium">Downloading File...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-black/70 z-50 cursor-auto text-sm text-primary">
        <div
          className={`
            fixed h-full w-[20%] bg-secondary right-0 p-6 flex flex-col 
            justify-between transform transition-all duration-300 ease-out
            ${file.Opened ? "translate-x-0" : "translate-x-full"}
          `}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              File Information
            </h3>
            <div className="mt-6 flex flex-col gap-2">
              <p>
                <span className="font-bold">Name :</span> {file.name}
              </p>
              <p>
                <span className="font-bold">Size :</span> {file.size}
              </p>
              <p>
                <span className="font-bold">Created :</span> {file.createdTime}
              </p>
            </div>
            <X
              className="absolute top-6 right-10 h-4 w-4 hover:text-[#52b2f9] cursor-pointer"
              onClick={() => handleOpenedState(fileId)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleOpenedState(fileId)}
            >
              Close
            </Button>
            <AlertDialog
              open={FolderDialogOpen}
              onOpenChange={setFolderDialogOpen}
            >
              <AlertDialogTrigger asChild className="text-xs">
                <Button variant="outline" className="cursor-pointer">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <DeleteFile
                onClose={() => setFileDialogOpen(false)}
                fileId={fileId}
                setFolderHiearchy={setFolderHiearchy}
                userId={Auth.userId}
              />
            </AlertDialog>
            <ShareFile
              fileId={fileId}
              userId={Auth.userId}
              onClose={() => {
                /* close dialog handler */
              }}
            />
            <Button
              className="cursor-pointer"
              onClick={(e) => {
                setLoading(true);
                e.stopPropagation();
                fetch(
                  `${API_BASE_URL}/user/${Auth.userId}/Folders/Files/download/${fileId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                  .then((response) => {
                    setLoading(false);
                    return response.blob();
                  })
                  .then((blob) => {
                    setLoading(false);
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                  });
              }}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  };
  const LoadChildren = useCallback(
    (folderId) => {
      if (!folderId || !Auth?.userId) return;
      if (folderHiearchy.byFolderId[folderId]?.childrenLoaded) return;
      setLoadingFolders(true);
      fetch(`${API_BASE_URL}/user/${Auth.userId}/Folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Error occurred while getting subfolders");
          return res.json();
        })
        .then((data) => {
          setLoadingFolders(false);
          setFolderHiearchy((prevState) => {
            const newState = { ...prevState };
            newState.byFolderId[folderId].childIds = data.childFolders.map(
              (child) => child.id
            );
            newState.byFolderId[folderId].fileChildIds = data.files.map(
              (child) => child.id
            );
            newState.byFolderId[folderId].childrenLoaded = true;
            data.childFolders.forEach((child) => {
              newState.byFolderId[child.id] = {
                name: child.name,
                parentId: folderId,
                childIds: [],
                fileChildIds: [],
                isExpanded: false,
                childrenLoaded: false,
                Path: newState.byFolderId[folderId].Path + " > " + child.name,
                createdTime: formatDate(child.createdAt),
              };
            });
            data.files.forEach((child) => {
              newState.byFileId[child.id] = {
                name: child.name,
                parentId: folderId,
                Path: newState.byFolderId[folderId].Path + " > " + child.name,
                createdTime: formatDate(child.createdAt),
                uploadPath: child.uploadPath,
                size: formatFileSize(child.size),
                Opened: false,
              };
            });

            return newState;
          });
        })
        .catch((error) => console.error(error));
    },
    [Auth?.userId, token, folderHiearchy]
  );
  const showChildren = (folderId) => {
    if (
      !folderHiearchy.byFolderId[folderId] ||
      !folderHiearchy.byFolderId[folderId].childIds
    ) {
      return null;
    }
    return (
      <>
        {folderHiearchy.byFolderId[folderId].childIds.map((childId) => (
          <div key={childId} className="flex-col border-l ml-4 pr-0 w-auto">
            {" "}
            <div
              className={`flex text-xs gap-2 mt-2 items-center p-1 cursor-pointer transition-all duration-100 truncate hover:text-[#52b2f9] ${
                activeFolder == childId
                  ? `border-l-4 bg-secondary border-l-[#52b2f9]`
                  : ""
              }`}
              onClick={() => {
                setActiveFolder(childId);
                handleArrowState(childId);
                if (!folderHiearchy.byFolderId[childId]?.childrenLoaded) {
                  LoadChildren(childId);
                }
              }}
            >
              <div
                className={`transform transition-transform duration-300 min-w-4 ${
                  folderHiearchy.byFolderId[childId]?.isExpanded
                    ? "rotate-90"
                    : ""
                }`}
              >
                <ChevronRight className="h-3 w-3" />
              </div>
              <p className="truncate text-ellipsis overflow-hidden">
                {folderHiearchy.byFolderId[childId]?.name}
              </p>
            </div>
            {folderHiearchy.byFolderId[childId]?.isExpanded &&
              folderHiearchy.byFolderId[childId]?.childrenLoaded &&
              showChildren(childId)}
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (rootFolder?.id && Auth?.userId) {
      LoadChildren(rootFolder.id);
    }
  }, [rootFolder?.id, Auth?.userId, LoadChildren]);
  if (loadingFolders) {
    return (
      <div className="flex w-full h-full flex-col">
        <div className="w-[15%] border-r h-full p-6 flex flex-col gap-2">
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          ></AlertDialog>
          <AlertDialog
            open={FileDialogOpen}
            onOpenChange={setFileDialogOpen}
          ></AlertDialog>
          <div className="flex items-center justify-center mt-4">
            <p>Loading folders...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full h-full ">
      <div className="w-[15%] border-r h-full p-6 flex flex-col gap-2">
        <AlertDialog open={FolderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <AlertDialogTrigger asChild className="text-xs">
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FolderPlus className="h-4 w-4" />
              <p>New Folder</p>
            </button>
          </AlertDialogTrigger>
          <AddFolder
            onClose={() => setFolderDialogOpen(false)}
            id={activeFolder}
            setFolderHiearchy={setFolderHiearchy}
          />
        </AlertDialog>
        <AlertDialog open={FileDialogOpen} onOpenChange={setFileDialogOpen}>
          <AlertDialogTrigger asChild className="text-xs">
            <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
              <FilePlus className="h-4 w-4" />
              <p>New File</p>
            </button>
          </AlertDialogTrigger>
          <AddFile
            onClose={() => setFileDialogOpen(false)}
            id={activeFolder}
            setFolderHiearchy={setFolderHiearchy}
          />
        </AlertDialog>
        {activeFolder != rootFolder.id ? (
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          >
            <AlertDialogTrigger asChild className="text-xs">
              <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
                <Share2 className="h-4 w-4" />
                <p>Share Folder</p>
              </button>
            </AlertDialogTrigger>
            <ShareFolder onClose={() => setFolderDialogOpen(false)} />
          </AlertDialog>
        ) : (
          ""
        )}
        {activeFolder != rootFolder.id ? (
          <AlertDialog
            open={FolderDialogOpen}
            onOpenChange={setFolderDialogOpen}
          >
            <AlertDialogTrigger asChild className="text-xs">
              <button className="flex gap-3 text-sm items-center p-2 border rounded-sm bg-secondary hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9] w-full">
                <Trash2 className="h-4 w-4" />
                <p>Delete Folder</p>
              </button>
            </AlertDialogTrigger>
            <DeleteFolder
              onClose={() => setFolderDialogOpen(false)}
              activeFolder={activeFolder}
              userId={Auth.userId}
              setFolderHiearchy={setFolderHiearchy}
              setActiveFolder={setActiveFolder}
            />
          </AlertDialog>
        ) : (
          ""
        )}
        <div className="flex-col w-full max-w-full ">
          <div
            className={`flex text-xs gap-3 mt-4 items-center  p-2  cursor-pointer transition-all duration-100 w-full max-w-full ${
              activeFolder == rootFolder.id
                ? ` border-l-5 bg-secondary border-l-[#52b2f9]`
                : ""
            }`}
            onClick={() => {
              handleArrowState(rootFolder.id);
              setActiveFolder(rootFolder.id);
            }}
          >
            <div
              className={`transform transition-transform duration-300 max-w-full ${
                folderHiearchy.byFolderId[rootFolder.id].isExpanded
                  ? "rotate-90"
                  : ""
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </div>
            <p className="hover:text-[#52b2f9] ">{rootFolder.name}</p>
          </div>
          {folderHiearchy.byFolderId[rootFolder.id].isExpanded
            ? showChildren(rootFolder.id)
            : ""}
        </div>
      </div>
      <div className="p-6 w-full">
        <p className="text-sm text-[#52b2f9]">
          {folderHiearchy.byFolderId[activeFolder].Path.split(" > ").map(
            (segment, index, array) => (
              <React.Fragment key={index}>
                <span className="text-[#52b2f9]">{segment}</span>
                {index < array.length - 1 && (
                  <span className="text-primary"> &gt; </span>
                )}
              </React.Fragment>
            )
          )}
        </p>
        <div className="flex items-center w-full mt-2 text-sm">
          <div className=" w-[60%] hover:bg-secondary p-3 rounded-sm cursor-pointer ">
            Name
          </div>
          <div className=" w-[20%] hover:bg-secondary p-3 rounded-sm cursor-pointer ">
            Size
          </div>
          <div className=" w-[20%] hover:bg-secondary p-3 rounded-sm cursor-pointer">
            Created
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2 text-xs">
          {folderHiearchy.byFolderId[activeFolder].childIds.map((folderId) => (
            <div
              className="bg-secondary rounded-sm w-full flex border hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9]"
              key={folderId}
              onClick={() => {
                setActiveFolder(folderId);
                handleArrowState(folderId);
                if (!folderHiearchy.byFolderId[folderId]?.childrenLoaded) {
                  LoadChildren(folderId);
                }
              }}
            >
              <div className="flex gap-2 w-[60%] p-3">
                <Folder className="w-4 h-4" />
                <p>{folderHiearchy.byFolderId[folderId].name}</p>
              </div>
              <div className="w-[20%] p-3">
                <p>--</p>
              </div>
              <div className="w-[20%] p-3">
                <p>
                  {formatDate(folderHiearchy.byFolderId[folderId].createdTime)}
                </p>
              </div>
            </div>
          ))}
          {folderHiearchy.byFolderId[activeFolder].fileChildIds.map(
            (fileId) => (
              <div
                className="bg-secondary rounded-sm w-full flex border hover:bg-[#1f3c56] cursor-pointer hover:border-[#2d6090] hover:text-[#52b2f9]"
                key={fileId}
                onClick={() => handleOpenedState(fileId)}
              >
                <div className="flex gap-2 w-[60%] p-3">
                  <File className="w-4 h-4" />
                  <p>{folderHiearchy.byFileId[fileId].name}</p>
                </div>
                <div className="w-[20%] p-3">
                  <p>{folderHiearchy.byFileId[fileId].size}</p>
                </div>
                <div className="w-[20%] p-3">
                  <p>
                    {formatDate(folderHiearchy.byFileId[fileId].createdTime)}
                  </p>
                </div>
                {folderHiearchy.byFileId[fileId].Opened &&
                  handleFileDetails(fileId)}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
